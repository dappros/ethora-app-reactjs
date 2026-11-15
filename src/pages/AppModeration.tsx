// Ethora.com platform, copyright: Dappros Ltd (c) 2026, all rights reserved
//
// App admin > Moderation (docs/TRUST_AND_SAFETY.md section 6): the queue of
// messages and media flagged by the automatic checks, the install's rules or
// moderators, with filters (open / resolved, kind, category), the moderator
// actions that apply to each item, and a shortcut to suspend the sender. The
// item cards are shared with the cross-App queue of the T&S hub
// (components/TrustSafety/ModerationQueueList.tsx).
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  ModerationFilterBar,
  ModerationQueueList,
  ModerationStatusFilter,
} from '../components/TrustSafety/ModerationQueueList';
import { httpGetAppTrustSafety, httpGetModerationItems } from '../http';
import { useTranslation } from '../i18n/useTranslation';
import { ModerationItem } from '../models';
import { accessErrorMessage } from '../utils/accessError';
import { apiError } from '../utils/apiError';

const PAGE_SIZE = 25;

export default function AppModeration() {
  const { t } = useTranslation();
  const { appId } = useParams();
  const [status, setStatus] = useState<ModerationStatusFilter>('open');
  const [kind, setKind] = useState('');
  const [category, setCategory] = useState('');
  const [offset, setOffset] = useState(0);
  const [items, setItems] = useState<ModerationItem[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  const [serviceOff, setServiceOff] = useState(false);

  const load = useCallback(async () => {
    if (!appId) return;
    setLoading(true);
    setError(null);
    try {
      const r = await httpGetModerationItems(appId, {
        status,
        kind: kind || undefined,
        category: category || undefined,
        limit: PAGE_SIZE,
        offset,
      });
      setItems(r.data?.items || []);
      setTotal(typeof r.data?.total === 'number' ? r.data.total : null);
      setUnavailable(false);
    } catch (e) {
      const info = apiError(e, '');
      if (info.status === 404) setUnavailable(true);
      else setError(accessErrorMessage(e, t));
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [appId, status, kind, category, offset, t]);

  useEffect(() => {
    void load();
  }, [load]);

  // Whether detection runs on this server (a note above an empty queue).
  useEffect(() => {
    if (!appId) return;
    httpGetAppTrustSafety(appId)
      .then((r) => setServiceOff(r.data?.enabled === false))
      .catch(() => setServiceOff(false));
  }, [appId]);

  const from = items.length ? offset + 1 : 0;
  const to = offset + items.length;
  const hasNext = total !== null ? to < total : items.length === PAGE_SIZE;

  return (
    <div className="h-full overflow-y-auto">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
        <div className="min-w-0">
          <div className="font-varela text-[24px]">{t('trustSafetyModeration.title')}</div>
          <p className="text-sm text-gray-500 max-w-[720px]">{t('trustSafetyModeration.intro')}</p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className="self-start shrink-0 rounded-xl border border-brand-500 text-brand-500 hover:bg-brand-hover px-4 py-2 text-sm disabled:opacity-50"
        >
          {loading ? t('trustSafetyModeration.loading') : t('trustSafetyModeration.refresh')}
        </button>
      </div>

      <ModerationFilterBar
        status={status}
        kind={kind}
        category={category}
        onChange={(patch) => {
          if (patch.status !== undefined) setStatus(patch.status);
          if (patch.kind !== undefined) setKind(patch.kind);
          if (patch.category !== undefined) setCategory(patch.category);
          setOffset(0);
        }}
      />

      {serviceOff && (
        <p className="mb-4 rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">{t('trustSafetyModeration.serviceOff')}</p>
      )}
      {unavailable && <div className="bg-brand-150 p-4 text-sm font-sans rounded-xl mb-4">{t('trustSafetyModeration.unavailable')}</div>}
      {error && (
        <p className="mb-4 text-sm text-red-600 dark:text-red-400">{t('trustSafetyModeration.loadFailed').replace('{error}', error)}</p>
      )}
      {!loading && !error && !unavailable && !items.length && (
        <div className="bg-brand-150 p-4 text-sm font-sans rounded-xl mb-4">
          {status === 'open' ? t('trustSafetyModeration.empty') : t('trustSafetyModeration.emptyResolved')}
        </div>
      )}

      <ModerationQueueList items={items} appIdOf={() => appId} onChanged={load} />

      {(offset > 0 || hasNext) && (
        <div className="mt-4 flex items-center justify-between gap-4 text-sm">
          <span className="text-gray-500 text-xs">
            {total !== null
              ? t('trustSafetyModeration.range').replace('{from}', String(from)).replace('{to}', String(to)).replace('{total}', String(total))
              : t('trustSafetyModeration.rangeOpen').replace('{from}', String(from)).replace('{to}', String(to))}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={offset === 0 || loading}
              onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
              className="rounded-xl border border-gray-300 px-3 py-1.5 disabled:opacity-50"
            >
              {t('trustSafetyModeration.previous')}
            </button>
            <button
              type="button"
              disabled={!hasNext || loading}
              onClick={() => setOffset(offset + PAGE_SIZE)}
              className="rounded-xl border border-gray-300 px-3 py-1.5 disabled:opacity-50"
            >
              {t('trustSafetyModeration.next')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
