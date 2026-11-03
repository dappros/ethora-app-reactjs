import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AgentKnowledgeHealth, httpGetAgentKnowledge, httpGetSiteCrawlJob } from '../../http';
import { useTranslation } from '../../i18n/useTranslation';
import { AGENT_SETUP_CHANGE_EVENT, isAgentTried } from '../../utils/agentSetupChecklist';

type Setup = { agentId: string; jobId: string };
type Crawl = { status: string; savedPages: number; truncated?: boolean };

function readSetup(appId: string, agentId: string): Setup | null {
  try {
    const value = JSON.parse(sessionStorage.getItem(`widget-setup:${appId}`) || 'null');
    return value?.agentId === agentId && typeof value.jobId === 'string' ? value : null;
  } catch { return null; }
}

/** A small, resumable guide; server job state is the source of crawl progress. */
export function WidgetSetupGuide({ appId, agentId, selected, onSelect }: { appId: string; agentId: string; selected: number; onSelect: (index: number) => void }) {
  const { t } = useTranslation();
  const [setup, setSetup] = useState(() => readSetup(appId, agentId));
  const [crawl, setCrawl] = useState<Crawl | null>(null);
  const [crawlError, setCrawlError] = useState(false);
  const [health, setHealth] = useState<AgentKnowledgeHealth | null>(null);
  const [refresh, setRefresh] = useState(0);
  const [retry, setRetry] = useState(0);
  const [tried, setTried] = useState(() => isAgentTried(agentId));

  useEffect(() => {
    const update = () => setTried(isAgentTried(agentId));
    update();
    window.addEventListener(AGENT_SETUP_CHANGE_EVENT, update);
    return () => window.removeEventListener(AGENT_SETUP_CHANGE_EVENT, update);
  }, [agentId]);

  useEffect(() => { setSetup(readSetup(appId, agentId)); setCrawl(null); setCrawlError(false); }, [appId, agentId]);
  useEffect(() => {
    let cancelled = false;
    setHealth(null);
    httpGetAgentKnowledge(agentId).then(({ data }) => { if (!cancelled) setHealth(data); }).catch(() => {});
    return () => { cancelled = true; };
  }, [agentId, refresh, selected]);

  useEffect(() => {
    if (!setup?.jobId) return;
    let cancelled = false;
    let timer: number | undefined;
    const poll = async () => {
      try {
        const { data } = await httpGetSiteCrawlJob(appId, setup.jobId);
        if (cancelled) return;
        const job = data?.result as Crawl | undefined;
        if (!job) throw new Error('Missing job');
        setCrawl(job);
        setCrawlError(false);
        if (['completed', 'failed', 'cancelled'].includes(job.status)) setRefresh((n) => n + 1);
        else timer = window.setTimeout(poll, 3000);
      } catch { if (!cancelled) setCrawlError(true); }
    };
    void poll();
    return () => { cancelled = true; if (timer) window.clearTimeout(timer); };
  }, [appId, setup?.jobId, retry]);

  const running = Boolean(setup?.jobId && !crawlError && (!crawl || !['completed', 'failed', 'cancelled'].includes(crawl.status)));
  const empty = health && health.pages + health.docs === 0;
  const ready = Boolean(health && health.pages + health.docs > 0 && !running);
  if (!setup && !empty) return null;
  const dismiss = () => {
    try { sessionStorage.removeItem(`widget-setup:${appId}`); } catch { /* Ignore unavailable storage. */ }
    setSetup(null);
  };
  return <section className="m-4 rounded-xl border border-brand-200 bg-brand-50 p-4 text-sm text-gray-800" aria-label={t('widgetGuide.title')}>
    <div className="flex justify-between gap-3"><h3 className="font-semibold text-gray-900">{t('widgetGuide.title')}</h3>{setup && <button type="button" onClick={dismiss} className="text-brand-500 underline">{t('widgetGuide.dismiss')}</button>}</div>
    <ol className="mt-3 flex flex-wrap gap-2 text-xs font-medium" aria-label={t('widgetGuide.title')}>
      <li className={`rounded-full px-3 py-1 ${ready ? 'bg-green-100 text-green-800 dark:bg-green-950/70 dark:text-green-300' : 'bg-white text-gray-700'}`}>1 · {t('widgetGuide.addWebsite')}</li>
      <li className={`rounded-full px-3 py-1 ${tried ? 'bg-green-100 text-green-800 dark:bg-green-950/70 dark:text-green-300' : 'bg-white text-gray-700'}`}>2 · {t('widgetGuide.test')}</li>
      <li className="rounded-full bg-white px-3 py-1 text-gray-700">3 · {t('widgetGuide.install')}</li>
    </ol>
    {running && <p role="status" className="mt-2">{t('widgetGuide.crawling').replace('{n}', String(crawl?.savedPages || 0))}</p>}
    {crawlError && <p role="alert" className="mt-2">{t('widgetGuide.statusUnavailable')} <button type="button" className="underline" onClick={() => setRetry((n) => n + 1)}>{t('configAI.retry')}</button></p>}
    {crawl && ['failed', 'cancelled'].includes(crawl.status) && <p role="alert" className="mt-2">{t('widgetGuide.crawlFailed')}</p>}
    {crawl?.status === 'completed' && <p role="status" className="mt-2">{t(crawl.savedPages ? 'widgetGuide.crawlComplete' : 'widgetGuide.noPages').replace('{n}', String(crawl.savedPages))} {crawl.truncated && t('widgetGuide.truncated')}</p>}
    {empty && !running && <p className="mt-2">{t('widgetGuide.noKnowledge')}</p>}
    <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 font-medium text-brand-500">
      {!ready ? <><button type="button" className="rounded-lg bg-brand-500 px-4 py-2 text-white" onClick={() => onSelect(2)}>{t('widgetGuide.addWebsite')}</button><button type="button" className="underline" onClick={() => onSelect(3)}>{t('widgetGuide.addDocument')}</button></>
        : !tried ? <button type="button" className="rounded-lg bg-brand-500 px-4 py-2 text-white" onClick={() => onSelect(7)}>{t('widgetGuide.test')}</button>
        : <Link className="rounded-lg bg-brand-500 px-4 py-2 text-white" to={`/app/admin/widgets/${appId}?tab=install`}>{t('widgetGuide.install')}</Link>}
    </div>
  </section>;
}
