// Ethora.com platform, copyright: Dappros Ltd (c) 2026, all rights reserved
//
// T&S > Blocked domains (docs/TRUST_AND_SAFETY.md section 13): the Apps that
// refuse sign-ups from some email domains (GET /v2/admin/trust-safety/
// blocked-domains), editable in place with the same one-pattern-per-line
// validation as App settings, and saved through the App update
// (signupBlockedEmailDomains). Another App can be added from the picker.
import cn from 'classnames';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { httpGetTsBlockedDomains, httpUpdateApp } from '../../../http';
import { useTranslation } from '../../../i18n/useTranslation';
import { accessErrorMessage } from '../../../utils/accessError';
import { apiError } from '../../../utils/apiError';
import { parseBlockedDomains } from '../../../utils/suspension';
import { SELECT, TabHeader } from './common';
import { useAppOptions } from './useAppOptions';

interface Row {
  appId: string;
  appName: string;
  // The saved patterns, and the text being edited.
  saved: string[];
  text: string;
}

const same = (a: string[], b: string[]) => a.length === b.length && a.every((x, i) => x === b[i]);

export function BlockedDomainsTab() {
  const { t } = useTranslation();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [adding, setAdding] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await httpGetTsBlockedDomains();
      setRows(
        (r.data?.items || []).map((i) => ({
          appId: i.appId,
          appName: i.appName || i.appId,
          saved: i.patterns || [],
          text: (i.patterns || []).join('\n'),
        }))
      );
      setUnavailable(false);
    } catch (e) {
      if (apiError(e, '').status === 404) setUnavailable(true);
      else setError(accessErrorMessage(e, t));
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  const seenApps = useMemo(() => rows.map((r) => ({ id: r.appId, name: r.appName })), [rows]);
  const appOptions = useAppOptions(seenApps);
  const addable = appOptions.filter((a) => !rows.some((r) => r.appId === a.id));

  const setText = (appId: string, text: string) => setRows((list) => list.map((r) => (r.appId === appId ? { ...r, text } : r)));

  const save = async (row: Row) => {
    const parsed = parseBlockedDomains(row.text);
    if (parsed.invalid.length) return;
    setBusyId(row.appId);
    try {
      await httpUpdateApp(row.appId, { signupBlockedEmailDomains: parsed.patterns });
      toast.success(t('tsHub.domains.saved').replace('{app}', row.appName));
      setRows((list) =>
        list.map((r) => (r.appId === row.appId ? { ...r, saved: parsed.patterns, text: parsed.patterns.join('\n') } : r))
      );
    } catch (e) {
      toast.error(t('tsHub.domains.failed').replace('{error}', accessErrorMessage(e, t)));
    } finally {
      setBusyId(null);
    }
  };

  const addApp = (appId: string) => {
    const app = appOptions.find((a) => a.id === appId);
    if (!app) return;
    setRows((list) => [{ appId, appName: app.name, saved: [], text: '' }, ...list]);
    setAdding('');
  };

  return (
    <div>
      <TabHeader title={t('tsHub.tab.domains')} intro={t('tsHub.domains.intro')} loading={loading} onRefresh={() => void load()} />
      <p className="mb-4 text-xs text-gray-500">{t('userSuspension.settings.blockedExamples')}</p>

      {!unavailable && (
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <select
            aria-label={t('tsHub.domains.addApp')}
            className={`${SELECT} max-w-[320px]`}
            value={adding}
            onChange={(e) => addApp(e.target.value)}
            disabled={!addable.length}
          >
            <option value="">{t('tsHub.domains.addApp')}</option>
            {addable.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {unavailable && <div className="bg-brand-150 p-4 text-sm font-sans rounded-xl mb-4">{t('tsHub.unavailable')}</div>}
      {error && <p className="mb-4 text-sm text-red-600 dark:text-red-400">{t('tsHub.loadFailed').replace('{error}', error)}</p>}
      {!loading && !error && !unavailable && !rows.length && (
        <div className="bg-brand-150 p-4 text-sm font-sans rounded-xl mb-4">{t('tsHub.domains.empty')}</div>
      )}

      <ul className="flex flex-col gap-3">
        {rows.map((row) => {
          const parsed = parseBlockedDomains(row.text);
          const dirty = !same(parsed.patterns, row.saved) || row.text !== row.saved.join('\n');
          const changed = !same(parsed.patterns, row.saved);
          return (
            <li key={row.appId} className="rounded-2xl border border-gray-200 p-4 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="font-semibold break-all">{row.appName}</span>
                <span className="text-xs text-gray-500 tabular-nums">
                  {t('tsHub.domains.count').replace('{count}', String(parsed.patterns.length))}
                </span>
                <Link
                  to={`/app/admin/apps/${encodeURIComponent(row.appId)}/settings`}
                  className="ml-auto text-xs text-brand-500 underline"
                >
                  {t('tsHub.domains.appSettings')}
                </Link>
              </div>
              <textarea
                aria-label={t('tsHub.domains.patternsFor').replace('{app}', row.appName)}
                className={cn(
                  'rounded-2xl bg-gray-100 py-3 px-4 w-full min-h-[96px] outline-none font-mono text-sm',
                  parsed.invalid.length ? 'border border-red-500' : ''
                )}
                placeholder={'*.sch.uk\n*.k12.*.us\nexample.org'}
                spellCheck={false}
                value={row.text}
                onChange={(e) => setText(row.appId, e.target.value)}
              />
              {parsed.invalid.length > 0 && (
                <p className="text-[12px] text-red-600 dark:text-red-400 mt-1">
                  {t('userSuspension.settings.blockedInvalid').replace('{lines}', parsed.invalid.join(', '))}
                </p>
              )}
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  disabled={!changed || parsed.invalid.length > 0 || busyId === row.appId}
                  onClick={() => void save(row)}
                  className="px-4 py-2 rounded-xl bg-brand-500 text-white hover:bg-brand-darker font-sans text-sm disabled:opacity-50"
                >
                  {busyId === row.appId ? t('tsHub.saving') : t('tsHub.domains.save')}
                </button>
                {dirty && (
                  <button
                    type="button"
                    className="text-xs text-brand-500 underline"
                    disabled={busyId === row.appId}
                    onClick={() => setText(row.appId, row.saved.join('\n'))}
                  >
                    {t('tsHub.domains.revert')}
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
