import { Dialog, DialogPanel } from '@headlessui/react';
import { useGoogleTranslateFix } from '../../hooks/useGoogleTranslateFix';
import { useTranslation } from '../../i18n/useTranslation';
import { IconAdd } from '../Icons/IconAdd';
import { IconClose } from '../Icons/IconClose';

interface Props {
  show: boolean;
  onClose: () => void;
  onNewAgent: () => void;
}

const STEPS = ['create', 'knowledge', 'deploy'] as const;

export function AgentsTutorialModal({ show, onClose, onNewAgent }: Props) {
  const fixKey = useGoogleTranslateFix();
  const { t } = useTranslation();

  return (
    <Dialog
      key={fixKey}
      className="fixed inset-0 z-50 flex justify-center items-center bg-black/50 transition duration-300"
      open={show}
      onClose={onClose}
    >
      <DialogPanel className="p-4 sm:py-8 sm:px-[20px] bg-white rounded-3xl w-full max-w-[640px] m-8 relative">
        <button
          className="absolute top-[15px] right-[15px]"
          onClick={onClose}
          aria-label={t('agentsTutorialModal.close')}
        >
          <IconClose />
        </button>

        <div className="font-varela text-[18px] md:text-[24px] text-center mb-2">
          {t('agentsTutorialModal.title')}
        </div>
        <div className="text-sm text-gray-600 text-center mb-6">
          {t('agentsTutorialModal.subtitle')}
        </div>

        <ol className="space-y-3 mb-8">
          {STEPS.map((step, index) => (
            <li key={step} className="flex gap-3 rounded-2xl bg-gray-100 p-4">
              <span className="shrink-0 w-7 h-7 rounded-full bg-brand-500 text-white text-sm font-semibold flex items-center justify-center">
                {index + 1}
              </span>
              <span className="min-w-0">
                <span className="block font-semibold text-sm text-gray-900">
                  {t(`agentsTutorialModal.${step}.title`)}
                </span>
                <span className="block text-xs text-gray-600 mt-1">
                  {t(`agentsTutorialModal.${step}.text`)}
                </span>
              </span>
            </li>
          ))}
        </ol>

        <div className="flex justify-center">
          <button
            type="button"
            onClick={onNewAgent}
            className="flex items-center justify-center h-[40px] bg-brand-500 rounded-xl hover:bg-brand-darker text-white text-sm font-varela px-6"
          >
            <IconAdd color="white" className="mr-2" />
            <span>{t('adminAgents.newAgent')}</span>
          </button>
        </div>
      </DialogPanel>
    </Dialog>
  );
}
