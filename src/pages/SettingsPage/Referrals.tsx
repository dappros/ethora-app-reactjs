import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import referralsImg from '../../assets/illustration.png';
import { IconCoin } from '../../components/Icons/IconCoin';
import { Loading } from '../../components/Loading';
import { CopyInput } from '../../components/ui/CopyInput';
import { TextInput } from '../../components/ui/TextInput';
import { applyReferalCode } from '../../http';

interface Props {
  id: string;
}

type Inputs = {
  referrerId: string;
};

export function Referrals({ id }: Props) {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit } = useForm<Inputs>();

  const onSubmit: SubmitHandler<Inputs> = ({ referrerId }) => {
    setLoading(true);
    applyReferalCode(referrerId)
      .then(() => toast.success('Success'))
      .catch(() => toast.error('Error'))
      .finally(() => setLoading(false));
  };
  return (
    <div className="referrals">
      <img className="mb-32" src={referralsImg} alt="" />
      <div className="text-with-coins subtitle1 mb-32">
        Gift friends{' '}
        <span className="coin-span">
          25
          <IconCoin />
        </span>
        and receive{' '}
        <span className="coin-span">
          25
          <IconCoin />
        </span>
        . Send friends invite with your personal invitation code.
      </div>
      <div className="subtitle1 mb-16">Your invitation code</div>
      <div className="control mb-32">
        <CopyInput value={id} />
      </div>
      <div className="subtitle1 mb-16">
        Or enter your referral code to earn coins
      </div>
      <div className="control">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="control mb-16">
            <TextInput
              placeholder="Your referral code"
              className="gen-input gen-input-large mb-16"
              {...register('referrerId', { required: true })}
            />
          </div>
          <div className="control">
            <button className="gen-primary-btn">Earn Coins</button>
          </div>
        </form>
      </div>
      {loading && <Loading />}
    </div>
  );
}
