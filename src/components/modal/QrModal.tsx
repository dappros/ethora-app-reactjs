import { Dialog, DialogPanel } from '@headlessui/react';
import QRCode from 'react-qr-code';

import './QrModal.scss';
import { CopyInput } from '../CopyInput';
import { IconClose } from '../Icons/IconClose';

interface Props {
  onClose: () => void;
  path: string;
}

export function QrModal({ onClose, path }: Props) {
  return (
    <Dialog className="qr-modal" open={true} onClose={onClose}>
      <DialogPanel className="inner">
        <div className="qr">
          <QRCode value={path} />
        </div>
        <div>
          <CopyInput value={path} />
        </div>
        <button className="close" onClick={() => onClose()}>
          <IconClose />
        </button>
      </DialogPanel>
    </Dialog>
  );
}
