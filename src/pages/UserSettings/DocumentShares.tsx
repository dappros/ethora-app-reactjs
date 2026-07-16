import { Dialog, DialogPanel, Field, Select } from '@headlessui/react';
import { DateTime } from 'luxon';
import { useEffect, useState } from 'react';
import type { ChangeEvent } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import { toast } from 'react-toastify';
import { IconAdd } from '../../components/Icons/IconAdd';
import { IconClose } from '../../components/Icons/IconClose';
import { IconCopy } from '../../components/Icons/IconCopy';
import { IconDelete } from '../../components/Icons/IconDelete';
import { IconInfo } from '../../components/Icons/IconInfo';
import { IconQr } from '../../components/Icons/IconQr';
import { Loading } from '../../components/Loading';
import { QrModal } from '../../components/modal/QrModal';
import { SubmitModal } from '../../components/modal/SubmitModal';
import {
  createSharedLink,
  deleteSharedLink,
  getDocuments,
  getSharedLinks,
} from '../../http';
import { useTranslation } from '../../i18n/useTranslation';
import { ModelCurrentUser } from '../../models';
import { useAppStore } from '../../store/useAppStore';

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
  targetRecordId: string;
  documentName: string;
}

const HOUR = 60 * 60 * 1000;
const DAY = HOUR * 24;
const WEEK = DAY * 7;
const MONTH = WEEK * 4;

export function DocumentShares() {
  const { t } = useTranslation();
  const [showNew, setShowNew] = useState(false);
  const [items, setItems] = useState<Array<ModelProfileShare>>([]);
  const [showDelete, setShowDelete] = useState<ModelProfileShare>();
  const [showQr, setShowQr] = useState<ModelProfileShare>();
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState<Array<any>>([]);
  const user = useAppStore((s) => s.currentUser as ModelCurrentUser);
  const [expirationTime, setExpirationTime] = useState(-1);
  const [memo, setMemo] = useState('');
  const [documentForShare, setDocumentForShare] = useState<string>('');

  const onDelete = () => {
    setLoading(true);
    deleteSharedLink(showDelete?.token as string)
      .then(() => {
        toast.success(t('userSettingsDocumentShares.toastSuccess'));
        getItems();
        setShowDelete(undefined);
      })
      .catch((error) => {
        console.error(error);
        toast.error(t('userSettingsDocumentShares.toastError'));
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const componentGetDocs = async () => {
    const { data } = await getDocuments(user.defaultWallet.walletAddress);
    const items = data.results.filter(
      (el: { locations: unknown[] }) => el.locations[0]
    );
    setDocuments(items);
  };

  useEffect(() => {
    componentGetDocs();
  }, []);

  const getItems = () => {
    getSharedLinks().then(({ data }) => {
      const items = data.items.filter(
        (el: ModelProfileShare) => el.resource === 'document'
      );
      setItems(items);
    });
  };

  const renderExpiration = (exp: number) => {
    if (exp === -1) {
      return t('userSettingsDocumentShares.noExpirationValue');
    } else {
      return DateTime.fromMillis(exp).toFormat('dd LLL yyyy t');
    }
  };

  const doCreateNewLink = () => {
    const body: Record<string, string | number> = {
      memo: memo,
      resource: 'document',
    };

    if (expirationTime === -1) {
      body.expiration = -1;
    } else {
      body.expiration = Date.now() + expirationTime;
    }

    const documentArrayInfo = documentForShare.split(',');

    body.documentId = documentArrayInfo[0];
    body.documentName = documentArrayInfo[1];

    setLoading(true);
    createSharedLink(body)
      .then(() => {
        toast.success(t('userSettingsDocumentShares.toastSuccess'));
        setShowNew(false);
        getItems();
      })
      .catch(() => {
        toast.error(t('userSettingsDocumentShares.toastError'));
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    getItems();
  }, []);

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
            <DialogPanel className="p-8 bg-white grid grid-rows-[1fr,_48px]  rounded-2xl h-[calc(100vh-32px)] relative w-full max-w-[640px] m-4">
              <div className="grid overflow-auto grid-rows-[96px,_1fr]">
                <div>
                  <h2 className="font-varela text-[24px] text-center pl-2">
                    {t('userSettingsDocumentShares.modalTitle')}
                  </h2>
                </div>
                <div className="overflow-auto">
                  <p className="font-sans text-[14px] text-center mb-8">
                    {t('userSettingsDocumentShares.modalDescription')}
                  </p>
                  <div className="p-2 bg-[#F3F6FC] rounded-lg grid grid-cols-[16px,_1fr] gap-2 items-center mb-8">
                    <IconInfo />
                    <span className="text-[12px]">
                      {t('userSettingsDocumentShares.modalInfo')}
                    </span>
                  </div>

                  <h3 className="font-semibold text-[16px] text-left mb-4">
                    {t('userSettingsDocumentShares.expirationLabel')}
                  </h3>
                  <div className="text-[12px] text-[#8C8C8C] mb-4">
                    {t('userSettingsDocumentShares.expirationHint')}
                  </div>
                  <Field className="bg-[#F5F7F9] w-full py-[12px] px-[16px] rounded-xl mb-8">
                    <Select
                      className="w-full bg-[#F5F7F9]"
                      onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                        setExpirationTime(Number(e.target.value))
                      }
                    >
                      <option value="-1">
                        {t('userSettingsDocumentShares.optionNoExpiration')}
                      </option>
                      <option value={HOUR}>
                        {t('userSettingsDocumentShares.optionOneHour')}
                      </option>
                      <option value={DAY}>
                        {t('userSettingsDocumentShares.optionOneDay')}
                      </option>
                      <option value={WEEK}>
                        {t('userSettingsDocumentShares.optionOneWeek')}
                      </option>
                      <option value={MONTH}>
                        {t('userSettingsDocumentShares.optionOneMonth')}
                      </option>
                    </Select>
                  </Field>

                  <h3 className="font-semibold text-[16px] text-left mb-4">
                    {t('userSettingsDocumentShares.documentLabel')}
                  </h3>
                  <Field className="bg-[#F5F7F9] w-full py-[12px] px-[16px] rounded-xl mb-8">
                    <Select
                      className="w-full bg-[#F5F7F9]"
                      onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                        setDocumentForShare(e.target.value);
                      }}
                    >
                      <option value="-1">
                        {t('userSettingsDocumentShares.optionChooseDocument')}
                      </option>
                      {documents.map((el) => {
                        return (
                          <option
                            key={el._id}
                            value={[el._id, el.documentName]}
                          >
                            <span>
                              <span>{el.documentName}</span>
                            </span>
                          </option>
                        );
                      })}
                    </Select>
                  </Field>

                  <div className="font-semibold text-[16px] text-left mb-4">
                    {t('userSettingsDocumentShares.memoLabel')}
                  </div>
                  <div className="text-[12px] text-[#8C8C8C] mb-4">
                    {t('userSettingsDocumentShares.memoHint')}
                  </div>
                  <input
                    type="text"
                    onChange={(e) => setMemo(e.target.value)}
                    placeholder={t('userSettingsDocumentShares.memoPlaceholder')}
                    className="w-full bg-[#F5F7F9] rounded-xl px-[12px] py-[16px] placeholder:text-[#8C8C8C] outline-none mb-8"
                  />
                </div>
              </div>
              <div className="flex gap-8">
                <button
                  onClick={() => setShowNew(false)}
                  className="w-full rounded-xl border py-[12px] border-brand-500 text-brand-500"
                >
                  {t('userSettingsDocumentShares.cancelButton')}
                </button>
                <button
                  onClick={doCreateNewLink}
                  className="w-full py-[12px] rounded-xl bg-brand-500 text-white"
                >
                  {t('userSettingsDocumentShares.continueButton')}
                </button>
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

  const getDocumentId = (id: string) => {
    if (documents.length > 0) {
      const name = documents.filter((document) => document._id === id)[0]
        .documentName;

      return name;
    }
  };

  const renderItems = () => {
    if (items.length) {
      return (
        <div className="w-full overflow-auto hide-scroll">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#FCFCFC]">
                <th className="rounded-l-lg r-delimiter px-4 py-2 text-gray-500 font-normal font-inter text-xs text-left whitespace-nowrap">
                  {t('userSettingsDocumentShares.tableDocumentName')}
                </th>
                <th className="px-4 py-2 r-delimiter text-gray-500 font-normal font-inter text-xs text-left whitespace-nowrap">
                  {t('userSettingsDocumentShares.tableMemo')}
                </th>
                <th className="px-4 py-2 r-delimiter text-gray-500 font-normal font-inter text-xs text-left whitespace-nowrap">
                  {t('userSettingsDocumentShares.tableCreationDate')}
                </th>
                <th className="px-4 py-2 r-delimiter text-gray-500 font-normal font-inter text-xs text-left whitespace-nowrap">
                  {t('userSettingsDocumentShares.tableExpiredDate')}
                </th>
                <th className="rounded-r-lg  px-4 py-2 text-gray-500 font-normal font-inter text-xs text-center whitespace-nowrap">
                  {t('userSettingsDocumentShares.tableAction')}
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((el) => {
                return (
                  <tr key={el._id} className="hover:!bg-[#F5F7F9]">
                    <td className="px-4 r-delimiter py-[12px] font-sans font-normal text-sm rounded-l-xl whitespace-nowrap">
                      {/* {el.targetRecordId} */}
                      {getDocumentId(el.targetRecordId)}
                    </td>
                    <td className="px-4 r-delimiter py-[12px] font-sans font-normal text-sm whitespace-nowrap">
                      {el.memo ? el.memo : '-'}
                    </td>
                    <td className="px-4 r-delimiter py-[12px] font-sans font-normal text-sm whitespace-nowrap">
                      {DateTime.fromISO(el.createdAt).toFormat('dd LLL yyyy t')}
                    </td>
                    <td className="px-4 r-delimiter py-[12px] font-sans font-normal text-sm whitespace-nowrap">
                      {renderExpiration(Number(el.expiration))}
                    </td>
                    <td className="px-4 py-[12px] text-center font-sans font-normal text-sm whitespace-nowrap rounded-r-xl">
                      <div className="inline-flex justify-between">
                        <button
                          className="w-[32px] h-[32px] flex items-center justify center"
                          onClick={() => setShowQr(el)}
                        >
                          <IconQr />
                        </button>
                        <CopyToClipboard
                          text={`${import.meta.env.VITE_API}/docs/share/${el.token}`}
                          onCopy={() =>
                            toast.success(
                              t('userSettingsDocumentShares.toastCopied')
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
                  {t('userSettingsDocumentShares.deleteModalTitle')}
                </div>
                <p className="font-sans text-[14px] mb-8 text-center">
                  {t('userSettingsDocumentShares.deleteConfirm')}
                </p>
                <div className="flex gap-8">
                  <button
                    onClick={() => setShowDelete(undefined)}
                    className="rounded-xl border-brand-500 border max-w-[416px] w-full text-center text-brand-500 p-2"
                  >
                    {t('userSettingsDocumentShares.cancelButton')}
                  </button>
                  <button
                    onClick={() => onDelete()}
                    className="rounded-xl bg-red-600 border max-w-[416px] w-full text-center text-white p-2"
                  >
                    {t('userSettingsDocumentShares.submitButton')}
                  </button>
                  {loading && <Loading />}
                </div>
              </SubmitModal>
            )}
            {showQr && (
              <QrModal
                path={`${import.meta.env.VITE_API}/docs/share/${showQr.token}`}
                onClose={() => setShowQr(undefined)}
              ></QrModal>
            )}
          </table>
        </div>
      );
    }
  };

  return (
    <div className="document-shares md:ml-4">
      <div className="font-sans font-semibold text-[16px] mb-2">
        {t('userSettingsDocumentShares.heading')}
      </div>
      <div className="text-[#8C8C8C] text-[12px] mb-4">
        {t('userSettingsDocumentShares.description')}
      </div>
      <div className="border border-[#F0F0F0] rounded-xl p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="font-sans font-semibold text-[16px]">
            {t('userSettingsDocumentShares.listOfShares')}
          </div>
          <div className="">
            {' '}
            <button
              onClick={() => setShowNew(true)}
              className="flex items-center hover:bg-brand-darker justify-center md:w-[184px] p-2 h-[40px] w-[40px] bg-brand-500 rounded-xl text-white text-sm font-varela"
            >
              <IconAdd color="white" className="md:mr-2" />
              <span className="hidden md:block">
                {t('userSettingsDocumentShares.addNewShare')}
              </span>
            </button>
          </div>
        </div>
        {!items.length && (
          <div className="bg-[#F3F6FC] py-[16px] font-sans text-[14px] px-[16px] rounded-xl">
            {t('userSettingsDocumentShares.emptyState')}
          </div>
        )}
        {renderItems()}
      </div>
      {renderNewModal()}
    </div>
  );
}
