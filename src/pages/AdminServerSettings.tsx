import type { AxiosError } from 'axios';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { httpV2 } from '../http';
import { ConfirmModal } from '../components/modal/ConfirmModal';
import { Segmented } from '../components/AIWidget/appearance/Fields';
import { ChatComponent } from './AppSettings/ChatComponent';
import { useTranslation } from '../i18n/useTranslation';
import type {
  RestartRequestResponse,
  RestartScope,
  ServerModule,
  ServerSetting,
  ServerSettingsResponse,
  ServerSettingsTab,
  ServerStatus,
  ServerUpdateInfo,
  UpdaterJob,
} from '../models';
import { canCancelJob, fill, formatCountdown, isJobActive } from '../utils/serverNotice';
import { useAppStore } from '../store/useAppStore';

// Server settings page (super admins): install-wide values with their source
// (saved here, the deployment configuration, or the default), saved per group.
// Settings of kind "restart" show which process has to restart before a saved
// value is live; the API reports when each process last started.
//
// The API groups the settings into tabs (Chats, Users, AI, Email & reports,
// System) and reports the Enterprise modules, each shown at the top of its
// tab. An API that sends no tabs gets the single list it always had.

const LEGACY_GROUPS = ['email', 'feedback', 'rooms', 'reports', 'rateLimits', 'webIndex', 'ai'];
const TAB_ORDER: ServerSettingsTab[] = ['api', 'chats', 'users', 'ai', 'email', 'system'];
// Groups rendered inside a module card rather than on their own.
const MODULE_GROUP: Record<string, string> = { ai: 'agents', mcp: 'mcp' };
// Groups with no Save button while the install keeps them locked.
const LOCKABLE_GROUP = 'encryption';

type ApiErr = AxiosError<{ error?: string; code?: string; details?: Record<string, string> }>;

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ');
}

const ALL_SCOPES: RestartScope[] = ['api', 'jobs', 'ai'];
const RESTART_POLL_MS = 3000;
const RESTART_TIMEOUT_MS = 3 * 60 * 1000;
// "When" of a restart / update / rollback: now or a few minutes ahead, so
// every user sees the notice before the server goes down.
const WHEN_SECONDS = [0, 60, 300, 900] as const;
type WhenSeconds = (typeof WHEN_SECONDS)[number];
const WHEN_KEY: Record<WhenSeconds, string> = { 0: 'now', 60: 'in1', 300: 'in5', 900: 'in15' };
const UPDATE_POLL_MS = 3000;
const TARGET_RE = /^\d{4}\.\d+$/;
const HIDDEN_JOB_KEY = 'ethora.serverSettings.hiddenUpdateJob';
const readHiddenJob = () => {
  try {
    return localStorage.getItem(HIDDEN_JOB_KEY);
  } catch {
    return null;
  }
};
const GB = 1024 * 1024 * 1024;
const gb = (bytes: number) => (bytes >= 10 * GB ? Math.round(bytes / GB) : Math.round((bytes / GB) * 10) / 10);

// "Ethora Core, not registered" rather than the raw "core, unlicensed".
type Translate = (key: string) => string;
const licenseLabelWith = (t: Translate) => (tier?: string | null, state?: string | null) => {
  const key = `serverSettings.status.licenseState.${tier || 'unknown'}.${state || 'unknown'}`;
  const known = t(key);
  if (known && known !== key) return known;
  return [tier, state].filter(Boolean).join(', ') || '?';
};

export default function AdminServerSettings() {
  const { t } = useTranslation();
  const licenseLabel = licenseLabelWith(t);
  const currentUser = useAppStore((s) => s.currentUser);
  // The install's own app: the chat customized on the Chats tab is its web chat.
  const baseApp = useAppStore((s) => s.currentApp);
  const baseAppId = baseApp?._id;
  const baseAppColor = baseApp?.primaryColor;
  const canEdit = Boolean(currentUser?.isSuperAdmin?.write);
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState<ServerSettingsResponse | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [busyGroup, setBusyGroup] = useState<string | null>(null);
  const [message, setMessage] = useState<{ group: string; kind: 'ok' | 'error'; text: string } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState<string | null>(null);
  // Module page sign-ins, fetched only when "Show" is pressed.
  const [creds, setCreds] = useState<Record<string, { username: string; password: string } | null>>({});
  const [credsError, setCredsError] = useState<Record<string, string>>({});
  // Read-only status (System tab): null until loaded, 'unsupported' on an API without it.
  const [status, setStatus] = useState<ServerStatus | 'unsupported' | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);
  // Restart from the admin panel: the dialog's scopes, then the request being
  // waited for until every named process reports a start after it.
  const [confirmScopes, setConfirmScopes] = useState<RestartScope[] | 'all' | null>(null);
  const [restart, setRestart] = useState<
    | { phase: 'scheduled' | 'running'; request: RestartRequestResponse }
    | { phase: 'done' | 'timeout' | 'error' | 'cancelled'; text?: string }
    | null
  >(null);
  const [restartWhen, setRestartWhen] = useState<WhenSeconds>(0);
  const [restartCancelError, setRestartCancelError] = useState<string | null>(null);
  // Bumped to stop the timers of a restart being watched (cancel, unmount);
  // `seen` keeps a scheduled request found in the status from being picked
  // up twice.
  const restartBox = useRef<{ gen: number; seen: Set<string> }>({ gen: 0, seen: new Set() });
  // Update from the admin panel (compose installs with the updater).
  const [update, setUpdate] = useState<ServerUpdateInfo | null>(null);
  const [updatePollTick, setUpdatePollTick] = useState(0);
  const [updateDialog, setUpdateDialog] = useState<'update' | 'rollback' | null>(null);
  const [updateTarget, setUpdateTarget] = useState('');
  const [updateWhen, setUpdateWhen] = useState<WhenSeconds>(0);
  const [updateBusy, setUpdateBusy] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [jobError, setJobError] = useState<string | null>(null);
  const [hiddenJob, setHiddenJob] = useState<string | null>(readHiddenJob);
  // Clock for the countdowns.
  const [now, setNow] = useState(() => Date.now());
  // Name the one configuration file once the API says how the server was
  // installed (compose bundle .env or deploy.yml); generic text until then.
  const installKind = data?.installKind || data?.info?.installKind;
  const kind = installKind ? `.${installKind}` : '';
  // A translation that is missing falls back to `fallback` (or nothing).
  const tr = (key: string, fallback = '') => {
    const v = t(key);
    return v === key ? fallback : v;
  };

  const load = useCallback(async () => {
    try {
      const r = await httpV2.get<ServerSettingsResponse>('/server-settings');
      setData(r.data);
    } catch {
      setData({ settings: [], processes: {} });
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  const byGroup = useMemo(() => {
    const m: Record<string, ServerSetting[]> = {};
    for (const s of data?.settings || []) (m[s.group] = m[s.group] || []).push(s);
    return m;
  }, [data]);

  // Tabs as the API orders them; none for an older API (one list).
  const tabs = useMemo<ServerSettingsTab[]>(() => {
    const fromApi = (data?.tabs || []).filter((x) => TAB_ORDER.includes(x));
    return fromApi;
  }, [data]);

  // Ordered groups per tab: the API's order, else the order of the settings.
  const groupsByTab = useMemo(() => {
    const m: Record<string, string[]> = {};
    const seen = new Set<string>();
    const add = (key: string, tab: string) => {
      if (seen.has(key) || !(byGroup[key] || []).length) return;
      seen.add(key);
      (m[tab] = m[tab] || []).push(key);
    };
    for (const g of data?.groups || []) add(g.key, g.tab);
    for (const s of data?.settings || []) if (s.tab) add(s.group, s.tab);
    return m;
  }, [data, byGroup]);

  const requestedTab = searchParams.get('tab') as ServerSettingsTab | null;
  const activeTab: ServerSettingsTab | null = tabs.length ? (requestedTab && tabs.includes(requestedTab) ? requestedTab : tabs[0]) : null;
  const loadStatus = useCallback(async () => {
    setStatusLoading(true);
    setStatusError(null);
    try {
      const r = await httpV2.get<ServerStatus>('/server-settings/status');
      setStatus(r.data);
    } catch (e) {
      const err = e as ApiErr;
      if (err.response?.status === 404) setStatus('unsupported');
      else setStatusError(err.response?.data?.error || err.message);
    } finally {
      setStatusLoading(false);
    }
  }, []);
  // Loaded when the System tab is opened, not with the page.
  useEffect(() => {
    if (activeTab === 'system' && status === null && !statusLoading && !statusError) loadStatus();
  }, [activeTab, status, statusLoading, statusError, loadStatus]);

  // Wait for a restart request: until its notBefore (a scheduled restart),
  // then poll the status until every requested process has started after
  // it (failed polls are expected while the API is down; the HTTP client
  // waits those out).
  const watchRestart = useCallback(
    (request: RestartRequestResponse) => {
      const box = restartBox.current;
      box.gen += 1;
      const gen = box.gen;
      box.seen.add(request.id);
      const notBefore = request.notBefore ? Date.parse(request.notBefore) : NaN;
      const askedAt = Math.max(Date.parse(request.at) || 0, Number.isFinite(notBefore) ? notBefore : 0);
      const startPolling = () => {
        if (gen !== box.gen) return;
        setRestart({ phase: 'running', request });
        const deadline = Date.now() + RESTART_TIMEOUT_MS;
        const poll = async () => {
          if (gen !== box.gen) return;
          if (Date.now() > deadline) {
            setRestart({ phase: 'timeout' });
            return;
          }
          try {
            const r = await httpV2.get<ServerStatus>('/server-settings/status');
            if (gen !== box.gen) return;
            const processes = r.data.uptime?.processes || {};
            const done = request.scopes.every((sc) => {
              const startedAt = processes[sc];
              return Boolean(startedAt) && new Date(startedAt as string).getTime() > askedAt;
            });
            if (done) {
              setStatus(r.data);
              setRestart({ phase: 'done' });
              load();
              return;
            }
          } catch {
            // The API is restarting; try again on the next tick.
          }
          setTimeout(poll, RESTART_POLL_MS);
        };
        setTimeout(poll, RESTART_POLL_MS);
      };
      const wait = Number.isFinite(notBefore) ? notBefore - Date.now() : 0;
      if (wait > 0) {
        setRestart({ phase: 'scheduled', request });
        setTimeout(startPolling, wait);
      } else {
        startPolling();
      }
    },
    [load],
  );
  // Leaving the page stops the timers.
  useEffect(() => {
    const box = restartBox.current;
    return () => {
      box.gen += 1;
    };
  }, []);

  const openRestart = (scopes: RestartScope[] | 'all') => {
    setRestartWhen(0);
    setConfirmScopes(scopes);
  };

  const startRestart = async (scopes: RestartScope[] | 'all') => {
    setConfirmScopes(null);
    setRestartCancelError(null);
    try {
      const r = await httpV2.post<RestartRequestResponse>('/server-settings/restart', restartWhen ? { scopes, delaySeconds: restartWhen } : { scopes });
      watchRestart(r.data);
    } catch (e) {
      const err = e as ApiErr;
      setRestart({ phase: 'error', text: err.response?.data?.error || err.message });
    }
  };

  const cancelRestart = async () => {
    setRestartCancelError(null);
    try {
      await httpV2.post('/server-settings/restart/cancel');
      restartBox.current.gen += 1;
      setRestart({ phase: 'cancelled' });
      load();
      loadStatus();
    } catch (e) {
      const err = e as ApiErr;
      if (err.response?.status === 409 && err.response.data?.code === 'TOO_LATE') setRestartCancelError(t('serverSettings.restart.tooLate'));
      else setRestartCancelError(fill(t('serverSettings.restart.cancelFailed'), { error: err.response?.data?.error || err.message }));
    }
  };
  const restartRunning = restart?.phase === 'running' || restart?.phase === 'scheduled';

  // A restart scheduled earlier (this admin on another visit, or another
  // admin) shows its countdown and Cancel too.
  useEffect(() => {
    if (!status || status === 'unsupported' || restart) return;
    const last = status.restart?.lastRequest;
    if (!last?.notBefore || restartBox.current.seen.has(last.id)) return;
    if (Date.parse(last.notBefore) > Date.now()) {
      watchRestart({ id: last.id, scopes: last.scopes, at: last.at, notBefore: last.notBefore });
    }
  }, [status, restart, watchRestart]);

  // ------------------------------------------------ update now --
  const updaterAvailable = Boolean(status && status !== 'unsupported' && status.update.updater?.available);
  const loadUpdate = useCallback(async () => {
    try {
      const r = await httpV2.get<ServerUpdateInfo>('/server-settings/update');
      setUpdate(r.data);
    } catch {
      // Keep the last answer; the next poll tries again.
    } finally {
      setUpdatePollTick((n) => n + 1);
    }
  }, []);
  useEffect(() => {
    if (updaterAvailable && canEdit) loadUpdate();
  }, [updaterAvailable, canEdit, loadUpdate]);
  const job = update?.updater?.job ?? null;
  const jobActive = isJobActive(job);
  // Every 3 s while a job is scheduled or running. The API itself restarts
  // mid-update; the HTTP client waits that out.
  useEffect(() => {
    if (!jobActive) return;
    const id = setTimeout(loadUpdate, UPDATE_POLL_MS);
    return () => clearTimeout(id);
  }, [jobActive, updatePollTick, loadUpdate]);
  // A job that just finished: the version, settings and status changed.
  const wasJobActive = useRef(false);
  useEffect(() => {
    if (wasJobActive.current && !jobActive) {
      load();
      loadStatus();
    }
    wasJobActive.current = jobActive;
  }, [jobActive, load, loadStatus]);

  const ticking = restart?.phase === 'scheduled' || Boolean(jobActive && job?.notBefore);
  useEffect(() => {
    if (!ticking) return;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [ticking]);

  const apiErrorText = (err: ApiErr) => {
    const code = err.response?.data?.code;
    const known = code ? tr(`serverSettings.update.error.${code}`) : '';
    return known || err.response?.data?.error || err.message;
  };
  const mergeJob = (next: UpdaterJob | undefined) => {
    if (!next) return;
    setUpdate((u) => (u && u.updater ? { ...u, updater: { ...u.updater, job: next } } : u));
  };
  const openUpdate = (kind: 'update' | 'rollback', target = '') => {
    setUpdateTarget(target);
    setUpdateWhen(0);
    setUpdateError(null);
    setUpdateDialog(kind);
  };
  const submitUpdate = async () => {
    const kind = updateDialog;
    if (!kind) return;
    const target = updateTarget.trim();
    if (kind === 'update' && !TARGET_RE.test(target)) {
      setUpdateError(fill(t('serverSettings.update.invalidTarget'), { example: update?.latest || '2610.80' }));
      return;
    }
    setUpdateBusy(true);
    setUpdateError(null);
    setJobError(null);
    try {
      const delay = updateWhen ? { delaySeconds: updateWhen } : {};
      const r =
        kind === 'update'
          ? await httpV2.post<{ job: UpdaterJob }>('/server-settings/update', { target, ...delay })
          : await httpV2.post<{ job: UpdaterJob }>('/server-settings/update/rollback', delay);
      mergeJob(r.data?.job);
      setUpdateDialog(null);
      loadUpdate();
    } catch (e) {
      setUpdateError(fill(t('serverSettings.update.requestFailed'), { error: apiErrorText(e as ApiErr) }));
    } finally {
      setUpdateBusy(false);
    }
  };
  const cancelUpdate = async () => {
    setUpdateBusy(true);
    setJobError(null);
    try {
      const r = await httpV2.post<{ job: UpdaterJob }>('/server-settings/update/cancel');
      mergeJob(r.data?.job);
      loadUpdate();
    } catch (e) {
      setJobError(fill(t('serverSettings.update.requestFailed'), { error: apiErrorText(e as ApiErr) }));
    } finally {
      setUpdateBusy(false);
    }
  };
  const hideJob = (id: string) => {
    setHiddenJob(id);
    try {
      localStorage.setItem(HIDDEN_JOB_KEY, id);
    } catch {
      // Storage blocked: hidden until the page reloads.
    }
  };

  const selectTab = (tab: ServerSettingsTab) => {
    const next = new URLSearchParams(searchParams);
    next.set('tab', tab);
    setSearchParams(next, { replace: true });
    setMessage(null);
  };

  const pendingScopes = useMemo(() => {
    const scopes = new Set<string>();
    for (const s of data?.settings || []) if (s.restartPending) scopes.add(s.scope);
    return Array.from(scopes);
  }, [data]);

  const draftOf = (s: ServerSetting) => (drafts[s.key] !== undefined ? drafts[s.key] : s.type === 'secret' ? '' : s.value);
  const changed = (s: ServerSetting) => drafts[s.key] !== undefined && drafts[s.key] !== (s.type === 'secret' ? '' : s.value);

  // A tab gets a dot when it holds unsaved edits or a value waiting for a restart.
  const tabNeedsAttention = (tab: string) =>
    (data?.settings || []).some((s) => (s.tab || '') === tab && (changed(s) || s.restartPending));

  const save = async (group: string) => {
    const values: Record<string, string> = {};
    for (const s of byGroup[group] || []) if (changed(s)) values[s.key] = drafts[s.key];
    if (!Object.keys(values).length) return;
    setBusyGroup(group);
    setMessage(null);
    setFieldErrors({});
    try {
      const r = await httpV2.put<ServerSettingsResponse>('/server-settings', { values });
      setData(r.data);
      setDrafts((d) => {
        const next = { ...d };
        for (const k of Object.keys(values)) delete next[k];
        return next;
      });
      setMessage({ group, kind: 'ok', text: t('serverSettings.saved') });
    } catch (e) {
      const err = e as ApiErr;
      const details = err.response?.data?.details || {};
      setFieldErrors(details);
      setMessage({ group, kind: 'error', text: t('serverSettings.failed').replace('{error}', err.response?.data?.error || err.message) });
    } finally {
      setBusyGroup(null);
    }
  };

  const reset = async (s: ServerSetting) => {
    setBusyGroup(s.group);
    setMessage(null);
    try {
      const r = await httpV2.delete<ServerSettingsResponse>(`/server-settings/${encodeURIComponent(s.key)}`);
      setData(r.data);
      setDrafts((d) => {
        const next = { ...d };
        delete next[s.key];
        return next;
      });
      setMessage({ group: s.group, kind: 'ok', text: t('serverSettings.resetDone') });
    } catch (e) {
      const err = e as ApiErr;
      setMessage({ group: s.group, kind: 'error', text: t('serverSettings.failed').replace('{error}', err.response?.data?.error || err.message) });
    } finally {
      setBusyGroup(null);
    }
  };

  const copy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      setTimeout(() => setCopied((c) => (c === id ? null : c)), 1500);
    } catch {
      // Clipboard refused (no permission / insecure context): the text stays selectable.
    }
  };

  const toggleCreds = async (key: string) => {
    if (creds[key]) {
      setCreds((c) => ({ ...c, [key]: null }));
      return;
    }
    try {
      const r = await httpV2.get<{ username: string; password: string }>(`/server-settings/modules/${encodeURIComponent(key)}/credentials`);
      setCreds((c) => ({ ...c, [key]: r.data }));
      setCredsError((e) => ({ ...e, [key]: '' }));
    } catch (e) {
      const err = e as ApiErr;
      setCredsError((x) => ({ ...x, [key]: err.response?.data?.error || err.message }));
    }
  };

  const scopeName = (scope: string) => t(`serverSettings.scope.${scope}`);

  // Encryption cannot be allowed beyond what the install itself was set up for.
  const e2eeLocked = data?.info?.e2eeInstall === false;

  const renderInput = (s: ServerSetting) => {
    const locked = s.key === 'E2EE_ALLOWED' && e2eeLocked;
    const disabled = !canEdit || busyGroup === s.group || locked;
    const base = cn(
      'w-full rounded-xl border border-gray-300 p-3 text-sm disabled:opacity-60',
      locked && 'bg-gray-100 text-gray-500 cursor-not-allowed',
    );
    const set = (v: string) => setDrafts((d) => ({ ...d, [s.key]: v }));
    if (s.type === 'boolean') {
      return (
        <select value={draftOf(s)} onChange={(e) => set(e.target.value)} disabled={disabled} className={base}>
          <option value="true">{t('serverSettings.boolean.true')}</option>
          <option value="false">{t('serverSettings.boolean.false')}</option>
        </select>
      );
    }
    if (s.type === 'choice') {
      return (
        <select value={draftOf(s)} onChange={(e) => set(e.target.value)} disabled={disabled} className={base}>
          {(s.options || []).map((o) => (
            <option key={o} value={o}>{tr(`serverSettings.option.${s.key}.${o}`, o)}</option>
          ))}
        </select>
      );
    }
    if (s.type === 'secret') {
      return (
        <input
          type="password"
          value={draftOf(s)}
          onChange={(e) => set(e.target.value)}
          disabled={disabled}
          placeholder={s.value ? `${t('serverSettings.current')}: ${s.value}` : t('serverSettings.secretPlaceholder')}
          autoComplete="new-password"
          className={cn(base, 'font-mono')}
        />
      );
    }
    return (
      <input
        type={s.type === 'integer' ? 'number' : 'text'}
        min={s.type === 'integer' ? 0 : undefined}
        value={draftOf(s)}
        onChange={(e) => set(e.target.value)}
        disabled={disabled}
        spellCheck={false}
        className={cn(base, s.type === 'cron' && 'font-mono')}
      />
    );
  };

  // Read-only facts some groups carry next to their settings.
  const groupNote = (group: string) => {
    if (group === 'translation' && data?.info) {
      return data.info.translateUrl
        ? t('serverSettings.note.translateUrl').replace('{url}', data.info.translateUrl)
        : t('serverSettings.note.translateUrlNone');
    }
    if (group === 'encryption' && e2eeLocked) return t('serverSettings.note.e2eeInstallOff');
    return '';
  };

  // The settings of a group and its Save button; `embedded` drops the card
  // (used inside a module card).
  const renderGroupBody = (group: string) => (
    <>
      {groupNote(group) && <p className="mb-4 text-sm text-gray-600">{groupNote(group)}</p>}
      <div className="grid grid-cols-1 gap-5">
        {(byGroup[group] || []).map((s) => (
          <div key={s.key} className="grid grid-cols-1 md:grid-cols-[260px,_1fr] gap-x-4 gap-y-1 min-w-0">
            <div className="min-w-0">
              <div className="text-sm font-semibold">{tr(`serverSettings.key.${s.key}`, s.key)}</div>
              <div className="text-xs text-gray-500">
                {t(`serverSettings.source.${s.source}`)}
                {' | '}
                {s.kind === 'live' ? t('serverSettings.kind.live') : t('serverSettings.kind.restart').replace('{scope}', scopeName(s.scope))}
                {s.restartPending && (
                  <span className="ml-2 inline-block rounded-full bg-amber-100 text-amber-900 px-2 py-0.5 text-[11px] font-semibold">{t('serverSettings.restartPending')}</span>
                )}
              </div>
            </div>
            <div className="min-w-0">
              {renderInput(s)}
              {fieldErrors[s.key] && <div className="mt-1 text-xs text-red-700">{fieldErrors[s.key]}</div>}
              <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                {tr(`serverSettings.desc.${s.key}`) && <span>{tr(`serverSettings.desc.${s.key}`)}</span>}
                {s.source === 'panel' && canEdit && (
                  <button type="button" onClick={() => reset(s)} disabled={busyGroup === s.group} className="text-brand-500 underline disabled:opacity-50">
                    {t('serverSettings.reset')}
                    {s.envValue !== null ? ` (${s.envValue})` : s.default ? ` (${s.default})` : ''}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      {!(group === LOCKABLE_GROUP && e2eeLocked) && (
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => save(group)}
          disabled={!canEdit || busyGroup === group || !(byGroup[group] || []).some(changed)}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-brand-500 text-white hover:bg-brand-darker font-sans text-sm disabled:opacity-50"
        >
          {busyGroup === group ? t('serverSettings.saving') : t('serverSettings.save')}
        </button>
        {message && message.group === group && (
          <span className={cn('text-sm', message.kind === 'ok' ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400')}>{message.text}</span>
        )}
      </div>
      )}
    </>
  );

  const openLink = (url: string) => (
    <a href={url} target="_blank" rel="noopener noreferrer" className="text-brand-500 underline shrink-0">
      {t('serverSettings.open')}
    </a>
  );

  const renderGroup = (group: string) => (
    <div key={group} className="rounded-2xl bg-gray-50 p-4 md:p-8 mb-6 min-w-0">
      <h3 className="font-varela text-[18px] md:text-[20px] mb-4">{tr(`serverSettings.group.${group}`, group)}</h3>
      {group === 'swagger' && data?.info?.apiDocsUrl && (
        <p className="mb-4 flex flex-wrap items-center gap-2 text-sm text-gray-600 min-w-0">
          <span className="break-all">{data.info.apiDocsUrl}</span>
          {openLink(data.info.apiDocsUrl)}
        </p>
      )}
      {renderGroupBody(group)}
    </div>
  );

  const moduleState = (m: ServerModule) => {
    if (m.running === true) return { label: t('serverSettings.module.state.running'), cls: 'bg-green-100 text-green-900' };
    if (m.installed === true) return { label: t('serverSettings.module.state.notResponding'), cls: 'bg-amber-100 text-amber-900' };
    if (m.installed === false) return { label: t('serverSettings.module.state.notInstalled'), cls: 'bg-gray-200 text-gray-800' };
    return { label: t('serverSettings.module.state.unknown'), cls: 'bg-gray-200 text-gray-800' };
  };

  const renderModule = (m: ServerModule) => {
    const state = moduleState(m);
    const embedded = MODULE_GROUP[m.key];
    return (
      <div key={`module-${m.key}`} className="rounded-2xl border border-gray-200 p-4 md:p-6 mb-6 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-varela text-[18px] md:text-[20px] mr-2">{tr(`serverSettings.module.${m.key}`, m.key)}</h3>
          <span className={cn('inline-block rounded-full px-2 py-0.5 text-xs font-semibold', state.cls)}>{state.label}</span>
          {!m.licensed && (
            <span className="inline-block rounded-full px-2 py-0.5 text-xs font-semibold bg-red-100 text-red-900">{t('serverSettings.module.notLicensed')}</span>
          )}
        </div>
        {tr(`serverSettings.module.${m.key}.desc`) && <p className="mt-2 text-sm text-gray-600">{tr(`serverSettings.module.${m.key}.desc`)}</p>}
        {m.url && m.key === 'mcp' && (
          <div className="mt-3">
            <div className="text-xs text-gray-500 mb-1">{t('serverSettings.module.connectorUrl')}</div>
            <div className="flex items-stretch gap-2 min-w-0">
              <code className="flex-1 min-w-0 overflow-x-auto whitespace-nowrap rounded-xl bg-gray-100 px-3 py-2 text-xs font-mono">{m.url}</code>
              <button type="button" onClick={() => copy(m.url || '', `url-${m.key}`)} className="shrink-0 rounded-xl border border-gray-300 px-3 text-xs hover:bg-gray-50">
                {copied === `url-${m.key}` ? t('serverSettings.module.copied') : t('serverSettings.module.copy')}
              </button>
            </div>
          </div>
        )}
        {m.url && m.key !== 'mcp' && (
          <p className="mt-3 flex flex-wrap items-center gap-2 text-sm min-w-0">
            <span className="break-all text-gray-600">{m.url}</span>
            {openLink(m.url)}
          </p>
        )}
        {m.hasCredentials && (
          <div className="mt-3 text-sm min-w-0">
            <div className="text-xs text-gray-500 mb-1">{t('serverSettings.module.credentials')}</div>
            <div className="flex flex-wrap items-center gap-2 min-w-0">
              <span className="text-gray-600">{t('serverSettings.module.username')}</span>
              <code className="rounded-lg bg-gray-100 px-2 py-1 text-xs font-mono">{creds[m.key]?.username ?? '••••'}</code>
              {creds[m.key] && (
                <button type="button" onClick={() => copy(creds[m.key]?.username || '', `user-${m.key}`)} className="rounded-xl border border-gray-300 px-2 py-1 text-xs hover:bg-gray-50">
                  {copied === `user-${m.key}` ? t('serverSettings.module.copied') : t('serverSettings.module.copy')}
                </button>
              )}
              <span className="text-gray-600 ml-2">{t('serverSettings.module.password')}</span>
              <code className="rounded-lg bg-gray-100 px-2 py-1 text-xs font-mono break-all">{creds[m.key]?.password ?? '••••••••••••'}</code>
              {creds[m.key] && (
                <button type="button" onClick={() => copy(creds[m.key]?.password || '', `pass-${m.key}`)} className="rounded-xl border border-gray-300 px-2 py-1 text-xs hover:bg-gray-50">
                  {copied === `pass-${m.key}` ? t('serverSettings.module.copied') : t('serverSettings.module.copy')}
                </button>
              )}
              <button type="button" onClick={() => toggleCreds(m.key)} className="rounded-xl border border-gray-300 px-2 py-1 text-xs hover:bg-gray-50">
                {creds[m.key] ? t('serverSettings.module.hide') : t('serverSettings.module.show')}
              </button>
            </div>
            {credsError[m.key] && <p className="mt-1 text-xs text-red-700">{credsError[m.key]}</p>}
            <p className="mt-1 text-xs text-gray-500">{t(`serverSettings.module.${m.key}.credentialsHint`)}</p>
          </div>
        )}
        {m.installed === false && m.enableCommand && (
          <div className="mt-3">
            <div className="text-xs text-gray-500 mb-1">{t('serverSettings.module.installHint')}</div>
            <div className="flex items-stretch gap-2 min-w-0">
              <code className="flex-1 min-w-0 overflow-x-auto whitespace-nowrap rounded-xl bg-gray-100 px-3 py-2 text-xs font-mono">{m.enableCommand}</code>
              <button type="button" onClick={() => copy(m.enableCommand || '', m.key)} className="shrink-0 rounded-xl border border-gray-300 px-3 text-xs hover:bg-gray-50">
                {copied === m.key ? t('serverSettings.module.copied') : t('serverSettings.module.copy')}
              </button>
            </div>
          </div>
        )}
        {embedded && (byGroup[embedded] || []).length > 0 && <div className="mt-5">{renderGroupBody(embedded)}</div>}
      </div>
    );
  };

  const renderTab = (tab: ServerSettingsTab) => {
    const chatsSub = searchParams.get('sub') === 'appearance' ? 'appearance' : 'main';
    const selectSub = (sub: 'main' | 'appearance') => {
      const next = new URLSearchParams(searchParams);
      next.set('tab', 'chats');
      if (sub === 'main') next.delete('sub');
      else next.set('sub', sub);
      setSearchParams(next, { replace: true });
    };
    if (tab === 'chats' && baseAppId) {
      return (
        <>
          <div className="mb-6">
            <Segmented<'main' | 'appearance'>
              ariaLabel="Chats"
              value={chatsSub}
              onChange={selectSub}
              options={[
                { value: 'main', label: 'Chat settings' },
                { value: 'appearance', label: 'Chat appearance' },
              ]}
            />
          </div>
          {chatsSub === 'appearance' ? (
            <ChatComponent appId={baseAppId} brandColor={baseAppColor} inline />
          ) : (
            renderTabBody(tab)
          )}
        </>
      );
    }
    return renderTabBody(tab);
  };

  const relTime = (iso: string | null | undefined) => {
    if (!iso) return t('serverSettings.status.never');
    const s = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
    if (s < 60) return t('serverSettings.status.justNow');
    if (s < 3600) return t('serverSettings.status.minutesAgo').replace('{n}', String(Math.round(s / 60)));
    if (s < 86400) return t('serverSettings.status.hoursAgo').replace('{n}', String(Math.round(s / 3600)));
    return t('serverSettings.status.daysAgo').replace('{n}', String(Math.round(s / 86400)));
  };
  // "45 min", "3 h", "3 days 4 h"
  const duration = (seconds: number | null | undefined) => {
    if (seconds === null || seconds === undefined || !Number.isFinite(seconds) || seconds < 0) return null;
    const m = Math.floor(seconds / 60);
    if (m < 60) return t('serverSettings.uptime.minutes').replace('{n}', String(Math.max(1, m)));
    const h = Math.floor(m / 60);
    if (h < 48) return t('serverSettings.uptime.hours').replace('{n}', String(h));
    const d = Math.floor(h / 24);
    const rest = h % 24;
    return rest ? t('serverSettings.uptime.daysHours').replace('{d}', String(d)).replace('{h}', String(rest)) : t('serverSettings.uptime.days').replace('{n}', String(d));
  };
  const sinceIso = (iso: string | null | undefined) => (iso ? duration((Date.now() - new Date(iso).getTime()) / 1000) : null);
  // Uptime of one row of the services list: processes from their start, the
  // data services from the seconds the API read from them.
  const serviceUptime = (key: string, st: ServerStatus) => {
    const up = st.uptime;
    if (!up) return null;
    if (key === 'api' || key === 'jobs' || key === 'ai') return sinceIso(up.processes?.[key]);
    if (key === 'mongo' || key === 'redis' || key === 'xmpp') return duration(up.services?.[key]);
    return null;
  };
  const scopesLabel = (scopes: RestartScope[]) => scopes.map(scopeName).join(', ');
  const dot = (ok: boolean | null) => (
    <span className={cn('inline-block h-2.5 w-2.5 rounded-full shrink-0', ok === true ? 'bg-green-500' : ok === false ? 'bg-red-500' : 'bg-gray-300')} aria-hidden />
  );

  // "Update now" instead of the command: an update is available and the
  // install runs the updater.
  const canUpdateNow = (st: ServerStatus) => canEdit && Boolean(st.update.available && st.update.updater?.available);

  const whenPicker = (value: WhenSeconds, onChange: (v: WhenSeconds) => void) => (
    <div className="mt-4 flex flex-col items-center gap-1">
      <div className="text-xs text-gray-500">{t('serverSettings.when.label')}</div>
      <Segmented<string>
        ariaLabel={t('serverSettings.when.label')}
        size="sm"
        value={String(value)}
        onChange={(v) => onChange(Number(v) as WhenSeconds)}
        options={WHEN_SECONDS.map((sec) => ({ value: String(sec), label: t(`serverSettings.when.${WHEN_KEY[sec]}`) }))}
      />
    </div>
  );

  const stepDot = (state: string) =>
    cn(
      'inline-block h-2.5 w-2.5 rounded-full shrink-0',
      state === 'done' && 'bg-green-500',
      state === 'running' && 'bg-blue-500 animate-pulse',
      state === 'failed' && 'bg-red-500',
      (state === 'pending' || state === 'skipped') && 'bg-gray-300',
    );

  // Progress of an update / rollback, then its outcome.
  const renderJob = (j: UpdaterJob) => {
    const active = isJobActive(j);
    const previous = update?.updater?.previous || null;
    const notBefore = j.notBefore ? Date.parse(j.notBefore) : NaN;
    const countdown = active && Number.isFinite(notBefore) && notBefore > now ? formatCountdown(notBefore - now) : null;
    const canRollBack = canEdit && !active && (j.state === 'succeeded' || j.state === 'failed') && Boolean(previous) && previous !== j.target;
    return (
      <div
        role="status"
        className={cn(
          'mt-3 rounded-xl border p-3 min-w-0',
          active && 'bg-blue-50 border-blue-200 text-blue-900',
          j.state === 'succeeded' && 'bg-green-50 border-green-200 text-green-900',
          j.state === 'failed' && 'bg-red-50 border-red-200 text-red-900',
          j.state === 'cancelled' && 'bg-gray-50 border-gray-200 text-gray-800',
        )}
      >
        <div className="font-semibold">{fill(t(`serverSettings.update.title.${j.action}.${j.state}`), { target: j.target })}</div>
        {j.state === 'failed' && j.error && <div className="mt-1">{j.error}</div>}
        {countdown && <div className="mt-1 tabular-nums">{fill(t('serverSettings.update.restartsIn'), { countdown })}</div>}
        {j.steps?.length > 0 && j.state !== 'cancelled' && (
          <ul className="mt-2 space-y-1 text-gray-800">
            {j.steps.map((stp) => (
              <li key={stp.name} className={cn('flex items-center gap-2 min-w-0', stp.state === 'skipped' && 'text-gray-400')}>
                <span className={stepDot(stp.state)} aria-hidden />
                <span className="min-w-0">{tr(`serverSettings.update.step.${stp.name}`, stp.name)}</span>
                <span className="text-xs text-gray-500">{tr(`serverSettings.update.stepState.${stp.state}`, stp.state)}</span>
              </li>
            ))}
          </ul>
        )}
        <details className="mt-2" open={j.state === 'failed'}>
          <summary className="cursor-pointer select-none text-xs text-gray-600">{t('serverSettings.update.log')}</summary>
          {j.log?.length ? (
            <pre className="mt-2 max-h-64 overflow-auto rounded-xl bg-gray-900 text-gray-100 p-3 text-xs font-mono whitespace-pre-wrap break-all">{j.log.join('\n')}</pre>
          ) : (
            <p className="mt-1 text-xs text-gray-500">{t('serverSettings.update.logEmpty')}</p>
          )}
        </details>
        {jobError && <p className="mt-2 text-sm text-red-700">{jobError}</p>}
        <div className="mt-3 flex flex-wrap items-center gap-3">
          {canEdit && canCancelJob(j) && (
            <button type="button" onClick={cancelUpdate} disabled={updateBusy} className="rounded-xl border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-800 hover:bg-gray-50 disabled:opacity-50">
              {t('serverSettings.update.cancel')}
            </button>
          )}
          {canRollBack && (
            <button type="button" onClick={() => openUpdate('rollback')} disabled={updateBusy || restartRunning} className="rounded-xl border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-800 hover:bg-gray-50 disabled:opacity-50">
              {fill(t('serverSettings.update.rollback'), { previous: previous || '' })}
            </button>
          )}
          {!active && (
            <button type="button" onClick={() => hideJob(j.id)} className="text-sm underline">
              {t('serverSettings.update.dismiss')}
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderStatus = () => {
    if (status === 'unsupported') return null;
    const st = status;
    return (
      <div key="status" className="rounded-2xl border border-gray-200 p-4 md:p-6 mb-6 min-w-0">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <h3 className="font-varela text-[18px] md:text-[20px] mr-auto">{t('serverSettings.status.title')}</h3>
          {st && <span className="text-xs text-gray-500">{t('serverSettings.status.checked').replace('{when}', relTime(st.checkedAt))}</span>}
          <button type="button" onClick={loadStatus} disabled={statusLoading} className="text-sm text-brand-500 underline disabled:opacity-50">
            {statusLoading ? t('serverSettings.status.loading') : t('serverSettings.status.refresh')}
          </button>
          {canEdit && st && (
            <button type="button" onClick={() => openRestart(st.restart?.pendingScopes?.length ? st.restart.pendingScopes : 'all')} disabled={restartRunning} className="text-sm text-brand-500 underline disabled:opacity-50">
              {t('serverSettings.restart.services')}
            </button>
          )}
        </div>
        {statusError && <p className="mt-2 text-sm text-red-700">{t('serverSettings.status.failed').replace('{error}', statusError)}</p>}
        {!st && !statusError && <p className="mt-2 text-sm text-gray-500">{t('serverSettings.status.loading')}</p>}
        {st && (
          <div className="mt-3 space-y-4 text-sm min-w-0">
            <div>
              <div className="text-gray-800">
                {t('serverSettings.status.version').replace('{build}', st.version.build || '?')}
                {st.version.installKind && <span className="text-gray-500"> ({st.version.installKind})</span>}
              </div>
              {duration(st.uptime?.serverSeconds) && (
                <div className="text-gray-600">{t('serverSettings.uptime.server').replace('{d}', duration(st.uptime?.serverSeconds) || '')}</div>
              )}
              {st.update.checked && st.update.available && (
                <div className="mt-2 rounded-xl bg-amber-50 border border-amber-200 p-3 min-w-0">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                    <div className="text-amber-900 font-semibold mr-auto">{t('serverSettings.status.updateAvailable').replace('{latest}', st.update.latest || '')}</div>
                    {canUpdateNow(st) && (
                      <button
                        type="button"
                        onClick={() => openUpdate('update', st.update.latest || '')}
                        disabled={jobActive || restartRunning}
                        className="shrink-0 rounded-xl bg-brand-500 hover:bg-brand-darker text-white px-4 py-2 text-sm disabled:opacity-50"
                      >
                        {t('serverSettings.update.now')}
                      </button>
                    )}
                  </div>
                  {st.update.command && !canUpdateNow(st) && (
                    <>
                      <div className="text-xs text-gray-600 mt-2 mb-1">{t('serverSettings.status.runOnServer')}</div>
                      <div className="flex items-stretch gap-2 min-w-0">
                        <code className="flex-1 min-w-0 overflow-x-auto whitespace-nowrap rounded-xl bg-white px-3 py-2 text-xs font-mono">{st.update.command}</code>
                        <button type="button" onClick={() => copy(st.update.command || '', 'update-cmd')} className="shrink-0 rounded-xl border border-gray-300 bg-white px-3 text-xs hover:bg-gray-50">
                          {copied === 'update-cmd' ? t('serverSettings.module.copied') : t('serverSettings.module.copy')}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
              {st.update.checked && !st.update.available && <div className="mt-1 text-green-700">{t('serverSettings.status.upToDate')}</div>}
              {job && hiddenJob !== job.id && renderJob(job)}
              {!st.update.checked && (
                <div className="mt-1 text-gray-500">{st.update.reason === 'offline' ? t('serverSettings.status.updateOff') : t('serverSettings.status.updateUnknown')}</div>
              )}
            </div>

            {st.services.length > 0 && (
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{t('serverSettings.status.services')}</div>
                <ul className="space-y-1">
                  {st.services.map((s) => (
                    <li key={s.key} className="flex items-center gap-2 min-w-0">
                      {dot(s.ok)}
                      <span className="text-gray-800 shrink-0">{s.label}</span>
                      {serviceUptime(s.key, st) && (
                        <span className="text-gray-400 shrink-0">{t('serverSettings.uptime.up').replace('{d}', serviceUptime(s.key, st) || '')}</span>
                      )}
                      {/* "started 1 min ago" repeats the uptime of a healthy process. */}
                      {s.detail && !(s.ok === true && serviceUptime(s.key, st)) && <span className="text-gray-500 truncate min-w-0">{s.detail}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {st.disk && st.disk.totalBytes > 0 && (() => {
              const free = st.disk.freeBytes / st.disk.totalBytes;
              const tone = free < 0.05 ? 'bg-red-500' : free < 0.15 ? 'bg-amber-500' : 'bg-green-500';
              return (
                <div>
                  <div className={cn(free < 0.05 ? 'text-red-700' : free < 0.15 ? 'text-amber-800' : 'text-gray-800')}>
                    {t('serverSettings.status.disk').replace('{free}', String(gb(st.disk.freeBytes))).replace('{total}', String(gb(st.disk.totalBytes)))}
                  </div>
                  <div className="mt-1 h-1.5 w-full max-w-sm rounded-full bg-gray-200 overflow-hidden">
                    <div className={cn('h-full', tone)} style={{ width: `${Math.min(100, Math.max(0, (1 - free) * 100))}%` }} />
                  </div>
                </div>
              );
            })()}

            {st.certificates.length > 0 && (
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{t('serverSettings.status.certificates')}</div>
                <ul className="space-y-1">
                  {st.certificates.map((c) => {
                    const bad = Boolean(c.error) || (c.daysLeft !== null && c.daysLeft < 7);
                    const warn = !bad && c.daysLeft !== null && c.daysLeft < 21;
                    return (
                      <li key={c.host} className="flex flex-wrap items-center gap-x-2 min-w-0">
                        {dot(bad ? false : warn ? null : true)}
                        <span className="text-gray-800 break-all">{c.host}</span>
                        <span className={cn(bad ? 'text-red-700' : warn ? 'text-amber-800' : 'text-gray-500')}>
                          {c.error ? c.error : c.daysLeft !== null ? t('serverSettings.status.daysLeft').replace('{n}', String(c.daysLeft)) : ''}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{t('serverSettings.status.license')}</div>
              <div className="text-gray-800">
                {licenseLabel(st.license.tier, st.license.state)}
                <span className="text-gray-500">
                  {' '}{t('serverSettings.status.lastContact').replace('{when}', relTime(st.license.lastContactAt))}
                  {st.license.lastContactStatus && st.license.lastContactAt ? ` (${st.license.lastContactStatus})` : ''}
                </span>
                {' '}<a href="/app/admin/license" className="text-brand-500 underline">{t('serverSettings.status.licensePage')}</a>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderTabBody = (tab: ServerSettingsTab) => {
    const modules = (data?.modules || []).filter((m) => m.tab === tab);
    const hosted = new Set(modules.map((m) => MODULE_GROUP[m.key]).filter(Boolean));
    const groups = (groupsByTab[tab] || []).filter((g) => !hosted.has(g));
    const isAdvanced = (g: string) => (byGroup[g] || []).every((s) => s.advanced);
    const plain = groups.filter((g) => !isAdvanced(g));
    const advanced = groups.filter(isAdvanced);
    return (
      <>
        {tab === 'system' && renderStatus()}
        {modules.map(renderModule)}
        {plain.map(renderGroup)}
        {advanced.length > 0 && (
          <details className="mb-6">
            <summary className="cursor-pointer select-none text-sm font-semibold text-gray-700 mb-4">{t('serverSettings.advanced')}</summary>
            {advanced.map(renderGroup)}
          </details>
        )}
        {!modules.length && !groups.length && <p className="text-sm text-gray-500">{t('serverSettings.emptyTab')}</p>}
        {tab === 'api' && tabs.includes('system') && (
          <p className="text-sm text-gray-600">
            {t('serverSettings.apiRateLimitsNote.before')}
            <button type="button" onClick={() => selectTab('system')} className="text-brand-500 underline">
              {t('serverSettings.tab.system')}
            </button>
            {t('serverSettings.apiRateLimitsNote.after')}
          </p>
        )}
      </>
    );
  };

  return (
    <div className="grid grid-rows-[auto,_1fr] gap-4 h-full min-w-0">
      <div className="md:px-8 hidden md:flex flex-col justify-between items-stretch md:items-center md:flex-row md:min-h-[40px] gap-4">
        <div className="font-varela mb-4 text-[24px] md:mb-0 md:text-[34px] leading-none">{t('serverSettings.title')}</div>
      </div>

      <div className="rounded-2xl bg-white p-4 md:p-8 overflow-y-auto min-w-0">
        <div className={activeTab === 'chats' && searchParams.get('sub') === 'appearance' ? 'min-w-0' : 'max-w-3xl min-w-0'}>
          <p className="mb-4 text-sm text-gray-700">{t(`serverSettings.intro${kind}`)}</p>
          {!canEdit && <p className="mb-6 text-sm text-gray-500">{t('serverSettings.readOnly')}</p>}

          {pendingScopes.length > 0 && !restartRunning && (
            <div className="mb-6 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 dark:bg-amber-900/30 dark:border-amber-800 dark:text-amber-300 p-4 text-sm flex flex-col sm:flex-row sm:items-center gap-3">
              <span className="flex-1 min-w-0">{t(`serverSettings.restartBanner${kind}`).replace('{scopes}', pendingScopes.map(scopeName).join(', '))}</span>
              {canEdit && (
                <button
                  type="button"
                  onClick={() => openRestart(pendingScopes.filter((x): x is RestartScope => (ALL_SCOPES as string[]).includes(x)))}
                  className="shrink-0 self-start sm:self-auto rounded-xl bg-brand-500 hover:bg-brand-darker text-white px-4 py-2 text-sm"
                >
                  {t('serverSettings.restart.now')}
                </button>
              )}
            </div>
          )}

          {restart && (
            <div
              role="status"
              className={cn(
                'mb-6 rounded-xl border p-4 text-sm',
                (restart.phase === 'running' || restart.phase === 'scheduled') && 'bg-blue-50 border-blue-200 text-blue-900',
                restart.phase === 'cancelled' && 'bg-gray-50 border-gray-200 text-gray-800',
                restart.phase === 'done' && 'bg-green-50 border-green-200 text-green-900',
                (restart.phase === 'timeout' || restart.phase === 'error') && 'bg-red-50 border-red-200 text-red-900',
              )}
            >
              {restart.phase === 'scheduled' && (
                <span className="tabular-nums">
                  {fill(t('serverSettings.restart.scheduled'), {
                    scopes: scopesLabel(restart.request.scopes),
                    countdown: formatCountdown((restart.request.notBefore ? Date.parse(restart.request.notBefore) : now) - now),
                  })}
                </span>
              )}
              {restart.phase === 'scheduled' && canEdit && (
                <button type="button" onClick={cancelRestart} className="ml-3 underline">
                  {t('serverSettings.restart.cancel')}
                </button>
              )}
              {restart.phase === 'scheduled' && restartCancelError && <div className="mt-2 text-red-700">{restartCancelError}</div>}
              {restart.phase === 'running' && t('serverSettings.restart.running').replace('{scopes}', scopesLabel(restart.request.scopes))}
              {restart.phase === 'cancelled' && t('serverSettings.restart.cancelled')}
              {restart.phase === 'done' && t('serverSettings.restart.done')}
              {restart.phase === 'timeout' && t('serverSettings.restart.timeout')}
              {restart.phase === 'error' && t('serverSettings.restart.failed').replace('{error}', restart.text || '')}
              {restart.phase !== 'running' && restart.phase !== 'scheduled' && (
                <button type="button" onClick={() => setRestart(null)} className="ml-3 underline">
                  {t('serverSettings.restart.dismiss')}
                </button>
              )}
            </div>
          )}

          {confirmScopes && (
            <ConfirmModal
              title={t('serverSettings.restart.confirmTitle')}
              message={
                <>
                  {t('serverSettings.restart.confirmMessage').replace(
                    '{scopes}',
                    scopesLabel(confirmScopes === 'all' ? ALL_SCOPES.filter((x) => x !== 'ai' || (data?.modules || []).some((m) => m.key === 'ai' && m.installed !== false)) : confirmScopes),
                  )}
                  {whenPicker(restartWhen, setRestartWhen)}
                </>
              }
              confirmLabel={t('serverSettings.restart.confirm')}
              onConfirm={() => startRestart(confirmScopes)}
              onCancel={() => setConfirmScopes(null)}
            />
          )}

          {updateDialog && (
            <ConfirmModal
              title={
                updateDialog === 'update'
                  ? t('serverSettings.update.confirmTitle')
                  : fill(t('serverSettings.update.rollbackTitle'), { previous: update?.updater?.previous || '' })
              }
              message={
                <>
                  {updateDialog === 'update' ? (
                    <>
                      <label className="mb-4 flex flex-col items-center gap-1">
                        <span className="text-xs text-gray-500">{t('serverSettings.update.target')}</span>
                        <input
                          type="text"
                          value={updateTarget}
                          onChange={(e) => setUpdateTarget(e.target.value)}
                          disabled={updateBusy}
                          spellCheck={false}
                          className="w-40 rounded-xl border border-gray-300 p-2 text-center text-sm font-mono disabled:opacity-60"
                        />
                      </label>
                      {t('serverSettings.update.confirmText')}
                    </>
                  ) : (
                    fill(t('serverSettings.update.rollbackText'), { previous: update?.updater?.previous || '' })
                  )}
                  {whenPicker(updateWhen, setUpdateWhen)}
                  {updateError && <div className="mt-4 text-red-700">{updateError}</div>}
                </>
              }
              confirmLabel={updateDialog === 'update' ? t('serverSettings.update.confirm') : t('serverSettings.update.rollbackConfirm')}
              busy={updateBusy}
              onConfirm={submitUpdate}
              onCancel={() => setUpdateDialog(null)}
            />
          )}

          {!data && <p className="text-sm text-gray-500">{t('serverSettings.loading')}</p>}

          {data && activeTab && (
            <>
              <div role="tablist" className="mb-6 -mx-1 flex gap-1 overflow-x-auto border-b border-gray-200">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    role="tab"
                    aria-selected={tab === activeTab}
                    onClick={() => selectTab(tab)}
                    className={cn(
                      'relative shrink-0 whitespace-nowrap px-3 py-2 text-sm font-sans border-b-2 -mb-px',
                      tab === activeTab ? 'border-brand-500 text-brand-500 font-semibold' : 'border-transparent text-gray-600 hover:text-gray-900',
                    )}
                  >
                    {t(`serverSettings.tab.${tab}`)}
                    {tabNeedsAttention(tab) && <span className="ml-1.5 inline-block size-2 rounded-full bg-amber-500 align-middle" aria-label={t('serverSettings.tabAttention')} />}
                  </button>
                ))}
              </div>
              {renderTab(activeTab)}
            </>
          )}

          {data && !activeTab && LEGACY_GROUPS.filter((g) => (byGroup[g] || []).length).map(renderGroup)}
        </div>
      </div>
    </div>
  );
}
