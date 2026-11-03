import { Link, useParams } from 'react-router-dom';
import { ConfigAIPanel } from '../../components/AIWidget/ConfigAIPanel';
import { ActiveAgentSelector } from '../../components/AIWidget/ActiveAgentSelector';
import { useManagedWidgetApp } from '../../hooks/useManagedWidgetApp';
import { useActiveWidgetAgent } from '../../hooks/useActiveWidgetAgent';
import { useTranslation } from '../../i18n/useTranslation';

export default function WidgetAISettings({ appContext = false }: { appContext?: boolean }) {
  const { appId } = useParams();
  const { app, error, retry } = useManagedWidgetApp(appId);
  const agent = useActiveWidgetAgent(app || undefined);
  const { t } = useTranslation();
  if (!app) return <div className="p-6" role={error ? 'alert' : 'status'}>{t(error ? 'widgets.loadFailed' : 'configAI.loading')}{error && <button className="ml-3 underline" onClick={retry}>{t('configAI.retry')}</button>}</div>;
  return <div className="space-y-5 p-2 md:p-4">
    <header className="flex flex-wrap items-end justify-between gap-4"><div><Link to={appContext ? `/app/admin/apps/${app._id}/settings?tab=AI` : `/app/admin/widgets/${app._id}`} className="text-sm text-brand-500">← {app.displayName}</Link><h1 className="mt-3 text-2xl font-semibold">{t('appSettingsAIWidget.configTab')}</h1><p className="mt-2 text-sm text-gray-500">{t('widgets.configIntro')}</p></div><ActiveAgentSelector appId={app._id} app={app} bare label={t('aiWidgetAgentCard.pickLabel')} /></header>
    <div className="rounded-2xl border border-gray-200 bg-white"><ConfigAIPanel appId={app._id} activeAgent={agent} /></div>
  </div>;
}
