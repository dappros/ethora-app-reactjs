import { Dialog, DialogPanel } from '@headlessui/react';
import { IconClose } from '../Icons/IconClose';
import { HubspotForm } from './SettingsTutorialModal/components/HubspotForm';

interface Props {
  onClose: () => void;
}

export function BookACallModal({ onClose }: Props) {
  const hubspotConfigured =
    String(import.meta.env.VITE_HUBSPOT_ENABLED || '').toLowerCase() ===
      'true' &&
    !!String(import.meta.env.VITE_HUBSPOT_PORTAL_ID || '').trim() &&
    !!String(import.meta.env.VITE_HUBSPOT_FORM_ID_TUTORIAL || '').trim();

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
        {hubspotConfigured ? (
          <HubspotForm />
        ) : (
          <div className="font-sans text-sm text-gray-700">
            <p className="mb-4">
              Online booking isn't configured on this install yet. In the
              meantime, drop us a line and we'll get back to you to schedule
              a call.
            </p>
            <a
              href="mailto:hello@ethora.com?subject=Book%20a%20call%20with%20the%20Ethora%20team"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-500 text-white hover:bg-brand-darker font-sans text-sm"
            >
              Email hello@ethora.com
            </a>
          </div>
        )}
      </DialogPanel>
    </Dialog>
  );
}
