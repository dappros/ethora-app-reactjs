import { Dialog, DialogPanel, Field, Select } from '@headlessui/react';
import { useEffect, useState } from 'react';
import type { ChangeEvent } from 'react';
import { toast } from 'react-toastify';
import { IconInfo } from '../../components/Icons/IconInfo';
import { Loading } from '../../components/Loading';
// import { Sorting } from '../../components/Sorting';
import { DateTime } from 'luxon';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { IconAdd } from '../../components/Icons/IconAdd';
import { IconClose } from '../../components/Icons/IconClose';
import { IconCopy } from '../../components/Icons/IconCopy';
import { IconDelete } from '../../components/Icons/IconDelete';
import { IconQr } from '../../components/Icons/IconQr';
import { QrModal } from '../../components/modal/QrModal';
import { SubmitModal } from '../../components/modal/SubmitModal';
import { createSharedLink, deleteSharedLink, getSharedLinks } from '../../http';
import { useTranslation } from '../../i18n/useTranslation';

const HOUR = 60 * 60 * 1000;
const DAY = HOUR * 24;
const WEEK = DAY * 7;
const MONTH = WEEK * 4;

interface ModelProfileShare {
  createdAt: string;
  updatedAt: string;
  expiration: string;
  memo: string;
  resource: string;
  token: string;
  userId: string;
  walletAddress: string;
  _id: string;
}

export function ProfileShares() {
  const { t } = useTranslation();
  const [showNew, setShowNew] = useState(false);
  const [expirationTime, setExpirationTime] = useState(-1);
  const [memo, setMemo] = useState('');
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Array<ModelProfileShare>>([]);
  const [showDelete, setShowDelete] = useState<ModelProfileShare>();
  const [showQr, setShowQr] = useState<ModelProfileShare>();

  const getItems = () => {
    getSharedLinks().then(({ data }) => {
      const items = data.items.filter((el: any) => el.resource === 'profile');
      setItems(items);
    });
  };

  useEffect(() => {
    getItems();
  }, []);

  const doCreateNewLink = () => {
    const body: any = {
      memo: memo,
      resource: 'profile',
    };

    if (expirationTime === -1) {
      body.expiration = -1;
    } else {
      body.expiration = Date.now() + expirationTime;
    }

    setLoading(true);
    createSharedLink(body)
      .then(() => {
        toast.success(t('userSettingsProfileShares.toastSuccess'));
        setShowNew(false);
        getItems();
      })
      .catch(() => {
        toast.error(t('userSettingsProfileShares.toastError'));
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const renderNewModal = () => {
    if (showNew) {
      return (
        <>
          <Dialog
            className="fixed inset-0 flex justify-center items-center bg-black/30"
            open={true}
            onClose={() => {
              setShowNew(false);
            }}
          >
            <DialogPanel className="p-8 bg-white rounded-2xl relative w-full max-w-[640px] m-4 flex flex-col items-center">
              <h2 className="font-varela text-[24px] mb-8 text-center pl-2">
                {t('userSettingsProfileShares.modalTitle')}
              </h2>
              <div className="max-w-[512px] w-full">
                <p className="font-sans text-[14px] text-center mb-8">
                  {t('userSettingsProfileShares.modalDescription')}
                </p>
                <div className="p-2 bg-[#F3F6FC] rounded-lg grid grid-cols-[16px,_1fr] gap-2 items-center mb-8">
                  <IconInfo />
                  <span className="text-[12px]">
                    {t('userSettingsProfileShares.modalInfo')}
                  </span>
                </div>

                <h3 className="font-semibold text-[16px] text-left mb-4">
                  {t('userSettingsProfileShares.expirationLabel')}
                </h3>
                <div className="text-[12px] text-[#8C8C8C] mb-4">
                  {t('userSettingsProfileShares.expirationHint')}
                </div>
                <Field className="bg-[#F5F7F9] w-full py-[12px] px-[16px] rounded-xl mb-8">
                  <Select
                    className="w-full bg-[#F5F7F9]"
                    onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                      setExpirationTime(Number(e.target.value))
                    }
                  >
                    <option value="-1">
                      {t('userSettingsProfileShares.optionNoExpiration')}
                    </option>
                    <option value={HOUR}>
                      {t('userSettingsProfileShares.optionOneHour')}
                    </option>
                    <option value={DAY}>
                      {t('userSettingsProfileShares.optionOneDay')}
                    </option>
                    <option value={WEEK}>
                      {t('userSettingsProfileShares.optionOneWeek')}
                    </option>
                    <option value={MONTH}>
                      {t('userSettingsProfileShares.optionOneMonth')}
                    </option>
                  </Select>
                </Field>
                <div className="font-semibold text-[16px] text-left mb-4">
                  {t('userSettingsProfileShares.memoLabel')}
                </div>
                <div className="text-[12px] text-[#8C8C8C] mb-4">
                  {t('userSettingsProfileShares.memoHint')}
                </div>
                <input
                  type="text"
                  onChange={(e) => setMemo(e.target.value)}
                  placeholder={t('userSettingsProfileShares.memoPlaceholder')}
                  className="w-full bg-[#F5F7F9] rounded-xl px-[12px] py-[16px] placeholder:text-[#8C8C8C] outline-none mb-8"
                />
                <div className="flex gap-8">
                  <button
                    onClick={() => setShowNew(false)}
                    className="w-full rounded-xl border py-[12px] border-brand-500 text-brand-500"
                  >
                    {t('userSettingsProfileShares.cancelButton')}
                  </button>
                  <button
                    onClick={doCreateNewLink}
                    className="w-full py-[12px] rounded-xl bg-brand-500 text-white"
                  >
                    {t('userSettingsProfileShares.continueButton')}
                  </button>
                </div>
              </div>

              {loading && <Loading />}
              <button
                className="absolute top-[24px] right-[24px] md:top-[32px] md:right-[32px]"
                onClick={() => setShowNew(false)}
              >
                <IconClose />
              </button>
            </DialogPanel>
          </Dialog>
        </>
      );
    }
  };

  const renderExpiration = (exp: number) => {
    if (exp === -1) {
      return t('userSettingsProfileShares.noExpirationValue');
    } else {
      return DateTime.fromMillis(exp).toFormat('dd LLL yyyy t');
    }
  };

  const onDelete = () => {
    setLoading(true);
    deleteSharedLink(showDelete?.token as string)
      .then(() => {
        toast.success(t('userSettingsProfileShares.toastSuccess'));
        getItems();
        setShowDelete(undefined);
      })
      .catch((_) => {
        toast.error(t('userSettingsProfileShares.toastError'));
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const renderItems = () => {
    if (items.length) {
      return (
        <div className="w-full overflow-auto hide-scroll">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#FCFCFC]">
                <th className="rounded-l-lg r-delimiter px-4 py-2 text-gray-500 font-normal font-inter text-xs text-left whitespace-nowrap">
                  {t('userSettingsProfileShares.tableMemo')}
                </th>
                <th className="px-4 py-2 r-delimiter text-gray-500 font-normal font-inter text-xs text-left whitespace-nowrap">
                  {t('userSettingsProfileShares.tableCreationDate')}
                </th>
                <th className="px-4 py-2 r-delimiter text-gray-500 font-normal font-inter text-xs text-left whitespace-nowrap">
                  {t('userSettingsProfileShares.tableExpiredDate')}
                </th>
                <th className="rounded-r-lg text-center px-4 py-2 text-gray-500 font-normal font-inter text-xs whitespace-nowrap">
                  {t('userSettingsProfileShares.tableAction')}
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((el) => {
                return (
                  <tr key={el._id} className="hover:!bg-[#F5F7F9]">
                    <td className="px-4 r-delimiter py-[12px] font-sans font-normal text-sm rounded-l-xl whitespace-nowrap">
                      {el.memo ? el.memo : '-'}
                    </td>
                    <td className="px-4 r-delimiter py-[12px] font-sans font-normal text-sm whitespace-nowrap">
                      {DateTime.fromISO(el.createdAt).toFormat('dd LLL yyyy t')}
                    </td>
                    <td className="px-4 r-delimiter py-[12px] font-sans font-normal text-sm whitespace-nowrap">
                      {renderExpiration(Number(el.expiration))}
                    </td>
                    <td className="px-4 py-[12px] font-sans font-normal text-sm rounded-r-xl text-center whitespace-nowrap">
                      <div className="inline-flex justify-between">
                        <button
                          className="w-[32px] h-[32px] flex items-center justify center"
                          onClick={() => setShowQr(el)}
                        >
                          <IconQr />
                        </button>
                        <div></div>
                        <CopyToClipboard
                          text={`${window.location.origin}/public/${el.walletAddress}/${el.token}`}
                          onCopy={() =>
                            toast.success(
                              t('userSettingsProfileShares.toastCopied')
                            )
                          }
                        >
                          <button className="w-[32px] h-[32px] flex items-center justify center">
                            <IconCopy />
                          </button>
                        </CopyToClipboard>
                        <button
                          className="w-[32px] h-[32px] flex items-center justify center"
                          onClick={() => setShowDelete(el)}
                        >
                          <IconDelete />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {showDelete && (
              <SubmitModal onClose={() => setShowDelete(undefined)}>
                <div className="font-varela text-[24px] text-center mb-8">
                  {t('userSettingsProfileShares.deleteModalTitle')}
                </div>
                <p className="font-sans text-[14px] mb-8 text-center">
                  {t('userSettingsProfileShares.deleteConfirm')}
                </p>
                <div className="flex gap-8">
                  <button
                    onClick={() => setShowDelete(undefined)}
                    className="rounded-xl border-brand-500 border max-w-[416px] w-full text-center text-brand-500 p-2"
                  >
                    {t('userSettingsProfileShares.cancelButton')}
                  </button>
                  <button
                    onClick={onDelete}
                    className="rounded-xl bg-red-600 border max-w-[416px] w-full text-center text-white p-2"
                  >
                    {t('userSettingsProfileShares.submitButton')}
                  </button>
                  {loading && <Loading />}
                </div>
              </SubmitModal>
            )}
            {showQr && (
              <QrModal
                path={`${window.location.origin}/public/${showQr.walletAddress}/${showQr.token}`}
                onClose={() => setShowQr(undefined)}
              ></QrModal>
            )}
          </table>
        </div>
      );
    }
  };

  return (
    <div className="md:ml-4">
      <div className="font-sans font-semibold text-[16px] mb-2">
        {t('userSettingsProfileShares.heading')}
      </div>
      <div className="text-[#8C8C8C] text-[12px] mb-4">
        {t('userSettingsProfileShares.description')}
      </div>
      <div className="border border-[#F0F0F0] rounded-xl p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="font-sans font-semibold text-[16px]">
            {t('userSettingsProfileShares.listOfShares')}
          </div>
          <div className="">
            <button
              onClick={() => setShowNew(true)}
              className="flex items-center hover:bg-brand-darker justify-center md:w-[184px] p-2 h-[40px] w-[40px] bg-brand-500 rounded-xl text-white text-sm font-varela"
            >
              <IconAdd color="white" className="md:mr-2" />
              <span className="hidden md:block">
                {t('userSettingsProfileShares.addNewShare')}
              </span>
            </button>
          </div>
        </div>

        {!items.length && (
          <div className="bg-[#F3F6FC] py-[16px] font-sans text-[14px] px-[16px] rounded-xl">
            {t('userSettingsProfileShares.emptyState')}
          </div>
        )}

        {renderItems()}
      </div>
      {renderNewModal()}
    </div>
  );
}
