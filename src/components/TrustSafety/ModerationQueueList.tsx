// Ethora.com platform, copyright: Dappros Ltd (c) 2026, all rights reserved
//
// The moderation queue items (docs/TRUST_AND_SAFETY.md section 6), shared by
// App admin > Moderation and the cross-App queue of T&S > Moderation queue:
// one card per item (kind, category, scores, image signals, content, sender,
// room, applied action) with the moderator actions, the delete confirmation
// and "Suspend sender". Actions always go to the item's own App
// (POST /v2/apps/:appId/moderation/items/:id/action); superadmins may act on
// any App. Media previews are blurred until "Show" is pressed.
import cn from 'classnames';
import { DateTime } from 'luxon';
import { ReactNode, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { httpModerationItemAction, httpSuspendUser } from '../../http';
import { useTranslation } from '../../i18n/useTranslation';
import type { ModelAppUser, ModerationAction, ModerationItem, SuspendUserBody } from '../../models';
import { accessErrorMessage } from '../../utils/accessError';
import { apiError } from '../../utils/apiError';
import {
  MODERATION_CATEGORIES,
  TS_IMAGE_SIGNALS,
  formatScore,
  mediaSignalsOf,
  moderationActionsFor,
  ruleNameOf,
} from '../../utils/trustSafety';
import { Segmented } from '../AIWidget/appearance/Fields';
import { ConfirmModal } from '../modal/ConfirmModal';
import { SuspendUserModal } from '../modal/SuspendUserModal';

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

const idOf = (item: ModerationItem) => item._id || item.id || '';

const formatTime = (iso?: string | null) => {
  if (!iso) return '';
  const d = DateTime.fromISO(iso);
  return d.isValid ? d.toFormat('dd LLL yyyy t') : '';
};

const previewOf = (item: ModerationItem) => item.previewUrl || item.file?.locationPreview || null;

interface CardProps {
  item: ModerationItem & { appName?: string | null };
  busy: boolean;
  // Cross-App queue: show the App (a link to its Moderation page).
  showApp?: boolean;
  onAction: (action: ModerationAction) => void;
  onSuspend?: () => void;
}

export function ModerationItemCard({ item, busy, showApp, onAction, onSuspend }: CardProps) {
  const { t } = useTranslation();
  const [revealed, setRevealed] = useState(false);
  const [brokenPreview, setBrokenPreview] = useState(false);
  const { chips, lists } = scoreEntries(item);
  const signals = mediaSignalsOf(item);
  const actions = moderationActionsFor(item);
  const categoryKey = `trustSafetyModeration.category.${item.category}`;
  const categoryLabel = item.category ? (t(categoryKey) === categoryKey ? item.category : t(categoryKey)) : '';
  const ruleName = ruleNameOf(item);

  const senderName = () => {
    const s = item.sender;
    const name = `${s?.firstName || ''} ${s?.lastName || ''}`.trim();
    return name || s?.email || item.senderUserId || t('trustSafetyModeration.unknownSender');
  };

  const appliedLabel = () => {
    const a = item.action || '';
    const key = `trustSafetyModeration.applied.${a}`;
    const label = t(key);
    const base = label === key ? a : label;
    const sourceKey = `trustSafetyModeration.source.${item.source || ''}`;
    const source = item.source ? t(sourceKey) : '';
    return source && source !== sourceKey ? `${base} (${source})` : base;
  };

  const renderContent = () => {
    if (item.kind === 'media') {
      const src = previewOf(item);
      if (!src || brokenPreview) {
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
              onError={() => setBrokenPreview(true)}
              className={cn('h-full w-full object-cover transition', !revealed && 'blur-xl scale-110')}
            />
          </div>
          <button type="button" className="text-xs text-brand-500 underline" onClick={() => setRevealed((r) => !r)}>
            {revealed ? t('trustSafetyModeration.hidePreview') : t('trustSafetyModeration.showPreview')}
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

  return (
    <li className="rounded-2xl border border-gray-200 p-4 min-w-0">
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,_1fr),_260px] gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2 text-xs">
            <span className="px-2 py-0.5 rounded-2xl bg-brand-150 text-brand-500">{t(`trustSafetyModeration.kind.${item.kind}`)}</span>
            {categoryLabel && (
              <span className="px-2 py-0.5 rounded-2xl bg-gray-100 text-gray-700 font-semibold">{categoryLabel}</span>
            )}
            {ruleName && (
              <span className="px-2 py-0.5 rounded-2xl bg-gray-100 text-gray-700 break-all" title={t('trustSafetyModeration.ruleTitle')}>
                {t('trustSafetyModeration.rule').replace('{name}', ruleName)}
              </span>
            )}
            {chips.map((c) => (
              <span key={c.key} className="px-2 py-0.5 rounded-2xl bg-gray-100 text-gray-600 tabular-nums">
                {c.key.replace(/_/g, ' ')} {c.value}
              </span>
            ))}
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
          {renderContent()}
        </div>
        <div className="min-w-0 text-xs text-gray-600 flex flex-col gap-1">
          {showApp && item.appId && (
            <div>
              <span className="text-gray-500">{t('trustSafetyModeration.col.app')}: </span>
              <Link
                to={`/app/admin/apps/${encodeURIComponent(item.appId)}/moderation`}
                className="text-gray-800 break-all hover:underline"
              >
                {item.appName || item.appId}
              </Link>
            </div>
          )}
          <div>
            <span className="text-gray-500">{t('trustSafetyModeration.col.sender')}: </span>
            <span className="text-gray-800 break-words">{senderName()}</span>
            {item.sender?.email && senderName() !== item.sender.email && (
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
              {appliedLabel()}
            </div>
          )}
          {item.resolvedAt && (
            <div className="text-gray-500">{t('trustSafetyModeration.resolvedAt').replace('{date}', formatTime(item.resolvedAt))}</div>
          )}
        </div>
      </div>
      {(actions.length > 0 || (item.senderUserId && onSuspend)) && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {actions.map((a) => (
            <button
              key={a}
              type="button"
              disabled={busy}
              title={t(`trustSafetyModeration.action.${a}Title`)}
              onClick={() => onAction(a)}
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
          {item.senderUserId && onSuspend && (
            <button
              type="button"
              disabled={busy}
              onClick={onSuspend}
              className="ml-auto rounded-xl px-3 py-1.5 text-sm border border-red-400 bg-red-400 text-white hover:bg-red-300 disabled:opacity-50"
            >
              {t('trustSafetyModeration.suspendSender')}
            </button>
          )}
        </div>
      )}
    </li>
  );
}

interface ListProps {
  items: Array<ModerationItem & { appName?: string | null }>;
  // The App an item's actions go to (the page's App, or the item's own).
  appIdOf: (item: ModerationItem) => string | undefined;
  showApp?: boolean;
  // Called after an action or a suspension changed something.
  onChanged: () => void | Promise<void>;
}

/** The cards of a queue page, with the actions, delete confirmation and suspend dialog. */
export function ModerationQueueList({ items, appIdOf, showApp, onChanged }: ListProps) {
  const { t } = useTranslation();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<ModerationItem | null>(null);
  const [suspendTarget, setSuspendTarget] = useState<{ appId: string; user: ModelAppUser } | null>(null);
  const [suspendBusy, setSuspendBusy] = useState(false);

  const run = async (item: ModerationItem, action: ModerationAction) => {
    const appId = appIdOf(item);
    if (!appId) return;
    setBusyId(idOf(item));
    try {
      await httpModerationItemAction(appId, idOf(item), action);
      toast.success(t('trustSafetyModeration.actionDone').replace('{action}', t(`trustSafetyModeration.action.${action}`)));
      await onChanged();
    } catch (e) {
      toast.error(t('trustSafetyModeration.actionFailed').replace('{error}', accessErrorMessage(e, t)));
    } finally {
      setBusyId(null);
    }
  };

  const openSuspend = (item: ModerationItem) => {
    const appId = appIdOf(item);
    if (!item.senderUserId || !appId) return;
    // The dialog only reads the name and email for its title.
    setSuspendTarget({
      appId,
      user: {
        _id: item.senderUserId,
        firstName: item.sender?.firstName || '',
        lastName: item.sender?.lastName || '',
        email: item.sender?.email || '',
      } as ModelAppUser,
    });
  };

  const suspend = async (body: SuspendUserBody) => {
    if (!suspendTarget) return;
    setSuspendBusy(true);
    try {
      const r = await httpSuspendUser(suspendTarget.appId, suspendTarget.user._id, body);
      const res = r.data?.results || [];
      if (res.some((x) => x.status === 'already_suspended')) {
        toast.info(t('userSuspension.toast.alreadySuspended').replace('{count}', '1'));
      } else {
        toast.success(t('userSuspension.toast.suspended').replace('{count}', '1'));
      }
      setSuspendTarget(null);
      await onChanged();
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

  return (
    <>
      <ul className="flex flex-col gap-3">
        {items.map((item) => (
          <ModerationItemCard
            key={idOf(item)}
            item={item}
            showApp={showApp}
            busy={busyId === idOf(item)}
            onAction={(a) => (a === 'delete' ? setConfirmDelete(item) : void run(item, a))}
            onSuspend={appIdOf(item) ? () => openSuspend(item) : undefined}
          />
        ))}
      </ul>
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
        <SuspendUserModal
          users={[suspendTarget.user]}
          busy={suspendBusy}
          onClose={() => setSuspendTarget(null)}
          onSubmit={suspend}
        />
      )}
    </>
  );
}

export type ModerationStatusFilter = 'open' | 'resolved';

const SELECT = 'rounded-xl bg-gray-100 outline-none py-2 px-3 text-sm font-sans';

interface FilterProps {
  status: ModerationStatusFilter;
  kind: string;
  category: string;
  onChange: (patch: { status?: ModerationStatusFilter; kind?: string; category?: string }) => void;
  // More filters after the shared ones (the App picker of the cross-App queue).
  children?: ReactNode;
}

/** Status (open / resolved), kind and category filters of a queue. */
export function ModerationFilterBar({ status, kind, category, onChange, children }: FilterProps) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-wrap items-center gap-3 mb-4">
      <Segmented<ModerationStatusFilter>
        ariaLabel={t('trustSafetyModeration.filter.status')}
        value={status}
        onChange={(v) => onChange({ status: v })}
        options={[
          { value: 'open', label: t('trustSafetyModeration.status.open') },
          { value: 'resolved', label: t('trustSafetyModeration.status.resolved') },
        ]}
      />
      <select
        aria-label={t('trustSafetyModeration.filter.kind')}
        className={SELECT}
        value={kind}
        onChange={(e) => onChange({ kind: e.target.value })}
      >
        <option value="">{t('trustSafetyModeration.kind.all')}</option>
        <option value="message">{t('trustSafetyModeration.kind.message')}</option>
        <option value="media">{t('trustSafetyModeration.kind.media')}</option>
      </select>
      <select
        aria-label={t('trustSafetyModeration.filter.category')}
        className={SELECT}
        value={category}
        onChange={(e) => onChange({ category: e.target.value })}
      >
        <option value="">{t('trustSafetyModeration.category.all')}</option>
        {MODERATION_CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {t(`trustSafetyModeration.category.${c}`)}
          </option>
        ))}
      </select>
      {children}
    </div>
  );
}
