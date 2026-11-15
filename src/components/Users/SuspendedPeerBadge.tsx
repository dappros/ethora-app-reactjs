// Ethora.com platform, copyright: Dappros Ltd (c) 2026, all rights reserved
//
// "Suspended" badge next to another person's name (docs/TRUST_AND_SAFETY.md
// section 16). Shown from the public `suspended: true` flag the API adds to
// other users while their account is suspended; it never shows the reason
// or the dates.
import cn from 'classnames';
import { useTranslation } from '../../i18n/useTranslation';

export function SuspendedPeerBadge({ className }: { className?: string }) {
  const { t } = useTranslation();
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center px-2 py-0.5 rounded-2xl text-xs font-normal bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300',
        className
      )}
      title={t('peerSuspension.badgeTitle')}
      data-testid="peer-suspended-badge"
    >
      {t('peerSuspension.badge')}
    </span>
  );
}
