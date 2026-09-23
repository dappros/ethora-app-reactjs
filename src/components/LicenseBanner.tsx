import cn from 'classnames';
import { NavLink, useLocation } from 'react-router-dom';
import { useLicenseStatus } from '../hooks/useLicenseStatus';
import { useTranslation } from '../i18n/useTranslation';
import { useAppStore } from '../store/useAppStore';
import { isBaseAppHost } from '../utils/appHost';

function daysUntil(iso: string | null, nowIso?: string) {
  if (!iso) return null;
  const now = nowIso ? new Date(nowIso).getTime() : Date.now();
  return Math.max(0, Math.ceil((new Date(iso).getTime() - now) / 86400000));
}

// Operator-facing notice for the grace / restricted license states. Shown to
// admins on the base app only; end users of tenant apps never see it, since
// they cannot act on it.
export function LicenseBanner() {
  const { t } = useTranslation();
  const location = useLocation();
  const isAdmin = useAppStore((s) => s.currentApp?.isAllowedNewAppCreate);
  const { status } = useLicenseStatus();

  if (!isAdmin || !isBaseAppHost()) return null;
  if (!status || status.state === 'licensed') return null;
  if (location.pathname.startsWith('/app/admin/license')) return null;

  const restricted = status.state === 'restricted';
  const days = daysUntil(status.graceEndsAt, status.serverTime);
  const reasonText = t(`licenseReason.${status.reason}`);

  let headline: string;
  if (restricted) {
    headline = t('licenseBanner.restricted');
  } else if (days !== null) {
    headline = t('licenseBanner.graceDays').replace('{days}', String(days));
  } else {
    headline = t('licenseBanner.grace');
  }

  return (
    <div
      role="status"
      className={cn(
        'mb-2 md:mb-4 rounded-xl px-4 py-2 text-sm flex flex-col md:flex-row md:items-center gap-1 md:gap-3',
        restricted
          ? 'bg-red-50 text-red-800 border border-red-200 dark:bg-red-950/30 dark:text-red-200 dark:border-red-900/60'
          : 'bg-amber-50 text-amber-900 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-200 dark:border-amber-800/60'
      )}
    >
      <span className="font-semibold">{headline}</span>
      <span className="text-xs md:text-sm opacity-80">{reasonText}</span>
      <NavLink to="/app/admin/license" className="underline md:ml-auto whitespace-nowrap">
        {t('licenseBanner.manage')}
      </NavLink>
    </div>
  );
}
