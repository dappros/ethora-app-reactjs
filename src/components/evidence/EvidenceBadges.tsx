// Ethora.com platform, copyright: Dappros Ltd (c) 2026, all rights reserved
//
// Small chips shared by the evidence list and the case view: the retention
// badge (expires in N days / on hold / purged), the reason and the mode.
import cn from 'classnames';
import { useTranslation } from '../../i18n/useTranslation';
import type { EvidenceCase } from '../../models';
import { retentionState, retentionText } from '../../utils/evidence';
import { useEvidenceLabel as useLabel } from './hooks';

const CHIP = 'inline-flex items-center px-2 py-0.5 rounded-2xl text-xs whitespace-nowrap';

export function RetentionBadge({ item, now }: { item: Pick<EvidenceCase, 'purgedAt' | 'hold' | 'expiresAt'>; now?: number }) {
  const { t } = useTranslation();
  const state = retentionState(item, now);
  return (
    <span
      className={cn(
        CHIP,
        state.kind === 'purged' && 'bg-gray-100 text-gray-600 line-through decoration-gray-400',
        state.kind === 'hold' && 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300',
        state.kind === 'none' && 'bg-gray-100 text-gray-600',
        state.kind === 'expired' && 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300',
        state.kind === 'expires' &&
          (state.soon
            ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
            : 'bg-gray-100 text-gray-700')
      )}
    >
      {retentionText(state, t)}
    </span>
  );
}

export function ReasonChip({ reason }: { reason?: string | null }) {
  const label = useLabel();
  if (!reason) return null;
  return <span className={cn(CHIP, 'bg-brand-150 text-brand-500 font-semibold')}>{label('evidence.reason', reason)}</span>;
}

export function ModeChip({ mode }: { mode?: string | null }) {
  const label = useLabel();
  if (!mode) return null;
  return <span className={cn(CHIP, 'bg-gray-100 text-gray-700')}>{label('evidence.mode', mode)}</span>;
}

export function ReportedChip({ targets }: { targets: string[] }) {
  const { t } = useTranslation();
  const label = useLabel();
  if (!targets.length) return null;
  const names = Array.from(new Set(targets.map((x) => label('evidence.target', x)))).join(', ');
  return (
    <span
      className={cn(CHIP, 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300 font-semibold')}
      title={t('evidence.reportedTitle').replace('{targets}', names)}
    >
      {t('evidence.reported')}
    </span>
  );
}
