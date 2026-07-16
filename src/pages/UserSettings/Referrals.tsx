import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import referralsImg from '../../assets/earncoins.png';
import { IconCoin } from '../../components/Icons/IconCoin';
import { Loading } from '../../components/Loading';
import { applyReferalCode } from '../../http';
import { CopyInput } from '../../components/CopyInput';
import { useTranslation } from '../../i18n/useTranslation';

interface Props {
  id: string;
}

type Inputs = {
  referrerId: string;
};

export function Referrals({ id }: Props) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit } = useForm<Inputs>();

  const onSubmit: SubmitHandler<Inputs> = ({ referrerId }) => {
    setLoading(true);
    applyReferalCode(referrerId)
      .then(() => toast.success(t('userSettingsReferrals.toastSuccess')))
      .catch(() => toast.error(t('userSettingsReferrals.toastError')))
      .finally(() => setLoading(false));
  };
  return (
    <div className="referrals flex flex-col items-center">
      <img className="mb-8" src={referralsImg} alt="" />
      <div className="text-center font-semibold mb-8 text-[16px]">
        {t('userSettingsReferrals.giftFriends')}{' '}
        <span className="relative inline-flex mr-[25px]">
          25
          <div className="absolute right-[-22px]">
            <IconCoin />
          </div>
        </span>
        {t('userSettingsReferrals.andReceive')}{' '}
        <span className="relative inline-flex mr-[25px]">
          25
          <div className="absolute right-[-22px]">
            <IconCoin />
          </div>
        </span>
        {t('userSettingsReferrals.sendInvite')}
      </div>
      <div className="text-center text-[16px] mb-4">
        {t('userSettingsReferrals.yourInvitationCode')}
      </div>
      <div className="max-w-[512px] w-full mb-8">
        <CopyInput value={id} />
      </div>
      <div className="text-regular font-semibold mb-4">
        {t('userSettingsReferrals.orEnterReferral')}
      </div>
      <div className="max-w-[512px] w-full mb-8">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="">
          <input
            type="text"
            placeholder={t('userSettingsReferrals.referralPlaceholder')}
            className="w-full bg-[#F5F7F9] rounded-xl px-[12px] py-[16px] placeholder:text-[#8C8C8C] outline-none mb-8"
            {...register('referrerId', { required: true })}
          />
          </div>
          <button className="w-full hover:bg-brand-darker py-[12px] rounded-xl bg-brand-500 text-white">{t('userSettingsReferrals.earnCoinsButton')}</button>
        </form>
      </div>
      {loading && <Loading />}
    </div>
  );
}
