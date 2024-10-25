import { Dialog, DialogPanel } from '@headlessui/react';
import QRCode from 'react-qr-code';
import { IconClose } from '../Icons/IconClose';

import { TextInput } from '../ui/TextInput';
import './QrModal.scss';

interface Props {
  onClose: () => void;
  walletAddress: string;
}

export function QrModal({ onClose, walletAddress }: Props) {
  let url = `${window.location.origin}/public/${walletAddress}`;

  return (
    <Dialog className="qr-modal" open={true} onClose={onClose}>
      <DialogPanel className="inner">
        <div className="qr">
          <QRCode value={url} />
        </div>
        <div>
          <TextInput value={url} className="gen-input gen-input-large mt-16" />
        </div>
        <button className="close" onClick={() => onClose()}>
          <IconClose />
        </button>
      </DialogPanel>
    </Dialog>
  );
}
