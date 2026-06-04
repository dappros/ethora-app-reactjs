import { Dialog, DialogPanel } from '@headlessui/react';
import { IconClose } from '../Icons/IconClose';
import { HubspotForm } from './SettingsTutorialModal/components/HubspotForm';

interface Props {
  onClose: () => void;
}

export function BookACallModal({ onClose }: Props) {
  return (
    <Dialog
      className="fixed inset-0 z-50 flex justify-center items-center bg-black/50"
      open={true}
      onClose={onClose}
    >
      <DialogPanel className="relative bg-white rounded-3xl m-8 p-6 md:p-8 w-[90%] md:w-[560px] max-h-[90vh] overflow-y-auto">
        <button
          className="absolute top-[20px] right-[20px]"
          onClick={onClose}
          aria-label="Close"
        >
          <IconClose />
        </button>
        <div className="font-varela text-[20px] md:text-[24px] mb-4 pr-8">
          Book a call
        </div>
        {/* HubspotForm handles the "not configured on this install" case
            internally with a friendly message + email fallback, so we
            always render the same form here and on the tutorial-modal
            Demo step - consistent UI across all entry points. */}
        <HubspotForm />
      </DialogPanel>
    </Dialog>
  );
}
