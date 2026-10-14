// Web Index: the sites this agent's index keeps up to date. Every crawl start
// URL is re-crawled on its schedule (weekly by default): pages whose text
// changed are re-indexed, new pages are added, pages that are gone are removed.
// The operator picks the schedule per site or refreshes one now.
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { httpListSiteWatches, httpRefreshSiteWatch, httpUpdateSiteWatch, SiteWatchRow, SiteWatchSchedule } from '../../../http';
import { useTranslation } from '../../../i18n/useTranslation';

const SCHEDULES: SiteWatchSchedule[] = ['weekly', 'daily', 'off'];

function apiError(e: unknown): { message: string; code?: string } {
  const err = e as { response?: { data?: { error?: string; code?: string } }; message?: string };
  return { message: err?.response?.data?.error || err?.message || '', code: err?.response?.data?.code };
}

function fmtDate(value: string | null) {
  return value ? new Date(value).toLocaleString() : '';
}

export const SiteWatchesSection: React.FC<{
  appId: string;
  agentId: string;
  isDisabled?: boolean;
  // Bumped by the panel when something may have changed the list: a crawl was
  // queued, a refresh finished, pages were removed.
  reloadKey: number;
  onRefreshQueued: (jobId: string, url: string) => void;
}> = ({ appId, agentId, isDisabled, reloadKey, onRefreshQueued }) => {
  const { t } = useTranslation();
  const [watches, setWatches] = useState<SiteWatchRow[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    if (!appId) {
      setWatches([]);
      return;
    }
    let cancelled = false;
    httpListSiteWatches(appId, agentId)
      .then((r) => { if (!cancelled) setWatches(r.data?.result || []); })
      // An older backend has no such endpoint: the section simply stays hidden.
      .catch(() => { if (!cancelled) setWatches([]); });
    return () => { cancelled = true; };
  }, [appId, agentId, reloadKey]);

  if (watches.length === 0) return null;

  const replace = (row: SiteWatchRow) => setWatches((prev) => prev.map((w) => (w.id === row.id ? row : w)));

  const changeSchedule = async (watch: SiteWatchRow, schedule: SiteWatchSchedule) => {
    setBusyId(watch.id);
    try {
      const r = await httpUpdateSiteWatch(appId, watch.id, schedule);
      if (r.data?.result) replace(r.data.result);
      toast.success(t('agentPanels.watchScheduleSaved'));
    } catch (e) {
      toast.error(`${t('agentPanels.failedPrefix')} ${apiError(e).message}`);
    } finally {
      setBusyId(null);
    }
  };

  const refreshNow = async (watch: SiteWatchRow) => {
    setBusyId(watch.id);
    try {
      const r = await httpRefreshSiteWatch(appId, watch.id);
      toast.success(t('agentPanels.refreshQueued'));
      if (r.data?.jobId) onRefreshQueued(r.data.jobId, watch.url);
      replace({ ...watch, pausedReason: null, lastJobId: r.data?.jobId || watch.lastJobId });
    } catch (e) {
      const err = apiError(e);
      if (err.code === 'SITE_REFRESH_IN_PROGRESS') toast.info(t('agentPanels.refreshAlreadyRunning'));
      else toast.error(`${t('agentPanels.failedPrefix')} ${err.message}`);
    } finally {
      setBusyId(null);
    }
  };

  const status = (w: SiteWatchRow) => {
    if (w.pausedReason === 'failures') {
      return { text: t('agentPanels.watchPaused').replace('{error}', w.lastError || ''), warn: true };
    }
    let text: string;
    if (w.lastStatus === 'completed' && w.lastResult) {
      text = t('agentPanels.watchLastResult')
        .replace('{date}', fmtDate(w.lastFinishedAt))
        .replace('{updated}', String(w.lastResult.updatedPages))
        .replace('{added}', String(w.lastResult.addedPages))
        .replace('{removed}', String(w.lastResult.removedPages));
    } else if (w.lastStatus === 'failed') {
      return { text: t('agentPanels.watchLastFailed').replace('{date}', fmtDate(w.lastFinishedAt)).replace('{error}', w.lastError || ''), warn: true };
    } else if (w.lastStatus === 'cancelled') {
      text = t('agentPanels.watchLastStopped').replace('{date}', fmtDate(w.lastFinishedAt));
    } else {
      text = t('agentPanels.watchNotRefreshedYet');
    }
    if (w.lastSkipReason === 'inactive') text += ` · ${t('agentPanels.watchSkippedInactive')}`;
    if (w.lastSkipReason === 'archived') text += ` · ${t('agentPanels.watchSkippedArchived')}`;
    return { text, warn: false };
  };

  return (
    <div className="border rounded" data-testid="site-watches">
      <div className="px-2 py-1.5 bg-gray-50 text-xs">
        <span className="font-medium text-gray-700">{t('agentPanels.keptUpToDate')}</span>
        <span className="text-gray-500"> · {t('agentPanels.keptUpToDateHint')}</span>
      </div>
      <ul>
        {watches.map((w) => {
          const s = status(w);
          return (
            <li key={w.id} className="border-t px-2 py-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs" data-testid={`site-watch-${w.id}`}>
              <div className="flex-1 min-w-[12rem]">
                <div className="font-mono break-all">{w.url}</div>
                <div className="text-gray-400 text-[10px] mt-0.5">
                  {w.followLink ? t('agentPanels.watchWholeSite') : t('agentPanels.watchSinglePage')}
                  {w.schedule !== 'off' && w.nextRunAt && !w.pausedReason && (
                    <> · {t('agentPanels.watchNext').replace('{date}', fmtDate(w.nextRunAt))}</>
                  )}
                  {w.excludedCount > 0 && (
                    <> · {t('agentPanels.watchExcluded').replace('{n}', String(w.excludedCount))}</>
                  )}
                </div>
                <div className={`mt-0.5 ${s.warn ? 'text-amber-600 dark:text-amber-400' : 'text-gray-500'}`}>{s.text}</div>
              </div>
              <label className="flex items-center gap-1 text-gray-600">
                <span>{t('agentPanels.watchScheduleLabel')}</span>
                <select
                  className="border rounded px-1 py-0.5 text-xs"
                  value={w.schedule}
                  disabled={isDisabled || busyId === w.id}
                  aria-label={t('agentPanels.watchScheduleFor').replace('{url}', w.url)}
                  onChange={(e) => changeSchedule(w, e.target.value as SiteWatchSchedule)}
                >
                  {SCHEDULES.map((v) => (
                    <option key={v} value={v}>{t(`agentPanels.watchSchedule.${v}`)}</option>
                  ))}
                </select>
              </label>
              <button
                disabled={isDisabled || busyId === w.id}
                onClick={() => refreshNow(w)}
                className="text-brand-500 hover:underline disabled:opacity-50 disabled:no-underline whitespace-nowrap"
              >
                {t('agentPanels.refreshNow')}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
