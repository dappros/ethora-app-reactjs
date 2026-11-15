// Ethora.com platform, copyright: Dappros Ltd (c) 2026, all rights reserved
//
// T&S > Quarantine (docs/TRUST_AND_SAFETY.md sections 11 and 13, was the
// "Evidence" page): the cases of kept content (deleted messages, moderator
// and automatic actions, suspensions) with filters in the URL, so the case
// view's "Back" returns to the same page of the same list. Rows can be
// selected (page, or every matching case up to the bulk limit) for the bulk
// actions: purge, extend, legal hold and release. Every list request and
// action is audited by the API.
import cn from 'classnames';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { EvidenceLoggedNotice, EvidenceNotAllowed } from '../../evidence/EvidenceAccess';
import { ModeChip, ReasonChip, ReportedChip, RetentionBadge } from '../../evidence/EvidenceBadges';
import { EvidenceDialog, ExtendDialog, ReleaseHoldDialog } from '../../evidence/EvidenceDialogs';
import { formatEvidenceTime } from '../../evidence/format';
import { httpEvidenceBulkAction, httpGetEvidenceCases } from '../../../http';
import { useTranslation } from '../../../i18n/useTranslation';
import type { EvidenceBulkAction, EvidenceBulkResponse, EvidenceCase } from '../../../models';
import { accessErrorMessage } from '../../../utils/accessError';
import { apiError } from '../../../utils/apiError';
import {
  EMPTY_EVIDENCE_FILTERS,
  EVIDENCE_MODES,
  EVIDENCE_PAGE_SIZE,
  EVIDENCE_REASONS,
  EVIDENCE_STATUSES,
  EvidenceFilters,
  caseCounts,
  caseRoomLabel,
  evidenceFiltersFromParams,
  evidenceFiltersToParams,
  evidenceQueryString,
  personName,
} from '../../../utils/evidence';
import {
  BULK_MAX,
  bulkPurgeConfirmed,
  bulkPurgePhrase,
  capSelection,
  pageSelectionState,
  quarantineCasePath,
  summarizeBulkResults,
  togglePage,
  toggleSelected,
} from '../../../utils/tsHub';
import { AppFilter, BUTTON, BUTTON_DANGER, BUTTON_PLAIN, SELECT, TabHeader } from './common';
import { useAppOptions } from './useAppOptions';

// Page size of the requests that collect every matching case id.
const COLLECT_PAGE = 100;

type BulkDialog = 'purge' | 'extend' | 'release' | null;

interface BulkOutcome {
  action: EvidenceBulkAction;
  results: EvidenceBulkResponse['results'];
}

const selectable = (c: EvidenceCase) => !c.purgedAt;

function BulkPurgeDialog({ count, busy, onClose, onSubmit }: { count: number; busy: boolean; onClose: () => void; onSubmit: () => void }) {
  const { t } = useTranslation();
  const [typed, setTyped] = useState('');
  const phrase = bulkPurgePhrase(count);
  return (
    <EvidenceDialog
      title={t('tsHub.bulk.purge.title').replace('{count}', String(count))}
      busy={busy}
      submitLabel={t('tsHub.bulk.purge.submit').replace('{count}', String(count))}
      canSubmit={bulkPurgeConfirmed(typed, count)}
      danger
      onClose={onClose}
      onSubmit={onSubmit}
    >
      <div
        role="alert"
        className="rounded-xl border border-red-200 bg-red-50 text-red-800 dark:bg-red-950/40 dark:border-red-900 dark:text-red-300 p-3"
      >
        {t('tsHub.bulk.purge.body')}
      </div>
      <p className="text-gray-700">{t('tsHub.bulk.purge.kept')}</p>
      <label className="block">
        <div className="text-gray-500 text-[12px] font-sans mb-1">{t('tsHub.bulk.purge.type').replace('{phrase}', phrase)}</div>
        <input
          className="w-full rounded-xl bg-gray-100 outline-none py-[10px] px-[14px] text-sm font-sans"
          autoFocus
          autoComplete="off"
          spellCheck={false}
          placeholder={phrase}
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
        />
      </label>
    </EvidenceDialog>
  );
}

function BulkResultDialog({ outcome, onClose }: { outcome: BulkOutcome; onClose: () => void }) {
  const { t } = useTranslation();
  const summary = summarizeBulkResults(outcome.results);
  const codeLabel = (code: string) => {
    const key = `tsHub.bulk.code.${code}`;
    const v = t(key);
    return v === key ? code : v;
  };
  return (
    <EvidenceDialog
      title={t('tsHub.bulk.result.title').replace('{action}', t(`tsHub.bulk.actionName.${outcome.action}`))}
      busy={false}
      submitLabel={t('tsHub.bulk.result.close')}
      canSubmit
      onClose={onClose}
      onSubmit={onClose}
    >
      <p className="text-gray-800">
        {t('tsHub.bulk.result.summary')
          .replace('{succeeded}', String(summary.succeeded))
          .replace('{failed}', String(summary.failed))}
      </p>
      {summary.byCode.length > 0 && (
        <ul className="flex flex-col gap-3">
          {summary.byCode.map((g) => (
            <li key={g.code} className="rounded-xl border border-gray-200 p-3 min-w-0">
              <div className="font-semibold text-red-700 dark:text-red-400">
                {codeLabel(g.code)} ({g.caseIds.length})
              </div>
              <ul className="mt-1 text-xs text-gray-600 font-mono break-all max-h-32 overflow-y-auto">
                {g.caseIds.map((id) => (
                  <li key={id}>{id}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
      {summary.failed > 0 && <p className="text-xs text-gray-500">{t('tsHub.bulk.result.failedKept')}</p>}
    </EvidenceDialog>
  );
}

export function QuarantineTab() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = useMemo(() => evidenceFiltersFromParams(searchParams), [searchParams]);
  const [items, setItems] = useState<EvidenceCase[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  const [denied, setDenied] = useState(false);
  const [search, setSearch] = useState(filters.q);
  // Names of the user and App filters, picked from a row (the URL only has ids).
  const [names, setNames] = useState<{ user?: string; app?: string }>({});
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [collecting, setCollecting] = useState(false);
  const [bulkBusy, setBulkBusy] = useState<EvidenceBulkAction | null>(null);
  const [bulkDialog, setBulkDialog] = useState<BulkDialog>(null);
  const [outcome, setOutcome] = useState<BulkOutcome | null>(null);

  const queryString = evidenceQueryString(filters);
  // The filters without the page: a change clears the selection.
  const filterKey = evidenceFiltersToParams({ ...filters, offset: 0 }).toString();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await httpGetEvidenceCases(queryString);
      setItems(r.data?.items || []);
      setTotal(typeof r.data?.total === 'number' ? r.data.total : null);
      setUnavailable(false);
      setDenied(false);
    } catch (e) {
      const info = apiError(e, '');
      if (info.status === 404) setUnavailable(true);
      else if (info.status === 403) setDenied(true);
      else setError(accessErrorMessage(e, t));
      setItems([]);
      setTotal(null);
    } finally {
      setLoading(false);
    }
  }, [queryString, t]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    setSelected(new Set());
  }, [filterKey]);

  const update = useCallback(
    (patch: Partial<EvidenceFilters>) => {
      // Any filter change goes back to the first page; the tab stays.
      const next = { ...filters, offset: 0, ...patch };
      const params = evidenceFiltersToParams(next);
      params.set('tab', 'quarantine');
      setSearchParams(params, { replace: true });
    },
    [filters, setSearchParams]
  );

  // The search box applies after a short pause. `pushed` is the value this
  // box last wrote to the URL, so only outside changes (back, clear filters)
  // overwrite what is being typed.
  const pushed = useRef(filters.q);
  useEffect(() => {
    // Compared trimmed, as the URL keeps it: a space typed between two
    // words must not be taken back by the round trip.
    const value = search.trim();
    if (value === filters.q.trim()) return;
    const timer = setTimeout(() => {
      pushed.current = value;
      update({ q: value });
    }, 400);
    return () => clearTimeout(timer);
  }, [search, filters.q, update]);

  useEffect(() => {
    if (filters.q.trim() !== pushed.current) {
      pushed.current = filters.q;
      setSearch(filters.q);
    }
  }, [filters.q]);

  // Apps of the session plus those seen in the rows (and the filtered one).
  const seenApps = useMemo(() => {
    const list = items.filter((c) => c.appId).map((c) => ({ id: String(c.appId), name: c.appName || null }));
    if (filters.appId) list.push({ id: filters.appId, name: names.app || null });
    return list;
  }, [items, filters.appId, names.app]);
  const appOptions = useAppOptions(seenApps);

  // Every matching case that can still be acted on, up to the bulk limit.
  const selectAllMatching = async () => {
    setCollecting(true);
    try {
      const ids: string[] = [];
      let offset = 0;
      const want = Math.min(total ?? BULK_MAX, BULK_MAX);
      while (ids.length < want) {
        const r = await httpGetEvidenceCases(evidenceQueryString({ ...filters, offset }, COLLECT_PAGE));
        const page = r.data?.items || [];
        if (!page.length) break;
        for (const c of page) if (selectable(c)) ids.push(c.caseId);
        offset += page.length;
        if (total !== null && offset >= total) break;
      }
      setSelected(new Set(capSelection(ids)));
    } catch (e) {
      toast.error(t('tsHub.bulk.collectFailed').replace('{error}', accessErrorMessage(e, t)));
    } finally {
      setCollecting(false);
    }
  };

  const runBulk = async (action: EvidenceBulkAction, days?: number) => {
    const caseIds = capSelection(Array.from(selected));
    if (!caseIds.length) return;
    setBulkBusy(action);
    try {
      const r = await httpEvidenceBulkAction(days ? { caseIds, action, days } : { caseIds, action });
      const results = r.data?.results || [];
      setBulkDialog(null);
      setOutcome({ action, results });
      // Keep the failed cases selected so they can be retried or looked at.
      const failed = new Set(results.filter((x) => !x.ok).map((x) => x.caseId));
      setSelected(failed);
      await load();
    } catch (e) {
      toast.error(t('tsHub.bulk.failed').replace('{error}', accessErrorMessage(e, t)));
    } finally {
      setBulkBusy(null);
    }
  };

  if (denied) return <EvidenceNotAllowed />;

  const listSearch = evidenceFiltersToParams(filters).toString();
  const hasFilters = Boolean(filters.reason || filters.mode || filters.status || filters.appId || filters.userId || filters.q);
  const pageIds = items.filter(selectable).map((c) => c.caseId);
  const pageState = pageSelectionState(selected, pageIds);
  const count = selected.size;
  const matching = total ?? 0;
  const canOfferAll = pageState === 'all' && total !== null && total > pageIds.length && count < Math.min(total, BULK_MAX);
  const busy = Boolean(bulkBusy) || collecting;

  const countText = (n: number, one: string, many: string) => (n === 1 ? t(one) : t(many).replace('{count}', String(n)));

  return (
    <div>
      <TabHeader title={t('evidence.title')} intro={t('evidence.intro')} loading={loading} onRefresh={() => void load()} />

      <EvidenceLoggedNotice />

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <input
          type="search"
          aria-label={t('evidence.filter.search')}
          placeholder={t('evidence.searchPlaceholder')}
          className={`${SELECT} w-full sm:w-[280px]`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          aria-label={t('evidence.filter.reason')}
          className={SELECT}
          value={filters.reason}
          onChange={(e) => update({ reason: e.target.value as EvidenceFilters['reason'] })}
        >
          <option value="">{t('evidence.reason.all')}</option>
          {EVIDENCE_REASONS.map((r) => (
            <option key={r} value={r}>
              {t(`evidence.reason.${r}`)}
            </option>
          ))}
        </select>
        <select
          aria-label={t('evidence.filter.mode')}
          className={SELECT}
          value={filters.mode}
          onChange={(e) => update({ mode: e.target.value as EvidenceFilters['mode'] })}
        >
          <option value="">{t('evidence.mode.all')}</option>
          {EVIDENCE_MODES.map((m) => (
            <option key={m} value={m}>
              {t(`evidence.mode.${m}`)}
            </option>
          ))}
        </select>
        <select
          aria-label={t('evidence.filter.status')}
          className={SELECT}
          value={filters.status}
          onChange={(e) => update({ status: e.target.value as EvidenceFilters['status'] })}
        >
          <option value="">{t('evidence.status.all')}</option>
          {EVIDENCE_STATUSES.map((s) => (
            <option key={s} value={s}>
              {t(`evidence.status.${s}`)}
            </option>
          ))}
        </select>
        <AppFilter value={filters.appId} options={appOptions} onChange={(appId) => update({ appId })} />
        {filters.userId && (
          <span className="inline-flex items-center gap-1 rounded-2xl bg-brand-150 text-brand-500 px-3 py-1 text-xs">
            {t('evidence.userFilter').replace('{name}', names.user || filters.userId)}
            <button
              type="button"
              aria-label={t('evidence.clearUser')}
              title={t('evidence.clearUser')}
              className="ml-1 font-semibold"
              onClick={() => update({ userId: '' })}
            >
              x
            </button>
          </span>
        )}
        {hasFilters && (
          <button
            type="button"
            className="text-xs text-brand-500 underline"
            onClick={() => {
              pushed.current = '';
              setSearch('');
              const params = evidenceFiltersToParams(EMPTY_EVIDENCE_FILTERS);
              params.set('tab', 'quarantine');
              setSearchParams(params, { replace: true });
            }}
          >
            {t('evidence.clearFilters')}
          </button>
        )}
      </div>

      {unavailable && <div className="bg-brand-150 p-4 text-sm font-sans rounded-xl mb-4">{t('evidence.unavailable')}</div>}
      {error && <p className="mb-4 text-sm text-red-600 dark:text-red-400">{t('evidence.loadFailed').replace('{error}', error)}</p>}
      {!loading && !error && !unavailable && !items.length && (
        <div className="bg-brand-150 p-4 text-sm font-sans rounded-xl mb-4">{t('evidence.empty')}</div>
      )}

      {items.length > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-3 text-sm">
          <label className="inline-flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              className="size-4"
              aria-label={t('tsHub.bulk.selectPage')}
              disabled={!pageIds.length || busy}
              checked={pageState === 'all'}
              ref={(el) => {
                if (el) el.indeterminate = pageState === 'some';
              }}
              onChange={() =>
                setSelected((s) => {
                  const next = togglePage(s, pageIds);
                  return next.size > BULK_MAX ? new Set(capSelection(Array.from(next))) : next;
                })
              }
            />
            <span>{t('tsHub.bulk.selectPage')}</span>
          </label>
          {canOfferAll && (
            <span className="text-gray-600">
              {t('tsHub.bulk.pageSelected').replace('{count}', String(pageIds.length))}{' '}
              <button type="button" disabled={busy} className="text-brand-500 underline disabled:opacity-50" onClick={() => void selectAllMatching()}>
                {collecting
                  ? t('tsHub.bulk.collecting')
                  : matching > BULK_MAX
                    ? t('tsHub.bulk.selectFirst').replace('{max}', String(BULK_MAX)).replace('{total}', String(matching))
                    : t('tsHub.bulk.selectAll').replace('{total}', String(matching))}
              </button>
            </span>
          )}
        </div>
      )}

      <ul className="flex flex-col gap-3">
        {items.map((c) => {
          const counts = caseCounts(c);
          const user = personName(c.user) || t('evidence.unknownUser');
          const room = caseRoomLabel(c);
          const targets = (c.reports || []).map((r) => String(r.target || '')).filter(Boolean);
          const canSelect = selectable(c);
          const isSelected = selected.has(c.caseId);
          return (
            <li
              key={c.caseId}
              className={cn('rounded-2xl border p-4 min-w-0', isSelected ? 'border-brand-500 bg-brand-150/40' : 'border-gray-200')}
            >
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  className="size-4"
                  aria-label={t('tsHub.bulk.selectCase')}
                  title={canSelect ? t('tsHub.bulk.selectCase') : t('tsHub.bulk.purgedNotSelectable')}
                  disabled={!canSelect || busy || (!isSelected && count >= BULK_MAX)}
                  checked={isSelected}
                  onChange={() =>
                    setSelected((s) => (s.has(c.caseId) || s.size < BULK_MAX ? toggleSelected(s, c.caseId) : s))
                  }
                />
                <ReasonChip reason={c.reason} />
                <ModeChip mode={c.mode} />
                <RetentionBadge item={c} />
                <ReportedChip targets={targets} />
                <Link
                  to={quarantineCasePath(c.caseId, listSearch)}
                  className="ml-auto rounded-xl border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50"
                >
                  {t('evidence.openCase')}
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-1 text-xs text-gray-600">
                <div className="min-w-0">
                  <span className="text-gray-500">{t('evidence.col.user')}: </span>
                  {c.user?._id ? (
                    <button
                      type="button"
                      className="text-gray-800 break-words text-left hover:underline"
                      title={t('evidence.filterByUser')}
                      onClick={() => {
                        setNames((n) => ({ ...n, user }));
                        update({ userId: String(c.user?._id) });
                      }}
                    >
                      {user}
                    </button>
                  ) : (
                    <span className="text-gray-800 break-words">{user}</span>
                  )}
                  {c.user?.email && user !== c.user.email && <span className="block text-gray-500 break-all">{c.user.email}</span>}
                </div>
                <div className="min-w-0">
                  <span className="text-gray-500">{t('evidence.col.app')}: </span>
                  {c.appId ? (
                    <button
                      type="button"
                      className="text-gray-800 break-all text-left hover:underline"
                      title={t('evidence.filterByApp')}
                      onClick={() => {
                        setNames((n) => ({ ...n, app: c.appName || undefined }));
                        update({ appId: String(c.appId) });
                      }}
                    >
                      {c.appName || c.appId}
                    </button>
                  ) : (
                    <span>-</span>
                  )}
                  {room && (
                    <span className="block break-all">
                      <span className="text-gray-500">{t('evidence.col.room')}: </span>
                      {room}
                    </span>
                  )}
                </div>
                <div>
                  <span className="text-gray-500">{t('evidence.col.created')}: </span>
                  {formatEvidenceTime(c.createdAt)}
                </div>
                <div className="tabular-nums">
                  {countText(counts.messages, 'evidence.counts.messagesOne', 'evidence.counts.messages')}
                  {', '}
                  {countText(counts.media, 'evidence.counts.mediaOne', 'evidence.counts.media')}
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {(filters.offset > 0 || (total !== null ? filters.offset + items.length < total : items.length === EVIDENCE_PAGE_SIZE)) && (
        <div className="mt-4 flex items-center justify-between gap-4 text-sm">
          <span className="text-gray-500 text-xs">
            {total !== null
              ? t('evidence.range')
                  .replace('{from}', String(items.length ? filters.offset + 1 : 0))
                  .replace('{to}', String(filters.offset + items.length))
                  .replace('{total}', String(total))
              : t('evidence.rangeOpen')
                  .replace('{from}', String(items.length ? filters.offset + 1 : 0))
                  .replace('{to}', String(filters.offset + items.length))}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={filters.offset === 0 || loading}
              onClick={() => update({ offset: Math.max(0, filters.offset - EVIDENCE_PAGE_SIZE) })}
              className="rounded-xl border border-gray-300 px-3 py-1.5 disabled:opacity-50"
            >
              {t('evidence.previous')}
            </button>
            <button
              type="button"
              disabled={loading || (total !== null ? filters.offset + items.length >= total : items.length < EVIDENCE_PAGE_SIZE)}
              onClick={() => update({ offset: filters.offset + EVIDENCE_PAGE_SIZE })}
              className="rounded-xl border border-gray-300 px-3 py-1.5 disabled:opacity-50"
            >
              {t('evidence.next')}
            </button>
          </div>
        </div>
      )}

      {count > 0 && (
        <div
          role="region"
          aria-label={t('tsHub.bulk.barLabel')}
          className="sticky bottom-0 z-10 mt-4 -mx-1 rounded-2xl border border-gray-200 bg-white p-3 shadow-lg flex flex-wrap items-center gap-2"
        >
          <span className="text-sm font-semibold mr-1">
            {count === 1 ? t('tsHub.bulk.selectedOne') : t('tsHub.bulk.selected').replace('{count}', String(count))}
          </span>
          <button type="button" className="text-xs text-brand-500 underline mr-2" disabled={busy} onClick={() => setSelected(new Set())}>
            {t('tsHub.bulk.clear')}
          </button>
          <button type="button" disabled={busy} className={BUTTON_PLAIN} title={t('evidence.action.extendTitle')} onClick={() => void runBulk('extend', 30)}>
            {bulkBusy === 'extend' ? t('evidence.dialog.working') : t('evidence.action.extend30')}
          </button>
          <button type="button" disabled={busy} className={BUTTON_PLAIN} onClick={() => void runBulk('extend', 90)}>
            {t('evidence.action.extend90')}
          </button>
          <button type="button" disabled={busy} className={BUTTON_PLAIN} onClick={() => setBulkDialog('extend')}>
            {t('evidence.action.extendCustom')}
          </button>
          <button
            type="button"
            disabled={busy}
            title={t('tsHub.bulk.holdTitle')}
            className={`${BUTTON} border-blue-600 text-blue-700 hover:bg-blue-50 dark:text-blue-300 dark:hover:bg-blue-950/30`}
            onClick={() => void runBulk('hold')}
          >
            {bulkBusy === 'hold' ? t('evidence.dialog.working') : t('evidence.action.hold')}
          </button>
          <button type="button" disabled={busy} className={BUTTON_PLAIN} onClick={() => setBulkDialog('release')}>
            {t('evidence.action.releaseHold')}
          </button>
          <button type="button" disabled={busy} className={cn(BUTTON_DANGER, 'sm:ml-auto')} onClick={() => setBulkDialog('purge')}>
            {t('tsHub.bulk.purge.button')}
          </button>
        </div>
      )}

      {bulkDialog === 'purge' && (
        <BulkPurgeDialog count={count} busy={bulkBusy === 'purge'} onClose={() => setBulkDialog(null)} onSubmit={() => void runBulk('purge')} />
      )}
      {bulkDialog === 'extend' && (
        <ExtendDialog busy={bulkBusy === 'extend'} onClose={() => setBulkDialog(null)} onSubmit={(days) => void runBulk('extend', days)} />
      )}
      {bulkDialog === 'release' && (
        <ReleaseHoldDialog
          busy={bulkBusy === 'release_hold'}
          defaultDays={null}
          onClose={() => setBulkDialog(null)}
          onSubmit={(days) => void runBulk('release_hold', days)}
        />
      )}
      {outcome && <BulkResultDialog outcome={outcome} onClose={() => setOutcome(null)} />}
    </div>
  );
}
