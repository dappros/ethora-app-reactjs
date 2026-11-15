// Ethora.com platform, copyright: Dappros Ltd (c) 2026, all rights reserved
//
// T&S > Suspended users (docs/TRUST_AND_SAFETY.md sections 8 and 13): the
// suspended accounts of every App (GET /v2/admin/trust-safety/suspended-users)
// with the reason, the message the user sees, the dates, the scope and what
// happened to their content. Unsuspend goes to the App's own endpoint, with
// the access-level rule the server enforces; each row links to the App's
// Users page with its Suspended view. The IPs action (section 15) opens the
// addresses the account was seen from, to block sign-ups from them.
import { DateTime } from 'luxon';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { httpGetTsSuspendedUsers, httpUnsuspendUser } from '../../../http';
import { useTranslation } from '../../../i18n/useTranslation';
import type { TsSuspendedUser } from '../../../models';
import { useAppStore } from '../../../store/useAppStore';
import { accessErrorMessage } from '../../../utils/accessError';
import { apiError } from '../../../utils/apiError';
import { SUSPENSION_REASON_CODES, suspensionReasonKey } from '../../../utils/suspension';
import {
  ACCESS_RANK,
  TS_HUB_PAGE_SIZE,
  appSuspendedUsersPath,
  canLiftSuspension,
  hubListQuery,
  nextListParams,
  offsetFromParams,
} from '../../../utils/tsHub';
import { ConfirmModal } from '../../modal/ConfirmModal';
import { AppFilter, BUTTON_PLAIN, Pager, SELECT, TabHeader } from './common';
import { useAppOptions } from './useAppOptions';
import { UserIpsDialog } from './UserIpsDialog';

const formatDate = (iso?: string | null) => {
  if (!iso) return '';
  const d = DateTime.fromISO(iso);
  return d.isValid ? d.toFormat('dd LLL yyyy t') : '';
};

const nameOf = (u: TsSuspendedUser) => `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email || u._id;

export function SuspendedUsersTab() {
  const { t } = useTranslation();
  const currentUser = useAppStore((s) => s.currentUser);
  const [searchParams, setSearchParams] = useSearchParams();
  const appId = (searchParams.get('appId') || '').trim();
  const reasonParam = searchParams.get('reasonCode') || '';
  const reasonCode = (SUSPENSION_REASON_CODES as string[]).includes(reasonParam) ? reasonParam : '';
  const q = searchParams.get('q') || '';
  const offset = offsetFromParams(searchParams);
  const [search, setSearch] = useState(q);
  const [items, setItems] = useState<TsSuspendedUser[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  const [target, setTarget] = useState<TsSuspendedUser | null>(null);
  const [tenant, setTenant] = useState(false);
  const [busy, setBusy] = useState(false);
  const [ipsOf, setIpsOf] = useState<TsSuspendedUser | null>(null);

  // The hub is for superadmins: their level is the top one.
  const myLevel = currentUser?.isSuperAdmin?.write || currentUser?.isSuperAdmin?.read ? ACCESS_RANK.superadmin : ACCESS_RANK.admin;

  const query = hubListQuery({ appId, reasonCode, q }, offset);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await httpGetTsSuspendedUsers(query);
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

  const update = useCallback(
    (patch: Record<string, string | number>) =>
      setSearchParams(nextListParams(searchParams, 'suspended', patch), { replace: true }),
    [searchParams, setSearchParams]
  );

  // Search applies after a short pause (same pattern as the Quarantine list).
  const pushed = useRef(q);
  useEffect(() => {
    const value = search.trim();
    if (value === q) return;
    const timer = setTimeout(() => {
      pushed.current = value;
      update({ q: value });
    }, 400);
    return () => clearTimeout(timer);
  }, [search, q, update]);
  useEffect(() => {
    if (q !== pushed.current) {
      pushed.current = q;
      setSearch(q);
    }
  }, [q]);

  const seenApps = useMemo(() => items.map((u) => ({ id: u.appId, name: u.appName })), [items]);
  const appOptions = useAppOptions(seenApps);

  const unsuspend = async () => {
    if (!target) return;
    setBusy(true);
    try {
      const r = await httpUnsuspendUser(target.appId, target._id, tenant ? 'tenant' : 'app');
      const results = r.data?.results || [];
      if (results.some((x) => x.status === 'unsuspended') || !results.length) toast.success(t('userSuspension.toast.unsuspended'));
      else toast.info(t('userSuspension.toast.notSuspended'));
      setTarget(null);
      await load();
    } catch (e) {
      toast.error(`${t('userSuspension.toast.unsuspendFailedPrefix')} ${accessErrorMessage(e, t)}`);
    } finally {
      setBusy(false);
    }
  };

  const modeLabel = (prefix: string, v?: string | null) => {
    if (!v) return t('tsHub.suspended.modeUnknown');
    const key = `${prefix}.${v}`;
    const s = t(key);
    return s === key ? v : s;
  };

  return (
    <div>
      <TabHeader title={t('tsHub.tab.suspended')} intro={t('tsHub.suspended.intro')} loading={loading} onRefresh={() => void load()} />

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <input
          type="search"
          aria-label={t('tsHub.filter.search')}
          placeholder={t('tsHub.suspended.searchPlaceholder')}
          className={`${SELECT} w-full sm:w-[280px]`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <AppFilter value={appId} options={appOptions} onChange={(v) => update({ appId: v })} />
        <select
          aria-label={t('tsHub.suspended.filter.reason')}
          className={SELECT}
          value={reasonCode}
          onChange={(e) => update({ reasonCode: e.target.value })}
        >
          <option value="">{t('tsHub.suspended.allReasons')}</option>
          {SUSPENSION_REASON_CODES.map((r) => (
            <option key={r} value={r}>
              {t(`userSuspension.reason.${r}`)}
            </option>
          ))}
        </select>
      </div>

      {unavailable && <div className="bg-brand-150 p-4 text-sm font-sans rounded-xl mb-4">{t('tsHub.unavailable')}</div>}
      {error && <p className="mb-4 text-sm text-red-600 dark:text-red-400">{t('tsHub.loadFailed').replace('{error}', error)}</p>}
      {!loading && !error && !unavailable && !items.length && (
        <div className="bg-brand-150 p-4 text-sm font-sans rounded-xl mb-4">{t('tsHub.suspended.empty')}</div>
      )}

      {items.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-gray-200">
          <table className="w-full min-w-[920px] text-sm">
            <thead>
              <tr className="text-left text-[12px] text-gray-500 border-b border-gray-200">
                <th className="py-2 px-3 font-normal">{t('tsHub.suspended.col.user')}</th>
                <th className="py-2 px-3 font-normal">{t('tsHub.suspended.col.app')}</th>
                <th className="py-2 px-3 font-normal">{t('tsHub.suspended.col.reason')}</th>
                <th className="py-2 px-3 font-normal">{t('tsHub.suspended.col.message')}</th>
                <th className="py-2 px-3 font-normal whitespace-nowrap">{t('tsHub.suspended.col.date')}</th>
                <th className="py-2 px-3 font-normal">{t('tsHub.suspended.col.scope')}</th>
                <th className="py-2 px-3 font-normal">{t('tsHub.suspended.col.content')}</th>
                <th className="py-2 px-3 font-normal sr-only">{t('tsHub.suspended.col.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((u) => {
                const s = u.suspension || ({} as TsSuspendedUser['suspension']);
                const name = nameOf(u);
                const canLift = canLiftSuspension(currentUser?._id, myLevel, u);
                const until = formatDate(s.until);
                return (
                  <tr key={`${u.appId}-${u._id}`} className="align-top">
                    <td className="py-2 px-3 min-w-[160px]">
                      <div className="text-gray-800 break-words">{name}</div>
                      {u.email && u.email !== name && <div className="text-xs text-gray-500 break-all">{u.email}</div>}
                    </td>
                    <td className="py-2 px-3 min-w-[140px]">
                      <Link
                        to={appSuspendedUsersPath(u.appId)}
                        className="text-gray-800 break-all hover:underline"
                        title={t('tsHub.suspended.openUsers')}
                      >
                        {u.appName || u.appId}
                      </Link>
                    </td>
                    <td className="py-2 px-3 text-xs">{t(suspensionReasonKey(s.reasonCode))}</td>
                    <td className="py-2 px-3 text-xs max-w-[240px]">
                      {s.message ? (
                        <span className="whitespace-pre-wrap break-words">{s.message}</span>
                      ) : (
                        <span className="italic text-gray-500">{t('tsHub.suspended.noMessage')}</span>
                      )}
                      {s.internalNote && (
                        <div className="mt-1 text-gray-500 break-words">
                          {t('userSuspension.badgeTooltip.note').replace('{note}', s.internalNote)}
                        </div>
                      )}
                    </td>
                    <td className="py-2 px-3 text-xs whitespace-nowrap tabular-nums">
                      {formatDate(s.suspendedAt) || '-'}
                      {until && <div className="text-gray-500">{t('userSuspension.badgeTooltip.until').replace('{date}', until)}</div>}
                    </td>
                    <td className="py-2 px-3 text-xs">
                      {s.scope === 'tenant' ? t('tsHub.suspended.scope.tenant') : t('tsHub.suspended.scope.app')}
                    </td>
                    <td className="py-2 px-3 text-xs">
                      {s.content ? (
                        <dl className="grid grid-cols-[auto,_1fr] gap-x-2">
                          <dt className="text-gray-500">{t('trustSafetySuspend.messagesLabel')}</dt>
                          <dd>{modeLabel('tsHub.suspended.mode', s.content.messagesMode)}</dd>
                          <dt className="text-gray-500">{t('trustSafetySuspend.mediaLabel')}</dt>
                          <dd>{modeLabel('tsHub.suspended.mode', s.content.mediaMode)}</dd>
                          <dt className="text-gray-500">{t('trustSafetySuspend.nameLabel')}</dt>
                          <dd>{modeLabel('tsHub.suspended.name', s.content.nameMode)}</dd>
                        </dl>
                      ) : (
                        <span className="text-gray-500">{t('tsHub.suspended.contentUnknown')}</span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-right">
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        <button
                          type="button"
                          className={BUTTON_PLAIN}
                          title={t('tsHub.userIps.actionTitle')}
                          onClick={() => setIpsOf(u)}
                        >
                          {t('tsHub.userIps.action')}
                        </button>
                        {canLift ? (
                          <button
                            type="button"
                            className={BUTTON_PLAIN}
                            title={t('userSuspension.action.unsuspendTitle')}
                            onClick={() => {
                              setTenant(s.scope === 'tenant');
                              setTarget(u);
                            }}
                          >
                            {t('userSuspension.action.unsuspend')}
                          </button>
                        ) : (
                          <span className="text-xs text-gray-500" title={t('tsHub.suspended.cannotLiftTitle')}>
                            {t('tsHub.suspended.cannotLift')}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Pager offset={offset} count={items.length} total={total} pageSize={TS_HUB_PAGE_SIZE} loading={loading} onOffset={(o) => update({ offset: o })} />

      {ipsOf && <UserIpsDialog user={ipsOf} onClose={() => setIpsOf(null)} />}

      {target && (
        <ConfirmModal
          title={t('userSuspension.unsuspend.title').replace('{name}', nameOf(target))}
          message={
            <span className="block">
              {t('userSuspension.unsuspend.message')}
              <label className="mt-4 flex items-center justify-center gap-2 cursor-pointer font-sans text-sm">
                <input type="checkbox" checked={tenant} onChange={(e) => setTenant(e.target.checked)} />
                {t('userSuspension.unsuspend.tenantLabel')}
              </label>
            </span>
          }
          confirmLabel={t('userSuspension.action.unsuspend')}
          busy={busy}
          onConfirm={unsuspend}
          onCancel={() => setTarget(null)}
        />
      )}
    </div>
  );
}
