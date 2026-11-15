// Ethora.com platform, copyright: Dappros Ltd (c) 2026, all rights reserved
//
// T&S > Moderation queue (docs/TRUST_AND_SAFETY.md section 13): the items of
// every App (GET /v2/admin/trust-safety/moderation-items) with the filters of
// the per-App queue plus the App. The cards and actions are the per-App
// ones; each action goes to the item's App.
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { httpGetTsModerationItems } from '../../../http';
import { useTranslation } from '../../../i18n/useTranslation';
import type { TsHubModerationItem } from '../../../models';
import { accessErrorMessage } from '../../../utils/accessError';
import { apiError } from '../../../utils/apiError';
import { MODERATION_CATEGORIES } from '../../../utils/trustSafety';
import { TS_HUB_PAGE_SIZE, hubListQuery, nextListParams, offsetFromParams } from '../../../utils/tsHub';
import { ModerationFilterBar, ModerationQueueList, ModerationStatusFilter } from '../ModerationQueueList';
import { AppFilter, Pager, TabHeader } from './common';
import { useAppOptions } from './useAppOptions';

export function ModerationTab() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const status: ModerationStatusFilter = searchParams.get('status') === 'resolved' ? 'resolved' : 'open';
  const kindParam = searchParams.get('kind') || '';
  const kind = kindParam === 'message' || kindParam === 'media' ? kindParam : '';
  const categoryParam = searchParams.get('category') || '';
  const category = MODERATION_CATEGORIES.includes(categoryParam) ? categoryParam : '';
  const appId = (searchParams.get('appId') || '').trim();
  const offset = offsetFromParams(searchParams);
  const [items, setItems] = useState<TsHubModerationItem[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unavailable, setUnavailable] = useState(false);

  const query = hubListQuery({ status, kind, category, appId }, offset);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await httpGetTsModerationItems(query);
      setItems(r.data?.items || []);
      setTotal(typeof r.data?.total === 'number' ? r.data.total : null);
      setUnavailable(false);
    } catch (e) {
      if (apiError(e, '').status === 404) setUnavailable(true);
      else setError(accessErrorMessage(e, t));
      setItems([]);
      setTotal(null);
    } finally {
      setLoading(false);
    }
  }, [query, t]);

  useEffect(() => {
    void load();
  }, [load]);

  const update = (patch: Record<string, string | number>) =>
    setSearchParams(nextListParams(searchParams, 'moderation', patch, { status: 'open' }), { replace: true });

  const seenApps = useMemo(() => items.map((i) => ({ id: i.appId, name: i.appName })), [items]);
  const appOptions = useAppOptions(seenApps);

  return (
    <div>
      <TabHeader title={t('tsHub.tab.moderation')} intro={t('tsHub.moderation.intro')} loading={loading} onRefresh={() => void load()} />
      <ModerationFilterBar status={status} kind={kind} category={category} onChange={(patch) => update(patch as Record<string, string>)}>
        <AppFilter value={appId} options={appOptions} onChange={(v) => update({ appId: v })} />
      </ModerationFilterBar>

      {unavailable && <div className="bg-brand-150 p-4 text-sm font-sans rounded-xl mb-4">{t('tsHub.unavailable')}</div>}
      {error && <p className="mb-4 text-sm text-red-600 dark:text-red-400">{t('trustSafetyModeration.loadFailed').replace('{error}', error)}</p>}
      {!loading && !error && !unavailable && !items.length && (
        <div className="bg-brand-150 p-4 text-sm font-sans rounded-xl mb-4">
          {status === 'open' ? t('trustSafetyModeration.empty') : t('trustSafetyModeration.emptyResolved')}
        </div>
      )}

      <ModerationQueueList items={items} appIdOf={(i) => i.appId} showApp onChanged={load} />

      <Pager
        offset={offset}
        count={items.length}
        total={total}
        pageSize={TS_HUB_PAGE_SIZE}
        loading={loading}
        onOffset={(o) => update({ offset: o })}
      />
    </div>
  );
}
