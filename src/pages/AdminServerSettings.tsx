import type { AxiosError } from 'axios';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { httpV2 } from '../http';
import { Segmented } from '../components/AIWidget/appearance/Fields';
import { ChatComponent } from './AppSettings/ChatComponent';
import { useTranslation } from '../i18n/useTranslation';
import type { ServerModule, ServerSetting, ServerSettingsResponse, ServerSettingsTab } from '../models';
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

export default function AdminServerSettings() {
  const { t } = useTranslation();
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

  const renderTabBody = (tab: ServerSettingsTab) => {
    const modules = (data?.modules || []).filter((m) => m.tab === tab);
    const hosted = new Set(modules.map((m) => MODULE_GROUP[m.key]).filter(Boolean));
    const groups = (groupsByTab[tab] || []).filter((g) => !hosted.has(g));
    const isAdvanced = (g: string) => (byGroup[g] || []).every((s) => s.advanced);
    const plain = groups.filter((g) => !isAdvanced(g));
    const advanced = groups.filter(isAdvanced);
    return (
      <>
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
          <p className="mb-4 text-sm text-gray-700 dark:text-gray-300">{t(`serverSettings.intro${kind}`)}</p>
          {!canEdit && <p className="mb-6 text-sm text-gray-500">{t('serverSettings.readOnly')}</p>}

          {pendingScopes.length > 0 && (
            <div className="mb-6 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 dark:bg-amber-900/30 dark:border-amber-800 dark:text-amber-300 p-4 text-sm">
              {t(`serverSettings.restartBanner${kind}`).replace('{scopes}', pendingScopes.map(scopeName).join(', '))}
            </div>
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
