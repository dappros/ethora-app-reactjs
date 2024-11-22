import { Dialog, DialogPanel } from '@headlessui/react';
import { IconClose } from '../Icons/IconClose';

import { ReactNode } from 'react';

interface Props {
  onClose: () => void;
  children: ReactNode;
}

export function SubmitModal({ onClose, children }: Props) {
  return (
    <Dialog className="fixed inset-0 flex justify-center items-center bg-black/30" open={true} onClose={onClose}>
      <DialogPanel className="p-8 bg-white rounded-2xl relative w-full max-w-[640px] m-4">
        {children}
        <button className="absolute top-[36px] right-[36px]" onClick={() => onClose()}>
          <IconClose />
        </button>
      </DialogPanel>
    </Dialog>
  );
}
