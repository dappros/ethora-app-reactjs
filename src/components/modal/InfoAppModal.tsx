import { Dialog, DialogPanel } from '@headlessui/react';
import { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { IconClose } from '../Icons/IconClose';
import { useTranslation } from '../../i18n/useTranslation';

interface InfoAppModalProps {
  appName: string;
  domainName: string;
  primaryColor: string;
  navigate: ReturnType<typeof useNavigate>;
  appId: string;
  show: boolean;
  onClose: () => void;
}

const InfoAppModal: FC<InfoAppModalProps> = ({
  appName,
  domainName,
  navigate,
  appId,
  show,
  onClose,
}) => {
  const { t } = useTranslation();

  return (
    <Dialog
      className="fixed inset-0 z-50 flex justify-center items-center bg-black/50 transition duration-300"
      open={show}
      onClose={() => onClose()}
    >
      <DialogPanel className="p-4 sm:py-8 sm:px-8 bg-white rounded-3xl w-full max-w-[65%] m-8 relative">
        <button
          className="absolute top-[20px] right-[20px]"
          onClick={() => onClose()}
        >
          <IconClose />
        </button>

        <div className="font-varela text-[18px] md:text-[20px] mt-4 py-6">
          {t('infoAppModal.headerPrefix')}
          {appName}
          {t('infoAppModal.headerSuffix')}
        </div>

        <p className="font-sans text-[16px] font-semibold mb-2">
          {t('infoAppModal.step1Title')}
        </p>
        <p className="font-sans text-sm p-4 pl-5">
          {t('infoAppModal.step1OpenPrefix')}
          <button
            onClick={() => {
              navigate(`/app/admin/apps/${appId}/settings?tab=Appearance`, {
                state: { from: 'info', isNew: false },
              });
              onClose();
            }}
            className="text-blue-600 hover:underline cursor-pointer"
          >
            {t('infoAppModal.appearanceLink')}
          </button>
          {t('infoAppModal.step1Suffix')}
        </p>

        <p className="font-sans text-[16px] font-semibold mb-2">
          {t('infoAppModal.step2Title')}
        </p>
        <p className="font-sans text-sm p-4 pl-5">
          {t('infoAppModal.mainChatCreated')}
        </p>
        <p className="font-sans text-sm p-4 pl-5">
          {t('infoAppModal.manageChatsPrefix')}
          <button
            onClick={() => {
              navigate(`/app/admin/apps/${appId}/settings?tab=Chats`, {
                state: { from: 'info', isNew: false },
              });
              onClose();
            }}
            className="text-blue-600 hover:underline cursor-pointer"
          >
            {t('infoAppModal.chatsLink')}
          </button>
          {t('infoAppModal.manageChatsSuffix')}
        </p>

        <p className="font-sans text-[16px] font-semibold mb-2">
          {t('infoAppModal.step3Title')}
        </p>
        <p className="font-sans text-sm p-4 pl-5">
          {t('infoAppModal.tempUrlPrefix')}
          <a
            href={`https://${domainName}.ethora.com`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-brand-500"
          >
            {`${domainName}.ethora.com`}
          </a>
          <button
            onClick={() => {
              navigator.clipboard.writeText(`${domainName}.ethora.com`);
              toast.success(t('infoAppModal.copiedToClipboard'));
            }}
            className="ml-2 text-blue-600 hover:underline cursor-pointer"
          >
            {'📋 '}
            {t('infoAppModal.copy')}
          </button>
          {t('infoAppModal.tempUrlSuffix')}
        </p>

        <p className="font-sans text-sm p-4 pl-5">
          {t('infoAppModal.testAsEndUser')}
        </p>

        <p className="font-sans text-sm p-4 pl-5">
          {t('infoAppModal.moreFeatures')}
        </p>

        <p className="text-center font-sans text-[16px] font-semibold pt-4 pb-6">
          {t('infoAppModal.goodLuck')}
        </p>

        <div className="flex gap-4">
          <button
            className="w-full py-3 rounded-xl border border-brand-500 text-brand-500 hover:bg-brand-hover"
            onClick={onClose}
          >
            {t('infoAppModal.ok')}
          </button>
        </div>
      </DialogPanel>
    </Dialog>
  );
};

export default InfoAppModal;
