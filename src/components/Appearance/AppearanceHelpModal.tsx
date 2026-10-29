import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { useTranslation } from '../../i18n/useTranslation';
import { IconClose } from '../Icons/IconClose';

interface Props {
  onClose: () => void;
}

// "?" next to the Appearance section switch: what each part of the page does
// and how it is saved.
export function AppearanceHelpModal({ onClose }: Props) {
  const { t } = useTranslation();
  const sections = [
    {
      title: t('appSettingsAppearance.sectionSignIn'),
      body: t('appSettingsAppearance.helpSignInBody'),
    },
    {
      title: t('appSettingsAppearance.sectionChat'),
      body: t('appSettingsAppearance.helpChatBody'),
    },
    {
      title: t('appSettingsAppearance.previewHeading'),
      body: t('appSettingsAppearance.helpPreviewBody'),
    },
  ];

  return (
    <Dialog
      className="fixed inset-0 z-50 flex justify-center items-center bg-black/50"
      open={true}
      onClose={onClose}
    >
      <DialogPanel className="p-6 sm:p-8 bg-white rounded-3xl w-full max-w-[560px] m-4 relative max-h-[calc(100vh-32px)] overflow-y-auto">
        <button
          className="absolute top-[15px] right-[15px]"
          onClick={onClose}
          aria-label={t('appSettingsAppearance.helpClose')}
        >
          <IconClose />
        </button>
        <DialogTitle className="font-varela text-[20px] md:text-[24px] mb-2 pr-8">
          {t('appSettingsAppearance.helpTitle')}
        </DialogTitle>
        <p className="font-sans text-sm text-gray-500 mb-6">
          {t('appSettingsAppearance.helpIntro')}
        </p>
        <div className="flex flex-col gap-4 mb-8">
          {sections.map((s) => (
            <section key={s.title}>
              <h4 className="font-sans font-semibold text-sm mb-1">
                {s.title}
              </h4>
              <p className="font-sans text-sm leading-relaxed">{s.body}</p>
            </section>
          ))}
        </div>
        <button
          onClick={onClose}
          className="w-full py-[12px] rounded-xl bg-brand-500 text-white hover:bg-brand-darker"
        >
          {t('appSettingsAppearance.helpClose')}
        </button>
      </DialogPanel>
    </Dialog>
  );
}
