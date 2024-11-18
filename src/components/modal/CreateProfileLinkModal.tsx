import { Dialog, DialogPanel } from '@headlessui/react';
import { IconClose } from '../Icons/IconClose';

import { ReactNode } from 'react';
import './CreateProfileLinkModal.scss';

interface Props {
  onClose: () => void;
  children: ReactNode;
}

export function CreateProfileLinkModal({ onClose, children }: Props) {
  return (
    <Dialog
      className="create-profile-link-modal"
      open={true}
      onClose={() => {}}
    >
      <DialogPanel className="inner">
        {children}
        <button className="close" onClick={() => onClose()}>
          <IconClose />
        </button>
      </DialogPanel>
    </Dialog>
  );
}
