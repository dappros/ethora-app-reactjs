import { Dialog, DialogPanel } from '@headlessui/react';
import { useTranslation } from '../../i18n/useTranslation';
import { IconClose } from '../Icons/IconClose';
import './ReadyToCreateFirstAppModal.scss';

interface Props {
  onClose: () => void;
}

export function ReadyToCreateFirstAppModal({ onClose }: Props) {
  const { t } = useTranslation();

  return (
    <Dialog
      className="ready-to-create-first-app-modal"
      open={true}
      onClose={onClose}
    >
      <DialogPanel className="inner">
        <div className="img-div"></div>
        <div className="title">{t('readyToCreateFirstAppModal.title')}</div>
        <p>{t('readyToCreateFirstAppModal.description')}</p>
        <div className="buttons">
          <button className="gen-secondary-btn">
            {t('readyToCreateFirstAppModal.viewDemo')}
          </button>
          <button className="gen-primary-btn">
            {t('readyToCreateFirstAppModal.createApp')}
          </button>
        </div>
        <button className="close" onClick={() => onClose()}>
          <IconClose />
        </button>
      </DialogPanel>
    </Dialog>
  );
}
