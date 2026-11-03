import { AIWorkspacePage, AI_PRIMARY_ACTION_CLASS, AI_CARD_GRID_CLASS, AI_CARD_CLASS } from '../../components/AIWidget/AIWorkspacePage';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { httpGetApps } from '../../http';
import { ModelApp } from '../../models';
import { useTranslation } from '../../i18n/useTranslation';
import { CreateWidgetModal } from '../../components/modal/CreateWidgetModal';
import { env } from '../../config/env';

export default function Widgets() {
  const { t } = useTranslation();
  const [apps, setApps] = useState<ModelApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState('');
  useEffect(() => {
    let cancelled = false;
    setLoading(true); setError(false);
    // Page through all owned contexts so widgets beyond the first page remain accessible.
    (async () => {
      const all: ModelApp[] = [];
      for (let offset = 0; ; offset += 200) {
        const { data } = await httpGetApps({ limit: 200, offset, orderBy: 'displayName', order: 'asc' });
        const batch: ModelApp[] = data.apps || [];
        all.push(...batch);
        if (cancelled || batch.length < 200 || all.length >= data.total) break;
      }
      if (!cancelled) setApps(all.filter((app) => (app as ModelApp & { defaultBotInstanceId?: string }).defaultBotInstanceId || app.aiBot?.userId));
    })().catch(() => { if (!cancelled) setError(true); }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [attempt]);
  const visible = apps.filter((app) => app.displayName.toLowerCase().includes(search.toLowerCase()));
  return <AIWorkspacePage
    title={t('widgets.title')}
    description={t('widgets.intro')}
    searchLabel={t('widgets.search')}
    search={search}
    onSearch={setSearch}
    actions={<button aria-label={t('widgets.create')} disabled={env.VITE_AI_FEATURE_ENABLED !== 'true'} onClick={() => setCreating(true)} className={AI_PRIMARY_ACTION_CLASS}>+ {t('widgets.create')}</button>}
  >
    {loading ? <p role="status">{t('configAI.loading')}</p> : error ? <div role="alert"><p>{t('widgets.loadFailed')}</p><button className="mt-2 underline" onClick={() => setAttempt((value) => value + 1)}>{t('configAI.retry')}</button></div> : visible.length ?
      <div className={AI_CARD_GRID_CLASS}>{visible.map((app) => <article key={app._id} className={AI_CARD_CLASS}>
        <div className="flex items-start gap-3">
          <div aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-200 text-xs">{app.displayName.slice(0, 2).toUpperCase()}</div>
          <div className="min-w-0 flex-1"><h3 className="truncate font-semibold">{app.displayName}</h3><p className="mt-1 break-all text-xs text-gray-500">{app.domainName ? `${app.domainName}.${env.VITE_ROOT_DOMAIN}` : t('widgets.websiteWidget')}</p></div>
          <span className="h-fit rounded bg-gray-100 px-2 py-0.5 text-[10px] text-gray-700">{t(app.aiBot?.status === 'on' ? 'widgets.active' : 'widgets.paused')}</span>
        </div>
        <div className="mt-auto flex flex-wrap items-center gap-3 border-t border-gray-100 pt-2 text-xs text-brand-500"><Link to={`/app/admin/widgets/${app._id}`} className="hover:underline">{t('widgets.edit')}</Link><Link to={`/app/admin/widgets/${app._id}/ai`} className="hover:underline">{t('appSettingsAIWidget.configTab')}</Link><Link to={`/app/admin/widgets/${app._id}?tab=install`} className="hover:underline">{t('widgets.install')} →</Link></div>
      </article>)}</div> : <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center"><h2 className="text-lg font-semibold">{t(apps.length ? 'widgets.noMatches' : 'widgets.empty')}</h2><p className="mt-2 text-sm text-gray-500">{t('widgets.intro')}</p></div>}
    {creating && <CreateWidgetModal onClose={() => setCreating(false)} />}
  </AIWorkspacePage>;
}
