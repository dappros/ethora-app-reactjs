import { Link, useParams } from 'react-router-dom';
import { PanelSkeleton } from '../../components/PanelSkeleton';
import { ConfigAIPanel } from '../../components/AIWidget/ConfigAIPanel';
import { ActiveAgentSelector } from '../../components/AIWidget/ActiveAgentSelector';
import { useManagedWidgetApp } from '../../hooks/useManagedWidgetApp';
import { useActiveWidgetAgent } from '../../hooks/useActiveWidgetAgent';
import { useTranslation } from '../../i18n/useTranslation';

export default function WidgetAISettings({ appContext = false }: { appContext?: boolean }) {
  const { appId } = useParams();
  const { app, error, retry } = useManagedWidgetApp(appId, !appContext);
  const agent = useActiveWidgetAgent(app || undefined);
  const { t } = useTranslation();
  if (!app) return error ? <div className="p-6" role="alert">{t('widgets.loadFailed')}<button className="ml-3 underline" onClick={retry}>{t('configAI.retry')}</button></div> : <PanelSkeleton label={t('projectOverview.loading')} />;
  return <div className="space-y-5 p-2 md:p-4">
    <header className="flex flex-wrap items-end justify-between gap-4"><div>{!appContext && <Link to={`/app/admin/apps/${app._id}`} className="text-sm text-brand-500">← {app.displayName}</Link>}<h1 className="text-2xl font-semibold">{t('projectOverview.assistant')}</h1><p className="mt-2 text-sm text-gray-500">{t('widgets.configIntro')}</p></div><ActiveAgentSelector appId={app._id} app={app} bare label={t('aiWidgetAgentCard.pickLabel')} /></header>
    <div className="rounded-2xl border border-gray-200 bg-white"><ConfigAIPanel appId={app._id} activeAgent={agent} /></div>
  </div>;
}
