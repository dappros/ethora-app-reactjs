// Ethora.com platform, copyright: Dappros Ltd (c) 2026, all rights reserved
//
// App admin > Moderation (docs/TRUST_AND_SAFETY.md section 6): the queue of
// messages and media flagged by the automatic checks or by moderators, with
// filters (open / resolved, kind, category), the moderator actions that apply
// to each item, and a shortcut to suspend the sender. Flagged text and
// previews are shown to moderators only; media previews of sensitive files
// are blurred by the server and again here until "Show" is pressed.
import cn from 'classnames';
import { DateTime } from 'luxon';
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Segmented } from '../components/AIWidget/appearance/Fields';
import { ConfirmModal } from '../components/modal/ConfirmModal';
import { SuspendUserModal } from '../components/modal/SuspendUserModal';
import {
  httpGetAppTrustSafety,
  httpGetModerationItems,
  httpModerationItemAction,
  httpSuspendUser,
} from '../http';
import { useTranslation } from '../i18n/useTranslation';
import { ModelAppUser, ModerationAction, ModerationItem, SuspendUserBody } from '../models';
import { accessErrorMessage } from '../utils/accessError';
import { apiError } from '../utils/apiError';
import { MODERATION_CATEGORIES, TS_IMAGE_SIGNALS, formatScore, mediaSignalsOf, moderationActionsFor } from '../utils/trustSafety';

const PAGE_SIZE = 25;

type StatusFilter = 'open' | 'resolved';

// Scores of the item as "label 93%" chips; arrays (PII types) as one line.
// The image signals of media items are shown on their own line.
function scoreEntries(item: ModerationItem) {
  const chips: Array<{ key: string; value: string }> = [];
  const lists: Array<{ key: string; value: string }> = [];
  for (const [key, raw] of Object.entries(item.scores || {})) {
    if (item.kind === 'media' && (TS_IMAGE_SIGNALS as readonly string[]).includes(key)) continue;
    if (Array.isArray(raw)) {
      if (raw.length) lists.push({ key, value: raw.join(', ') });
      continue;
    }
    const v = formatScore(raw);
    if (v) chips.push({ key, value: v });
  }
  return { chips, lists };
}

const roomLabel = (item: ModerationItem) => {
  if (item.roomTitle) return item.roomTitle;
  if (!item.room) return '';
  return item.room.split('@')[0];
};

export default function AppModeration() {
  const { t } = useTranslation();
  const { appId } = useParams();
  const [status, setStatus] = useState<StatusFilter>('open');
  const [kind, setKind] = useState('');
  const [category, setCategory] = useState('');
  const [offset, setOffset] = useState(0);
  const [items, setItems] = useState<ModerationItem[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  const [serviceOff, setServiceOff] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<ModerationItem | null>(null);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [brokenPreview, setBrokenPreview] = useState<Record<string, boolean>>({});
  const [suspendTarget, setSuspendTarget] = useState<ModelAppUser | null>(null);
  const [suspendBusy, setSuspendBusy] = useState(false);

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

  const changeFilter = (fn: () => void) => {
    fn();
    setOffset(0);
  };

  const idOf = (item: ModerationItem) => item._id || item.id || '';

  const run = async (item: ModerationItem, action: ModerationAction) => {
    if (!appId) return;
    setBusyId(idOf(item));
    try {
      await httpModerationItemAction(appId, idOf(item), action);
      toast.success(t('trustSafetyModeration.actionDone').replace('{action}', t(`trustSafetyModeration.action.${action}`)));
      await load();
    } catch (e) {
      toast.error(t('trustSafetyModeration.actionFailed').replace('{error}', accessErrorMessage(e, t)));
    } finally {
      setBusyId(null);
    }
  };

  const senderName = (item: ModerationItem) => {
    const s = item.sender;
    const name = `${s?.firstName || ''} ${s?.lastName || ''}`.trim();
    return name || s?.email || item.senderUserId || t('trustSafetyModeration.unknownSender');
  };

  const openSuspend = (item: ModerationItem) => {
    if (!item.senderUserId) return;
    // The dialog only reads the name and email for its title.
    setSuspendTarget({
      _id: item.senderUserId,
      firstName: item.sender?.firstName || '',
      lastName: item.sender?.lastName || '',
      email: item.sender?.email || '',
    } as ModelAppUser);
  };

  const suspend = async (body: SuspendUserBody) => {
    if (!appId || !suspendTarget) return;
    setSuspendBusy(true);
    try {
      const r = await httpSuspendUser(appId, suspendTarget._id, body);
      const res = r.data?.results || [];
      if (res.some((x) => x.status === 'already_suspended')) {
        toast.info(t('userSuspension.toast.alreadySuspended').replace('{count}', '1'));
      } else {
        toast.success(t('userSuspension.toast.suspended').replace('{count}', '1'));
      }
      setSuspendTarget(null);
      await load();
    } catch (e) {
      const info = apiError(e, '');
      const key = `userSuspension.error.${info.code}`;
      const known = info.code ? t(key) : key;
      const msg = info.status === 403 || known === key ? accessErrorMessage(e, t) : known;
      toast.error(`${t('userSuspension.toast.suspendFailedPrefix')} ${msg}`);
    } finally {
      setSuspendBusy(false);
    }
  };

  const formatTime = (iso?: string | null) => {
    if (!iso) return '';
    const d = DateTime.fromISO(iso);
    return d.isValid ? d.toFormat('dd LLL yyyy t') : '';
  };

  const previewOf = (item: ModerationItem) => item.previewUrl || item.file?.locationPreview || null;

  const selectClass = 'rounded-xl bg-gray-100 outline-none py-2 px-3 text-sm font-sans';

  const renderContent = (item: ModerationItem) => {
    const id = idOf(item);
    if (item.kind === 'media') {
      const src = previewOf(item);
      if (!src || brokenPreview[id]) {
        return (
          <div className="flex h-24 w-24 items-center justify-center rounded-xl bg-gray-100 text-xs text-gray-500 text-center p-2">
            {t('trustSafetyModeration.noPreview')}
          </div>
        );
      }
      return (
        <div className="flex items-end gap-2">
          <div className="h-24 w-24 overflow-hidden rounded-xl bg-gray-100">
            <img
              src={src}
              alt={item.file?.originalname || ''}
              loading="lazy"
              onError={() => setBrokenPreview((b) => ({ ...b, [id]: true }))}
              className={cn('h-full w-full object-cover transition', !revealed[id] && 'blur-xl scale-110')}
            />
          </div>
          <button
            type="button"
            className="text-xs text-brand-500 underline"
            onClick={() => setRevealed((r) => ({ ...r, [id]: !r[id] }))}
          >
            {revealed[id] ? t('trustSafetyModeration.hidePreview') : t('trustSafetyModeration.showPreview')}
          </button>
        </div>
      );
    }
    return item.text ? (
      <p className="whitespace-pre-wrap break-words text-sm text-gray-800 max-h-40 overflow-y-auto">{item.text}</p>
    ) : (
      <p className="text-sm text-gray-500 italic">{t('trustSafetyModeration.noText')}</p>
    );
  };

  const statusChip = (item: ModerationItem) => (
    <span
      className={cn(
        'px-2 py-0.5 rounded-2xl text-xs',
        item.status === 'open' && 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
        item.status === 'removed' && 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300',
        (item.status === 'approved' || item.status === 'dismissed') && 'bg-gray-100 text-gray-600'
      )}
    >
      {t(`trustSafetyModeration.itemStatus.${item.status}`)}
    </span>
  );

  const appliedLabel = (item: ModerationItem) => {
    const a = item.action || '';
    const key = `trustSafetyModeration.applied.${a}`;
    const label = t(key);
    const base = label === key ? a : label;
    const sourceKey = `trustSafetyModeration.source.${item.source || ''}`;
    const source = item.source ? t(sourceKey) : '';
    return source && source !== sourceKey ? `${base} (${source})` : base;
  };

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

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <Segmented<StatusFilter>
          ariaLabel={t('trustSafetyModeration.filter.status')}
          value={status}
          onChange={(v) => changeFilter(() => setStatus(v))}
          options={[
            { value: 'open', label: t('trustSafetyModeration.status.open') },
            { value: 'resolved', label: t('trustSafetyModeration.status.resolved') },
          ]}
        />
        <select
          aria-label={t('trustSafetyModeration.filter.kind')}
          className={selectClass}
          value={kind}
          onChange={(e) => changeFilter(() => setKind(e.target.value))}
        >
          <option value="">{t('trustSafetyModeration.kind.all')}</option>
          <option value="message">{t('trustSafetyModeration.kind.message')}</option>
          <option value="media">{t('trustSafetyModeration.kind.media')}</option>
        </select>
        <select
          aria-label={t('trustSafetyModeration.filter.category')}
          className={selectClass}
          value={category}
          onChange={(e) => changeFilter(() => setCategory(e.target.value))}
        >
          <option value="">{t('trustSafetyModeration.category.all')}</option>
          {MODERATION_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {t(`trustSafetyModeration.category.${c}`)}
            </option>
          ))}
        </select>
      </div>

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

      <ul className="flex flex-col gap-3">
        {items.map((item) => {
          const id = idOf(item);
          const { chips, lists } = scoreEntries(item);
          const signals = mediaSignalsOf(item);
          const actions = moderationActionsFor(item);
          const busy = busyId === id;
          const categoryKey = `trustSafetyModeration.category.${item.category}`;
          const categoryLabel = item.category ? (t(categoryKey) === categoryKey ? item.category : t(categoryKey)) : '';
          return (
            <li key={id} className="rounded-2xl border border-gray-200 p-4 min-w-0">
              <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,_1fr),_260px] gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2 text-xs">
                    <span className="px-2 py-0.5 rounded-2xl bg-brand-150 text-brand-500">
                      {t(`trustSafetyModeration.kind.${item.kind}`)}
                    </span>
                    {categoryLabel && (
                      <span className="px-2 py-0.5 rounded-2xl bg-gray-100 text-gray-700 font-semibold">{categoryLabel}</span>
                    )}
                    {chips.map((c) => (
                      <span key={c.key} className="px-2 py-0.5 rounded-2xl bg-gray-100 text-gray-600 tabular-nums">
                        {c.key.replace(/_/g, ' ')} {c.value}
                      </span>
                    ))}
                    {statusChip(item)}
                  </div>
                  {signals && (
                    <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-600" title={t('trustSafetyModeration.signalsHelp')}>
                      <span className="text-gray-500">{t('trustSafetyModeration.signals')}:</span>
                      {TS_IMAGE_SIGNALS.map((k) => (
                        <span key={k} className="tabular-nums">
                          {t(`trustSafetyModeration.signal.${k}`)}{' '}
                          {signals[k] === null ? (
                            <span className="text-gray-400">{t('trustSafetyModeration.signalNotRun')}</span>
                          ) : (
                            <span className="font-semibold">{signals[k]}%</span>
                          )}
                        </span>
                      ))}
                    </div>
                  )}
                  {lists.map((l) => (
                    <div key={l.key} className="mb-2 text-xs text-gray-500">
                      {t('trustSafetyModeration.piiTypes').replace('{types}', l.value)}
                    </div>
                  ))}
                  {renderContent(item)}
                </div>
                <div className="min-w-0 text-xs text-gray-600 flex flex-col gap-1">
                  <div>
                    <span className="text-gray-500">{t('trustSafetyModeration.col.sender')}: </span>
                    <span className="text-gray-800 break-words">{senderName(item)}</span>
                    {item.sender?.email && senderName(item) !== item.sender.email && (
                      <span className="block text-gray-500 break-all">{item.sender.email}</span>
                    )}
                  </div>
                  {roomLabel(item) && (
                    <div>
                      <span className="text-gray-500">{t('trustSafetyModeration.col.room')}: </span>
                      <span className="break-all">{roomLabel(item)}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-500">{t('trustSafetyModeration.col.time')}: </span>
                    {formatTime(item.createdAt)}
                  </div>
                  {item.action && (
                    <div>
                      <span className="text-gray-500">{t('trustSafetyModeration.col.autoAction')}: </span>
                      {appliedLabel(item)}
                    </div>
                  )}
                  {item.resolvedAt && (
                    <div className="text-gray-500">
                      {t('trustSafetyModeration.resolvedAt').replace('{date}', formatTime(item.resolvedAt))}
                    </div>
                  )}
                </div>
              </div>
              {(actions.length > 0 || item.senderUserId) && (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {actions.map((a) => (
                    <button
                      key={a}
                      type="button"
                      disabled={busy}
                      title={t(`trustSafetyModeration.action.${a}Title`)}
                      onClick={() => (a === 'delete' ? setConfirmDelete(item) : void run(item, a))}
                      className={cn(
                        'rounded-xl px-3 py-1.5 text-sm border disabled:opacity-50',
                        a === 'delete'
                          ? 'border-red-400 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30'
                          : a === 'approve' || a === 'restore'
                            ? 'border-green-600 text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-950/30'
                            : 'border-gray-300 text-gray-800 hover:bg-gray-50'
                      )}
                    >
                      {t(`trustSafetyModeration.action.${a}`)}
                    </button>
                  ))}
                  {item.senderUserId && (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => openSuspend(item)}
                      className="ml-auto rounded-xl px-3 py-1.5 text-sm border border-red-400 bg-red-400 text-white hover:bg-red-300 disabled:opacity-50"
                    >
                      {t('trustSafetyModeration.suspendSender')}
                    </button>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>

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

      {confirmDelete && (
        <ConfirmModal
          title={t('trustSafetyModeration.deleteConfirmTitle')}
          message={t('trustSafetyModeration.deleteConfirmMessage')}
          confirmLabel={t('trustSafetyModeration.action.delete')}
          danger
          busy={busyId === idOf(confirmDelete)}
          onConfirm={async () => {
            const item = confirmDelete;
            await run(item, 'delete');
            setConfirmDelete(null);
          }}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
      {suspendTarget && (
        <SuspendUserModal users={[suspendTarget]} busy={suspendBusy} onClose={() => setSuspendTarget(null)} onSubmit={suspend} />
      )}
    </div>
  );
}
