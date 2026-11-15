// Ethora.com platform, copyright: Dappros Ltd (c) 2026, all rights reserved
//
// Small pieces shared by the tabs of the T&S hub: the pager, the App filter
// and the refresh button.
import { useTranslation } from '../../../i18n/useTranslation';

export const SELECT = 'rounded-xl bg-gray-100 outline-none py-2 px-3 text-sm font-sans';
export const BUTTON = 'rounded-xl px-3 py-1.5 text-sm border disabled:opacity-50';
export const BUTTON_PLAIN = `${BUTTON} border-gray-300 text-gray-800 hover:bg-gray-50`;
export const BUTTON_DANGER = `${BUTTON} border-red-400 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30`;

export function RefreshButton({ loading, onClick }: { loading: boolean; onClick: () => void }) {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="self-start shrink-0 rounded-xl border border-brand-500 text-brand-500 hover:bg-brand-hover px-4 py-2 text-sm disabled:opacity-50"
    >
      {loading ? t('tsHub.loading') : t('tsHub.refresh')}
    </button>
  );
}

export function TabHeader({ title, intro, loading, onRefresh }: { title: string; intro?: string; loading?: boolean; onRefresh?: () => void }) {
  return (
    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
      <div className="min-w-0">
        <h2 className="font-varela text-[20px]">{title}</h2>
        {intro && <p className="text-sm text-gray-500 max-w-[760px]">{intro}</p>}
      </div>
      {onRefresh && <RefreshButton loading={Boolean(loading)} onClick={onRefresh} />}
    </div>
  );
}

interface PagerProps {
  offset: number;
  count: number;
  total: number | null;
  pageSize: number;
  loading: boolean;
  onOffset: (offset: number) => void;
}

/** "1 to 25 of 80" with Previous / Next; hidden when everything fits on one page. */
export function Pager({ offset, count, total, pageSize, loading, onOffset }: PagerProps) {
  const { t } = useTranslation();
  const from = count ? offset + 1 : 0;
  const to = offset + count;
  const hasNext = total !== null ? to < total : count === pageSize;
  if (!(offset > 0 || hasNext)) return null;
  return (
    <div className="mt-4 flex items-center justify-between gap-4 text-sm">
      <span className="text-gray-500 text-xs">
        {total !== null
          ? t('tsHub.range').replace('{from}', String(from)).replace('{to}', String(to)).replace('{total}', String(total))
          : t('tsHub.rangeOpen').replace('{from}', String(from)).replace('{to}', String(to))}
      </span>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={offset === 0 || loading}
          onClick={() => onOffset(Math.max(0, offset - pageSize))}
          className="rounded-xl border border-gray-300 px-3 py-1.5 disabled:opacity-50"
        >
          {t('tsHub.previous')}
        </button>
        <button
          type="button"
          disabled={!hasNext || loading}
          onClick={() => onOffset(offset + pageSize)}
          className="rounded-xl border border-gray-300 px-3 py-1.5 disabled:opacity-50"
        >
          {t('tsHub.next')}
        </button>
      </div>
    </div>
  );
}

export function AppFilter({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (appId: string) => void;
  options: Array<{ id: string; name: string }>;
}) {
  const { t } = useTranslation();
  const list = value && !options.some((o) => o.id === value) ? [{ id: value, name: value }, ...options] : options;
  return (
    <select aria-label={t('tsHub.filter.app')} className={`${SELECT} max-w-[240px]`} value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">{t('tsHub.filter.allApps')}</option>
      {list.map((a) => (
        <option key={a.id} value={a.id}>
          {a.name}
        </option>
      ))}
    </select>
  );
}
