import { Link, useParams } from 'react-router-dom';
import { PanelSkeleton } from '../../components/PanelSkeleton';
import { ConfigAIPanel } from '../../components/AIWidget/ConfigAIPanel';
import { ActiveAgentSelector } from '../../components/AIWidget/ActiveAgentSelector';
import { useManagedWidgetApp } from '../../hooks/useManagedWidgetApp';
import { useActiveWidgetAgent } from '../../hooks/useActiveWidgetAgent';
import { useTranslation } from '../../i18n/useTranslation';

export default function WidgetAISettings() {
  const { appId } = useParams();
  const { app, error, retry } = useManagedWidgetApp(appId, false);
  const agent = useActiveWidgetAgent(app || undefined);
  const { t } = useTranslation();
  if (!app) return error ? <div className="p-6" role="alert">{t('widgets.loadFailed')}<button className="ml-3 underline" onClick={retry}>{t('configAI.retry')}</button></div> : <PanelSkeleton label={t('projectOverview.loading')} />;
  return <div className="space-y-4">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <section aria-label={t('projectOverview.whereItWorks')} className="flex flex-wrap items-center gap-2 text-sm">
        <span className="mr-1 font-medium text-gray-600">{t('projectOverview.whereItWorks')}:</span>
        <Link to={`/app/admin/apps/${app._id}/widget`} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-gray-900 hover:border-brand-300 hover:text-brand-500 focus-visible:outline-2 focus-visible:outline-brand-500">
          <span>{t('projectOverview.widget')}</span><span className="text-xs text-gray-600">{t('projectOverview.optional')}</span><span aria-hidden="true">→</span>
        </Link>
        <Link to={`/app/admin/apps/${app._id}/assistant?section=chats`} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-gray-900 hover:border-brand-300 hover:text-brand-500 focus-visible:outline-2 focus-visible:outline-brand-500">
          <span>{t('projectOverview.ethoraChats')}</span><span className="text-xs text-gray-600">{t('projectOverview.optional')}</span><span aria-hidden="true">→</span>
        </Link>
      </section>
      <ActiveAgentSelector appId={app._id} app={app} bare label={t('aiWidgetAgentCard.pickLabel')} />
    </div>
    <div className="rounded-2xl border border-gray-200 bg-white"><ConfigAIPanel appId={app._id} activeAgent={agent} defaultChatRooms={app.defaultRooms || []} /></div>
  </div>;
}
