import { env } from '../../config/env';
import { useTranslation } from '../../i18n/useTranslation';

interface Props {
  callsEnabled: boolean;
  scheduledCallsEnabled: boolean;
  setCallsEnabled: (value: boolean) => void;
  setScheduledCallsEnabled: (value: boolean) => void;
}

// Per-App voice/video calls and scheduled calls, under Trust & Safety: an
// owner who does not want strangers calling each other can switch calls off
// for this App only. Saved with the page's Save button. The server's own
// calls switch (VITE_VIDEO_CALLS_ENABLED) still decides whether calls exist.
export function AppCallsSettings({ callsEnabled, scheduledCallsEnabled, setCallsEnabled, setScheduledCallsEnabled }: Props) {
  const { t } = useTranslation();
  const available = env.VITE_VIDEO_CALLS_ENABLED === 'true';
  return (
    <section className="mt-6 rounded-xl border border-gray-200 p-4" data-testid="app-calls-settings">
      <h3 className="font-semibold">{t('appCalls.title')}</h3>
      <p className="mt-1 text-sm text-gray-600">{t('appCalls.intro')}</p>
      {!available && <p className="mt-2 rounded-lg bg-gray-100 p-3 text-sm text-gray-700 dark:bg-gray-800 dark:text-gray-300">{t('appCalls.unavailable')}</p>}
      <div className="mt-3 space-y-3">
        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            className="mt-1"
            checked={available && callsEnabled}
            disabled={!available}
            onChange={(e) => setCallsEnabled(e.target.checked)}
          />
          <span>
            <span className="block font-medium">{t('appCalls.calls')}</span>
            <span className="block text-gray-600">{t('appCalls.callsHint')}</span>
          </span>
        </label>
        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            className="mt-1"
            checked={available && callsEnabled && scheduledCallsEnabled}
            disabled={!available || !callsEnabled}
            onChange={(e) => setScheduledCallsEnabled(e.target.checked)}
          />
          <span>
            <span className="block font-medium">{t('appCalls.scheduled')}</span>
            <span className="block text-gray-600">{t('appCalls.scheduledHint')}</span>
          </span>
        </label>
      </div>
    </section>
  );
}
