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

// Operator-facing notice while a key is in its grace period (expired or
// stale): the install keeps the key's entitlements for now and will fall
// back to Ethora Core limits when the grace ends. Nothing is shown for a
// plain Core install; that is a normal state. Admins on the base app only.
export function LicenseBanner() {
  const { t } = useTranslation();
  const location = useLocation();
  const isAdmin = useAppStore((s) => s.currentApp?.isAllowedNewAppCreate);
  const { status } = useLicenseStatus();

  if (!isAdmin || !isBaseAppHost()) return null;
  if (!status || status.state !== 'grace') return null;
  if (location.pathname.startsWith('/app/admin/license')) return null;

  const days = daysUntil(status.graceEndsAt, status.serverTime);
  const reasonText = t(`licenseReason.${status.reason}`);
  const headline = days !== null ? t('licenseBanner.graceDays').replace('{days}', String(days)) : t('licenseBanner.grace');

  return (
    <div
      role="status"
      className={cn(
        'mb-2 md:mb-4 rounded-xl px-4 py-2 text-sm flex flex-col md:flex-row md:items-center gap-1 md:gap-3',
        'bg-amber-50 text-amber-900 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-200 dark:border-amber-800/60'
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
