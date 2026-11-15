// Ethora.com platform, copyright: Dappros Ltd (c) 2026, all rights reserved
//
// Admin > Evidence (docs/TRUST_AND_SAFETY.md section 11): the cases of kept
// content (deleted messages, moderator and automatic actions, suspensions)
// for server superadmins with write access. Filters live in the URL so the
// case view's "Back" returns to the same page of the same list. Every list
// request is audited by the API.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { EvidenceLoggedNotice, EvidenceNotAllowed } from '../components/evidence/EvidenceAccess';
import { useCanReviewEvidence } from '../components/evidence/hooks';
import { ModeChip, ReasonChip, ReportedChip, RetentionBadge } from '../components/evidence/EvidenceBadges';
import { evidenceCasePath, formatEvidenceTime } from '../components/evidence/format';
import { httpGetEvidenceCases } from '../http';
import { useTranslation } from '../i18n/useTranslation';
import type { EvidenceCase } from '../models';
import { useAppStore } from '../store/useAppStore';
import { accessErrorMessage } from '../utils/accessError';
import { apiError } from '../utils/apiError';
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
} from '../utils/evidence';

const SELECT = 'rounded-xl bg-gray-100 outline-none py-2 px-3 text-sm font-sans';

function EvidenceList() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = useMemo(() => evidenceFiltersFromParams(searchParams), [searchParams]);
  const apps = useAppStore((s) => s.apps);
  const [items, setItems] = useState<EvidenceCase[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  const [denied, setDenied] = useState(false);
  const [search, setSearch] = useState(filters.q);
  // Names of the user and App filters, picked from a row (the URL only has ids).
  const [names, setNames] = useState<{ user?: string; app?: string }>({});

  const queryString = evidenceQueryString(filters);

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

  const update = useCallback(
    (patch: Partial<EvidenceFilters>) => {
      // Any filter change goes back to the first page.
      const next = { ...filters, offset: 0, ...patch };
      setSearchParams(evidenceFiltersToParams(next), { replace: true });
    },
    [filters, setSearchParams]
  );

  // The search box applies after a short pause. `pushed` is the value this
  // box last wrote to the URL, so only outside changes (back, clear filters)
  // overwrite what is being typed.
  const pushed = useRef(filters.q);
  useEffect(() => {
    if (search === filters.q) return;
    const timer = setTimeout(() => {
      pushed.current = search;
      update({ q: search });
    }, 400);
    return () => clearTimeout(timer);
  }, [search, filters.q, update]);

  useEffect(() => {
    if (filters.q !== pushed.current) {
      pushed.current = filters.q;
      setSearch(filters.q);
    }
  }, [filters.q]);

  const appOptions = useMemo(() => {
    const list = (apps || [])
      .filter((a) => a?._id)
      .map((a) => ({ id: a._id, name: a.displayName || a._id }));
    if (filters.appId && !list.some((a) => a.id === filters.appId)) {
      list.unshift({ id: filters.appId, name: names.app || filters.appId });
    }
    return list;
  }, [apps, filters.appId, names.app]);

  if (denied) return <EvidenceNotAllowed />;

  const listSearch = evidenceFiltersToParams(filters).toString();
  const hasFilters = Boolean(filters.reason || filters.mode || filters.status || filters.appId || filters.userId || filters.q);
  const from = items.length ? filters.offset + 1 : 0;
  const to = filters.offset + items.length;
  const hasNext = total !== null ? to < total : items.length === EVIDENCE_PAGE_SIZE;

  const countText = (n: number, one: string, many: string) => (n === 1 ? t(one) : t(many).replace('{count}', String(n)));

  return (
    <div className="h-full overflow-y-auto">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
        <div className="min-w-0">
          <div className="font-varela text-[24px]">{t('evidence.title')}</div>
          <p className="text-sm text-gray-500 max-w-[720px]">{t('evidence.intro')}</p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className="self-start shrink-0 rounded-xl border border-brand-500 text-brand-500 hover:bg-brand-hover px-4 py-2 text-sm disabled:opacity-50"
        >
          {loading ? t('evidence.loading') : t('evidence.refresh')}
        </button>
      </div>

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
        <select
          aria-label={t('evidence.filter.app')}
          className={`${SELECT} max-w-[240px]`}
          value={filters.appId}
          onChange={(e) => update({ appId: e.target.value })}
        >
          <option value="">{t('evidence.app.all')}</option>
          {appOptions.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
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
              setSearchParams(evidenceFiltersToParams(EMPTY_EVIDENCE_FILTERS), { replace: true });
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

      <ul className="flex flex-col gap-3">
        {items.map((c) => {
          const counts = caseCounts(c);
          const user = personName(c.user) || t('evidence.unknownUser');
          const room = caseRoomLabel(c);
          const targets = (c.reports || []).map((r) => String(r.target || '')).filter(Boolean);
          return (
            <li key={c.caseId} className="rounded-2xl border border-gray-200 p-4 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <ReasonChip reason={c.reason} />
                <ModeChip mode={c.mode} />
                <RetentionBadge item={c} />
                <ReportedChip targets={targets} />
                <Link
                  to={evidenceCasePath(c.caseId, listSearch)}
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

      {(filters.offset > 0 || hasNext) && (
        <div className="mt-4 flex items-center justify-between gap-4 text-sm">
          <span className="text-gray-500 text-xs">
            {total !== null
              ? t('evidence.range').replace('{from}', String(from)).replace('{to}', String(to)).replace('{total}', String(total))
              : t('evidence.rangeOpen').replace('{from}', String(from)).replace('{to}', String(to))}
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
              disabled={!hasNext || loading}
              onClick={() => update({ offset: filters.offset + EVIDENCE_PAGE_SIZE })}
              className="rounded-xl border border-gray-300 px-3 py-1.5 disabled:opacity-50"
            >
              {t('evidence.next')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminEvidence() {
  const allowed = useCanReviewEvidence();
  // Mount the list only when allowed, so a direct visit sends no request.
  return allowed ? <EvidenceList /> : <EvidenceNotAllowed />;
}
