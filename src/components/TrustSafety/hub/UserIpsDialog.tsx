// Ethora.com platform, copyright: Dappros Ltd (c) 2026, all rights reserved
//
// T&S > Suspended users > IPs (docs/TRUST_AND_SAFETY.md section 15): the
// addresses a suspended account was seen from (GET /v2/admin/trust-safety/
// users/:userId/ips), with first and last seen, how often, where from, the
// other accounts seen on the same address (the ban-evasion signal) and a
// "Block sign-ups" action per address: 30 days, every App, linked to this
// account. Blocks are changed or removed in the Blocked IPs tab.
import { Dialog, DialogPanel } from '@headlessui/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { httpCreateTsIpBlock, httpGetTsUserIps } from '../../../http';
import { useTranslation } from '../../../i18n/useTranslation';
import type { TsIpBlock, TsSuspendedUser, TsUserIp } from '../../../models';
import { accessErrorMessage } from '../../../utils/accessError';
import { apiError } from '../../../utils/apiError';
import {
  IP_BLOCK_QUICK_DAYS,
  hubTabPath,
  ipBlockBody,
  ipBlockFromResponse,
  ipBlockIsActive,
} from '../../../utils/tsHub';
import { IconClose } from '../../Icons/IconClose';
import { SuspendedPeerBadge } from '../../Users/SuspendedPeerBadge';
import { BUTTON_PLAIN } from './common';
import { formatIpDate, ipBlockErrorMessage } from './ipBlockText';
import { useAppOptions } from './useAppOptions';

interface Props {
  user: TsSuspendedUser;
  onClose: () => void;
}

export function UserIpsDialog({ user, onClose }: Props) {
  const { t } = useTranslation();
  const [items, setItems] = useState<TsUserIp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  const [busyIp, setBusyIp] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await httpGetTsUserIps(user._id);
      setItems(r.data?.items || []);
      setUnavailable(false);
    } catch (e) {
      if (apiError(e, '').status === 404) setUnavailable(true);
      else setError(accessErrorMessage(e, t));
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [user._id, t]);

  useEffect(() => {
    void load();
  }, [load]);

  const seenApps = useMemo(
    () =>
      items
        .flatMap((i) =>
          (i.otherAccounts || []).map((a) => ({ id: a.appId, name: null }))
        )
        .filter((a) => a.id),
    [items]
  );
  const appOptions = useAppOptions(seenApps);
  const appName = (id?: string | null) =>
    appOptions.find((a) => a.id === id)?.name || id || '';

  const who =
    user.email ||
    `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
    user._id;

  const block = async (row: TsUserIp) => {
    setBusyIp(row.ip);
    try {
      const body = ipBlockBody({
        ip: row.ip,
        appId: '',
        days: IP_BLOCK_QUICK_DAYS,
        reason: t('tsHub.userIps.reason').replace('{email}', who),
        sourceUserId: user._id,
      });
      const r = await httpCreateTsIpBlock(body);
      const created: TsIpBlock = ipBlockFromResponse(r.data) || {
        _id: '',
        cidr: row.ip,
        appId: null,
        until: new Date(
          Date.now() + IP_BLOCK_QUICK_DAYS * 86400000
        ).toISOString(),
        active: true,
      };
      setItems((list) =>
        list.map((i) => (i.ip === row.ip ? { ...i, blocked: created } : i))
      );
      toast.success(t('tsHub.ipBlocks.toast.added').replace('{ip}', row.ip));
    } catch (e) {
      toast.error(
        t('tsHub.userIps.blockFailed').replace(
          '{error}',
          ipBlockErrorMessage(e, t)
        )
      );
    } finally {
      setBusyIp(null);
    }
  };

  const blockedText = (b: TsIpBlock) => {
    const when = b.until
      ? t('tsHub.userIps.blockedUntil').replace('{date}', formatIpDate(b.until))
      : t('tsHub.userIps.blockedPermanent');
    return b.appId
      ? `${when} ${t('tsHub.userIps.blockedForApp').replace('{app}', b.appName || appName(b.appId))}`
      : when;
  };

  const sourceLabel = (s: string) => {
    const key = `tsHub.userIps.source.${s}`;
    const v = t(key);
    return v === key ? s : v;
  };

  return (
    <Dialog
      className="relative z-50"
      open
      onClose={busyIp ? () => {} : onClose}
    >
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-[760px] max-h-full overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div className="font-varela text-[22px] break-words min-w-0">
              {t('tsHub.userIps.title').replace('{name}', who)}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label={t('tsHub.close')}
              disabled={Boolean(busyIp)}
            >
              <IconClose />
            </button>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            {t('tsHub.userIps.intro')}{' '}
            <Link
              to={hubTabPath('ipBlocks')}
              className="text-brand-500 underline"
              onClick={onClose}
            >
              {t('tsHub.userIps.manageLink')}
            </Link>
          </p>

          {loading && (
            <p className="text-sm text-gray-500">{t('tsHub.loading')}</p>
          )}
          {unavailable && (
            <div className="bg-brand-150 p-4 text-sm font-sans rounded-xl mb-4">
              {t('tsHub.unavailable')}
            </div>
          )}
          {error && (
            <p className="mb-4 text-sm text-red-600 dark:text-red-400">
              {t('tsHub.loadFailed').replace('{error}', error)}
            </p>
          )}
          {!loading && !error && !unavailable && !items.length && (
            <div className="bg-brand-150 p-4 text-sm font-sans rounded-xl mb-4">
              {t('tsHub.userIps.empty')}
            </div>
          )}

          {items.length > 0 && (
            <ul className="flex flex-col gap-3 font-sans text-sm">
              {items.map((row) => {
                const active = row.blocked
                  ? ipBlockIsActive(row.blocked)
                  : false;
                const others = row.otherAccounts || [];
                return (
                  <li
                    key={row.ip}
                    className="rounded-2xl border border-gray-200 p-4 min-w-0"
                  >
                    <div className="flex flex-wrap items-start gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="font-mono text-sm break-all">
                          {row.ip}
                        </div>
                        <div className="mt-1 text-xs text-gray-500 flex flex-wrap gap-x-4 gap-y-1 tabular-nums">
                          <span>
                            {t('tsHub.userIps.firstSeen').replace(
                              '{date}',
                              formatIpDate(row.firstSeen) || '-'
                            )}
                          </span>
                          <span>
                            {t('tsHub.userIps.lastSeen').replace(
                              '{date}',
                              formatIpDate(row.lastSeen) || '-'
                            )}
                          </span>
                          <span>
                            {t('tsHub.userIps.count').replace(
                              '{count}',
                              String(row.count ?? 0)
                            )}
                          </span>
                        </div>
                        {(row.sources || []).length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {(row.sources || []).map((s) => (
                              <span
                                key={s}
                                className="px-2 py-0.5 rounded-2xl text-xs bg-gray-100 text-gray-700"
                              >
                                {sourceLabel(s)}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="shrink-0 text-right">
                        {row.blocked && active ? (
                          <span className="inline-flex px-2 py-0.5 rounded-2xl text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                            {blockedText(row.blocked)}
                          </span>
                        ) : (
                          <button
                            type="button"
                            className={BUTTON_PLAIN}
                            disabled={busyIp !== null}
                            title={t('tsHub.userIps.blockTitle')}
                            onClick={() => void block(row)}
                          >
                            {busyIp === row.ip
                              ? t('tsHub.saving')
                              : t('tsHub.userIps.block')}
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="mt-3">
                      <div className="text-[12px] text-gray-500 mb-1">
                        {t('tsHub.userIps.others').replace(
                          '{count}',
                          String(others.length)
                        )}
                      </div>
                      {others.length ? (
                        <ul className="flex flex-col gap-1">
                          {others.map((a) => (
                            <li
                              key={a._id}
                              className="flex flex-wrap items-center gap-2 text-xs"
                            >
                              <span className="break-all text-gray-800">
                                {a.email || a._id}
                              </span>
                              {a.appId && (
                                <span className="text-gray-500 break-all">
                                  {appName(a.appId)}
                                </span>
                              )}
                              {a.suspended && <SuspendedPeerBadge />}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-gray-500">
                          {t('tsHub.userIps.noOthers')}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="flex justify-end pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={Boolean(busyIp)}
              className="px-6 py-2.5 rounded-xl border border-brand-500 text-brand-500 hover:bg-brand-hover disabled:opacity-50"
            >
              {t('tsHub.close')}
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
