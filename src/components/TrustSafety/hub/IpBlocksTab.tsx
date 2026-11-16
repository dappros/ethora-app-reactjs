// Ethora.com platform, copyright: Dappros Ltd (c) 2026, all rights reserved
//
// T&S > Blocked IPs (docs/TRUST_AND_SAFETY.md section 15): addresses and
// ranges that may not sign up (GET /v2/admin/trust-safety/ip-blocks), for
// every App or one App, with expiry, note, source account and hits. Blocks
// are added from a dialog (IP or CIDR, scope, duration, note) and removed
// after a confirmation. Only sign-up is blocked; existing accounts can still
// sign in from a blocked address.
import { Dialog, DialogPanel } from '@headlessui/react';
import cn from 'classnames';
import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  httpCreateTsIpBlock,
  httpDeleteTsIpBlock,
  httpGetTsIpBlocks,
} from '../../../http';
import { useTranslation } from '../../../i18n/useTranslation';
import type { TsIpBlock } from '../../../models';
import { accessErrorMessage } from '../../../utils/accessError';
import { apiError } from '../../../utils/apiError';
import {
  IP_BLOCK_DURATIONS,
  IP_BLOCK_REASON_MAX,
  IpBlockDraft,
  IpBlockDuration,
  TS_HUB_PAGE_SIZE,
  checkIpInput,
  hubListQuery,
  ipBlockBody,
  ipBlockIsActive,
  ipBlockLabel,
  nextListParams,
  offsetFromParams,
} from '../../../utils/tsHub';
import { Segmented } from '../../AIWidget/appearance/Fields';
import { IconClose } from '../../Icons/IconClose';
import { ConfirmModal } from '../../modal/ConfirmModal';
import { AppFilter, BUTTON_DANGER, Pager, SELECT, TabHeader } from './common';
import {
  durationLabel,
  formatIpDate,
  ipBlockErrorMessage,
} from './ipBlockText';
import { useAppOptions } from './useAppOptions';

const INPUT =
  'w-full rounded-xl bg-gray-100 outline-none py-[10px] px-[14px] text-sm font-sans';
const LABEL = 'text-gray-500 text-[12px] font-sans mb-1';
const ERROR = 'text-red-600 dark:text-red-400 text-[12px] mt-1';

interface DialogProps {
  onClose: () => void;
  onSaved: () => void;
}

function IpBlockDialog({ onClose, onSaved }: DialogProps) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState<IpBlockDraft>({
    ip: '',
    appId: '',
    days: 30,
    reason: '',
  });
  const [oneApp, setOneApp] = useState(false);
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [serverError, setServerError] = useState<{
    code?: string;
    text: string;
  } | null>(null);
  const appOptions = useAppOptions();

  const set = (patch: Partial<IpBlockDraft>) =>
    setDraft((d) => ({ ...d, ...patch }));
  const ipProblem = checkIpInput(draft.ip);
  const appMissing = oneApp && !draft.appId;
  const ipFieldError =
    serverError &&
    (serverError.code === 'INVALID_IP' ||
      serverError.code === 'IP_RANGE_TOO_WIDE')
      ? serverError.text
      : null;

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (ipProblem || appMissing || busy) return;
    setBusy(true);
    setServerError(null);
    try {
      const body = ipBlockBody({ ...draft, appId: oneApp ? draft.appId : '' });
      await httpCreateTsIpBlock(body);
      toast.success(t('tsHub.ipBlocks.toast.added').replace('{ip}', body.ip));
      onSaved();
    } catch (err) {
      setServerError({
        code: apiError(err, '').code,
        text: ipBlockErrorMessage(err, t),
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog className="relative z-50" open onClose={busy ? () => {} : onClose}>
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-[560px] max-h-full overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="font-varela text-[22px] break-words min-w-0">
              {t('tsHub.ipBlocks.addTitle')}
            </div>
            {!busy && (
              <button
                type="button"
                onClick={onClose}
                aria-label={t('tsHub.close')}
              >
                <IconClose />
              </button>
            )}
          </div>
          <p className="text-sm text-gray-500 mb-4">
            {t('tsHub.ipBlocks.addIntro')}
          </p>
          <form
            className="flex flex-col gap-4 font-sans text-sm"
            onSubmit={save}
            noValidate
          >
            <label className="block">
              <div className={LABEL}>{t('tsHub.ipBlocks.field.ip')}</div>
              <input
                className={cn(
                  `${INPUT} font-mono`,
                  ((touched && ipProblem) || ipFieldError) &&
                    'border border-red-500'
                )}
                autoFocus
                spellCheck={false}
                autoComplete="off"
                placeholder="203.0.113.7 / 203.0.113.0/24"
                value={draft.ip}
                onChange={(e) => {
                  set({ ip: e.target.value });
                  setServerError(null);
                }}
              />
              {touched && ipProblem ? (
                <div className={ERROR}>
                  {t(`tsHub.ipBlocks.ipProblem.${ipProblem}`)}
                </div>
              ) : (
                <p className="text-xs text-gray-500 mt-1">
                  {t('tsHub.ipBlocks.ipHelp')}
                </p>
              )}
            </label>

            <fieldset>
              <legend className={LABEL}>
                {t('tsHub.ipBlocks.field.scope')}
              </legend>
              <div className="flex flex-col gap-2">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    name="ts-ip-scope"
                    checked={!oneApp}
                    onChange={() => setOneApp(false)}
                  />
                  <span>{t('tsHub.ipBlocks.scope.all')}</span>
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    name="ts-ip-scope"
                    checked={oneApp}
                    onChange={() => setOneApp(true)}
                  />
                  <span>{t('tsHub.ipBlocks.scope.one')}</span>
                </label>
              </div>
              {oneApp && (
                <select
                  aria-label={t('tsHub.ipBlocks.scope.pick')}
                  className={cn(
                    `${INPUT} mt-2`,
                    touched && appMissing && 'border border-red-500'
                  )}
                  value={draft.appId}
                  onChange={(e) => set({ appId: e.target.value })}
                >
                  <option value="">{t('tsHub.ipBlocks.scope.pick')}</option>
                  {appOptions.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              )}
              {touched && appMissing && (
                <div className={ERROR}>
                  {t('tsHub.ipBlocks.scope.required')}
                </div>
              )}
              <p className="text-xs text-gray-500 mt-1">
                {t('tsHub.ipBlocks.scopeHelp')}
              </p>
            </fieldset>

            <div>
              <div className={LABEL}>{t('tsHub.ipBlocks.field.duration')}</div>
              <Segmented
                ariaLabel={t('tsHub.ipBlocks.field.duration')}
                value={String(draft.days)}
                onChange={(v) => set({ days: Number(v) as IpBlockDuration })}
                options={IP_BLOCK_DURATIONS.map((d) => ({
                  value: String(d),
                  label: durationLabel(d, t),
                }))}
              />
            </div>

            <label className="block">
              <div className={LABEL}>
                {t('tsHub.ipBlocks.field.reason')}{' '}
                <span className="tabular-nums">
                  ({draft.reason.length}/{IP_BLOCK_REASON_MAX})
                </span>
              </div>
              <textarea
                className={`${INPUT} min-h-[80px]`}
                maxLength={IP_BLOCK_REASON_MAX}
                placeholder={t('tsHub.ipBlocks.reasonPlaceholder')}
                value={draft.reason}
                onChange={(e) => set({ reason: e.target.value })}
              />
            </label>

            {serverError && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 text-red-800 dark:bg-red-950/40 dark:border-red-900 dark:text-red-300 p-3"
              >
                {serverError.text}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                disabled={busy}
                onClick={onClose}
                className="w-full py-2.5 rounded-xl border border-brand-500 text-brand-500 hover:bg-brand-hover disabled:opacity-50"
              >
                {t('tsHub.cancel')}
              </button>
              <button
                type="submit"
                disabled={
                  busy || (touched && (Boolean(ipProblem) || appMissing))
                }
                className="w-full py-2.5 rounded-xl border text-white bg-brand-500 border-brand-darker hover:bg-brand-darker disabled:opacity-50"
              >
                {busy ? t('tsHub.saving') : t('tsHub.ipBlocks.add')}
              </button>
            </div>
          </form>
        </DialogPanel>
      </div>
    </Dialog>
  );
}

export function IpBlocksTab() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const appId = (searchParams.get('appId') || '').trim();
  const q = searchParams.get('q') || '';
  const includeExpired = searchParams.get('includeExpired') === 'true';
  const offset = offsetFromParams(searchParams);
  const [search, setSearch] = useState(q);
  const [items, setItems] = useState<TsIpBlock[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  const [adding, setAdding] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState<TsIpBlock | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const query = hubListQuery(
    { appId, q, includeExpired: includeExpired ? 'true' : '' },
    offset
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await httpGetTsIpBlocks(query);
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
      setSearchParams(nextListParams(searchParams, 'ipBlocks', patch), {
        replace: true,
      }),
    [searchParams, setSearchParams]
  );

  // Search applies after a short pause (same pattern as the other lists).
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

  const seenApps = useMemo(
    () =>
      items
        .filter((b) => b.appId)
        .map((b) => ({ id: b.appId, name: b.appName })),
    [items]
  );
  const appOptions = useAppOptions(seenApps);
  const appName = (id?: string | null, name?: string | null) =>
    name || appOptions.find((a) => a.id === id)?.name || id || '';

  const scopeText = (b: TsIpBlock) =>
    b.appId ? appName(b.appId, b.appName) : t('tsHub.ipBlocks.scope.all');

  const remove = async () => {
    if (!confirmRemove) return;
    setBusyId(confirmRemove._id);
    try {
      await httpDeleteTsIpBlock(confirmRemove._id);
      toast.success(
        t('tsHub.ipBlocks.toast.removed').replace(
          '{ip}',
          ipBlockLabel(confirmRemove.cidr)
        )
      );
      setConfirmRemove(null);
      await load();
    } catch (e) {
      toast.error(
        t('tsHub.ipBlocks.toast.removeFailed').replace(
          '{error}',
          accessErrorMessage(e, t)
        )
      );
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <TabHeader
        title={t('tsHub.tab.ipBlocks')}
        intro={t('tsHub.ipBlocks.intro')}
        loading={loading}
        onRefresh={() => void load()}
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={unavailable}
          onClick={() => setAdding(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-500 text-white hover:bg-brand-darker font-sans text-sm disabled:opacity-50"
        >
          {t('tsHub.ipBlocks.addButton')}
        </button>
        <input
          type="search"
          aria-label={t('tsHub.filter.search')}
          placeholder={t('tsHub.ipBlocks.searchPlaceholder')}
          className={`${SELECT} w-full sm:w-[260px]`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <AppFilter
          value={appId}
          options={appOptions}
          onChange={(v) => update({ appId: v })}
        />
        <label className="inline-flex items-center gap-2 text-sm font-sans cursor-pointer">
          <input
            type="checkbox"
            checked={includeExpired}
            onChange={(e) =>
              update({ includeExpired: e.target.checked ? 'true' : '' })
            }
          />
          {t('tsHub.ipBlocks.includeExpired')}
        </label>
      </div>

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
          {includeExpired || q || appId
            ? t('tsHub.ipBlocks.emptyFiltered')
            : t('tsHub.ipBlocks.empty')}
        </div>
      )}

      {items.length > 0 && (
        <div className="relative overflow-x-auto rounded-2xl border border-gray-200">
          <table className="w-full min-w-[980px] text-sm">
            <thead>
              <tr className="text-left text-[12px] text-gray-500 border-b border-gray-200">
                <th className="py-2 px-3 font-normal">
                  {t('tsHub.ipBlocks.col.ip')}
                </th>
                <th className="py-2 px-3 font-normal">
                  {t('tsHub.ipBlocks.col.scope')}
                </th>
                <th className="py-2 px-3 font-normal whitespace-nowrap">
                  {t('tsHub.ipBlocks.col.expires')}
                </th>
                <th className="py-2 px-3 font-normal">
                  {t('tsHub.ipBlocks.col.reason')}
                </th>
                <th className="py-2 px-3 font-normal">
                  {t('tsHub.ipBlocks.col.source')}
                </th>
                <th className="py-2 px-3 font-normal text-right">
                  {t('tsHub.ipBlocks.col.hits')}
                </th>
                <th className="py-2 px-3 font-normal whitespace-nowrap">
                  {t('tsHub.ipBlocks.col.lastHit')}
                </th>
                <th className="py-2 px-3 font-normal">
                  {t('tsHub.ipBlocks.col.status')}
                </th>
                <th className="py-2 px-3 font-normal sr-only">
                  {t('tsHub.ipBlocks.col.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((b) => {
                const active = ipBlockIsActive(b);
                return (
                  <tr
                    key={b._id}
                    className={cn('align-top', !active && 'text-gray-500')}
                  >
                    <td className="py-2 px-3 font-mono text-xs break-all min-w-[140px]">
                      {ipBlockLabel(b.cidr)}
                    </td>
                    <td className="py-2 px-3 text-xs break-words max-w-[180px]">
                      {scopeText(b)}
                    </td>
                    <td className="py-2 px-3 text-xs whitespace-nowrap tabular-nums">
                      {b.until
                        ? formatIpDate(b.until) || '-'
                        : t('tsHub.ipBlocks.permanent')}
                    </td>
                    <td className="py-2 px-3 text-xs max-w-[240px]">
                      {b.reason ? (
                        <span className="whitespace-pre-wrap break-words">
                          {b.reason}
                        </span>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-xs break-all max-w-[200px]">
                      {b.sourceEmail || (b.sourceUserId ? b.sourceUserId : '-')}
                    </td>
                    <td className="py-2 px-3 text-right tabular-nums">
                      {typeof b.hits === 'number' ? b.hits : 0}
                    </td>
                    <td className="py-2 px-3 text-xs whitespace-nowrap tabular-nums">
                      {formatIpDate(b.lastHitAt) || '-'}
                    </td>
                    <td className="py-2 px-3">
                      <span
                        className={cn(
                          'inline-flex px-2 py-0.5 rounded-2xl text-xs whitespace-nowrap',
                          active
                            ? 'bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-300'
                            : 'bg-gray-100 text-gray-700'
                        )}
                      >
                        {active
                          ? t('tsHub.ipBlocks.status.active')
                          : t('tsHub.ipBlocks.status.expired')}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right whitespace-nowrap">
                      <button
                        type="button"
                        className={BUTTON_DANGER}
                        disabled={busyId === b._id}
                        onClick={() => setConfirmRemove(b)}
                      >
                        {t('tsHub.ipBlocks.remove')}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Pager
        offset={offset}
        count={items.length}
        total={total}
        pageSize={TS_HUB_PAGE_SIZE}
        loading={loading}
        onOffset={(o) => update({ offset: o })}
      />

      {adding && (
        <IpBlockDialog
          onClose={() => setAdding(false)}
          onSaved={() => {
            setAdding(false);
            void load();
          }}
        />
      )}
      {confirmRemove && (
        <ConfirmModal
          title={t('tsHub.ipBlocks.removeTitle').replace(
            '{ip}',
            ipBlockLabel(confirmRemove.cidr)
          )}
          message={t('tsHub.ipBlocks.removeMessage').replace(
            '{scope}',
            scopeText(confirmRemove)
          )}
          confirmLabel={t('tsHub.ipBlocks.remove')}
          danger
          busy={busyId === confirmRemove._id}
          onConfirm={remove}
          onCancel={() => setConfirmRemove(null)}
        />
      )}
    </div>
  );
}
