import { useSyncExternalStore } from 'react';
import { useTranslation } from '../i18n/useTranslation';
import { isNoticeVisible, subscribeNoticeVisible } from '../utils/serverNotice';
import { isReconnecting, subscribeReconnecting } from '../utils/serverRestart';

// Shown while a request waits for the server to come back (a restart from
// Server settings, an update). Non-blocking: the page stays usable. Hidden
// while the maintenance notice is on screen, which already says the server
// is restarting (the two never stack).
export function ReconnectingBanner() {
  const { t } = useTranslation();
  const reconnecting = useSyncExternalStore(subscribeReconnecting, isReconnecting, () => false);
  const noticeShown = useSyncExternalStore(subscribeNoticeVisible, isNoticeVisible, () => false);
  if (!reconnecting || noticeShown) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-2 left-1/2 -translate-x-1/2 z-[1000] max-w-[calc(100vw-32px)] rounded-full px-4 py-1.5 text-sm shadow bg-amber-50 text-amber-900 border border-amber-200 dark:bg-amber-900/80 dark:text-amber-100 dark:border-amber-700"
    >
      {t('server.reconnecting')}
    </div>
  );
}
