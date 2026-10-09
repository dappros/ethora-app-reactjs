import type { AxiosError } from 'axios';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { httpV2 } from '../http';
import { useTranslation } from '../i18n/useTranslation';
import type { ServerSetting, ServerSettingsResponse } from '../models';
import { useAppStore } from '../store/useAppStore';

// Server settings page (super admins): install-wide values with their source
// (saved here, the deployment configuration, or the default), saved per group.
// Settings of kind "restart" show which process has to restart before a saved
// value is live; the API reports when each process last started.

const GROUPS = ['email', 'feedback', 'rooms', 'reports', 'rateLimits', 'ai'] as const;

type ApiErr = AxiosError<{ error?: string; code?: string; details?: Record<string, string> }>;

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ');
}

export default function AdminServerSettings() {
  const { t } = useTranslation();
  const currentUser = useAppStore((s) => s.currentUser);
  const canEdit = Boolean(currentUser?.isSuperAdmin?.write);
  const [data, setData] = useState<ServerSettingsResponse | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [busyGroup, setBusyGroup] = useState<string | null>(null);
  const [message, setMessage] = useState<{ group: string; kind: 'ok' | 'error'; text: string } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

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

  const pendingScopes = useMemo(() => {
    const scopes = new Set<string>();
    for (const s of data?.settings || []) if (s.restartPending) scopes.add(s.scope);
    return Array.from(scopes);
  }, [data]);

  const draftOf = (s: ServerSetting) => (drafts[s.key] !== undefined ? drafts[s.key] : s.type === 'secret' ? '' : s.value);
  const changed = (s: ServerSetting) => drafts[s.key] !== undefined && drafts[s.key] !== (s.type === 'secret' ? '' : s.value);

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

  const scopeName = (scope: string) => t(`serverSettings.scope.${scope}`);

  const renderInput = (s: ServerSetting) => {
    const disabled = !canEdit || busyGroup === s.group;
    const base = 'w-full rounded-xl border border-gray-300 p-3 text-sm disabled:opacity-60';
    const set = (v: string) => setDrafts((d) => ({ ...d, [s.key]: v }));
    if (s.type === 'boolean') {
      return (
        <select value={draftOf(s)} onChange={(e) => set(e.target.value)} disabled={disabled} className={base}>
          <option value="true">{t('serverSettings.boolean.true')}</option>
          <option value="false">{t('serverSettings.boolean.false')}</option>
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

  return (
    <div className="grid grid-rows-[auto,_1fr] gap-4 h-full">
      <div className="md:px-8 hidden md:flex flex-col justify-between items-stretch md:items-center md:flex-row md:min-h-[40px] gap-4">
        <div className="font-varela mb-4 text-[24px] md:mb-0 md:text-[34px] leading-none">{t('serverSettings.title')}</div>
      </div>

      <div className="rounded-2xl bg-white p-4 md:p-8 overflow-y-auto">
        <div className="max-w-3xl">
          <p className="mb-4 text-sm text-gray-700 dark:text-gray-300">{t('serverSettings.intro')}</p>
          {!canEdit && <p className="mb-6 text-sm text-gray-500">{t('serverSettings.readOnly')}</p>}

          {pendingScopes.length > 0 && (
            <div className="mb-6 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 dark:bg-amber-900/30 dark:border-amber-800 dark:text-amber-300 p-4 text-sm">
              {t('serverSettings.restartBanner').replace('{scopes}', pendingScopes.map(scopeName).join(', '))}
            </div>
          )}

          {!data && <p className="text-sm text-gray-500">{t('serverSettings.loading')}</p>}

          {data &&
            GROUPS.filter((g) => (byGroup[g] || []).length).map((group) => (
              <div key={group} className="rounded-2xl bg-gray-50 p-6 md:p-8 mb-6">
                <h3 className="font-varela text-[18px] md:text-[20px] mb-4">{t(`serverSettings.group.${group}`)}</h3>
                <div className="grid grid-cols-1 gap-5">
                  {(byGroup[group] || []).map((s) => (
                    <div key={s.key} className="grid grid-cols-1 md:grid-cols-[260px,_1fr] gap-x-4 gap-y-1">
                      <div>
                        <div className="text-sm font-semibold">{t(`serverSettings.key.${s.key}`)}</div>
                        <div className="text-xs text-gray-500">
                          {t(`serverSettings.source.${s.source}`)}
                          {' | '}
                          {s.kind === 'live' ? t('serverSettings.kind.live') : t('serverSettings.kind.restart').replace('{scope}', scopeName(s.scope))}
                          {s.restartPending && (
                            <span className="ml-2 inline-block rounded-full bg-amber-100 text-amber-900 px-2 py-0.5 text-[11px] font-semibold">{t('serverSettings.restartPending')}</span>
                          )}
                        </div>
                      </div>
                      <div>
                        {renderInput(s)}
                        {fieldErrors[s.key] && <div className="mt-1 text-xs text-red-700">{fieldErrors[s.key]}</div>}
                        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                          {t(`serverSettings.desc.${s.key}`) !== `serverSettings.desc.${s.key}` && <span>{t(`serverSettings.desc.${s.key}`)}</span>}
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
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
