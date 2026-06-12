// Ethora.com platform, copyright: Dappros Ltd (c) 2026, all rights reserved

import { Dialog, DialogPanel } from '@headlessui/react';
import { FC, ReactNode } from 'react';
import { IconClose } from '../Icons/IconClose';

interface Props {
  title: string;
  // ReactNode rather than string so callers can embed bold counts
  // ("5 users, 3 chats will be permanently deleted") without each consumer
  // re-implementing the dialog shell.
  message: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  danger?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

// Generic confirm/cancel dialog. We already had DeleteAppModal hard-wired to
// the App delete flow; this is the same shape but parameterized so the new
// archive / hard-delete / restore prompts can reuse it without each one
// shipping its own modal file.
export const ConfirmModal: FC<Props> = ({
  title,
  message,
  confirmLabel,
  cancelLabel = 'Cancel',
  danger = false,
  busy = false,
  onConfirm,
  onCancel,
}) => {
  return (
    <Dialog
      open
      onClose={busy ? () => {} : onCancel}
      className="fixed inset-0 z-50 flex justify-center items-center bg-black/50 transition duration-300"
    >
      <DialogPanel className="p-4 sm:py-8 sm:px-[20px] bg-white rounded-3xl w-full max-w-[600px] m-8 relative">
        {!busy && (
          <button
            className="absolute top-[15px] right-[15px]"
            onClick={onCancel}
            aria-label="Close"
          >
            <IconClose />
          </button>
        )}
        <div className="font-varela text-[18px] md:text-[20px] text-center mt-4 mb-3">
          {title}
        </div>
        <div className="font-sans text-sm text-gray-700 text-center mb-8 whitespace-pre-line">
          {message}
        </div>
        <div className="flex gap-4">
          <button
            disabled={busy}
            className="w-full py-3 rounded-xl border border-brand-500 text-brand-500 hover:bg-brand-hover disabled:opacity-50"
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            disabled={busy}
            onClick={onConfirm}
            className={
              danger
                ? 'w-full py-3 hover:bg-red-300 p-2 border bg-red-400 border-red-800 rounded-xl text-white disabled:opacity-50'
                : 'w-full py-3 hover:bg-brand-darker p-2 border bg-brand-500 border-brand-darker rounded-xl text-white disabled:opacity-50'
            }
          >
            {busy ? 'Working...' : confirmLabel}
          </button>
        </div>
      </DialogPanel>
    </Dialog>
  );
};
