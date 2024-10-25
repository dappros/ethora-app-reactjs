import { Dialog, DialogPanel } from '@headlessui/react';
import { IconClose } from '../Icons/IconClose';

import { ReactNode } from 'react';
import './SubmitModal.scss';

interface Props {
  onClose: () => void;
  children: ReactNode;
}

export function SubmitModal({ onClose, children }: Props) {
  return (
    <Dialog className="submit-modal" open={true} onClose={onClose}>
      <DialogPanel className="inner">
        {children}
        <button className="close" onClick={() => onClose()}>
          <IconClose />
        </button>
      </DialogPanel>
    </Dialog>
  );
}
