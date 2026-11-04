import { useEffect, useState } from 'react';
import { Link, Navigate, useBlocker, useParams, useSearchParams } from 'react-router-dom';
import { AIWidget } from '../AppSettings/AIWidget';
import { ProjectAssistantNav } from '../../components/AIWidget/ProjectAssistantNav';
import { PanelSkeleton } from '../../components/PanelSkeleton';
import { ModelAIbot } from '../../models';
import { useManagedWidgetApp } from '../../hooks/useManagedWidgetApp';
import { useTranslation } from '../../i18n/useTranslation';
import { env } from '../../config/env';

export default function WidgetEditor({ projectContext = false }: { projectContext?: boolean }) {
  const { appId } = useParams();
  const [searchParams] = useSearchParams();
  const { app, error, retry } = useManagedWidgetApp(appId, !projectContext);
  const { t } = useTranslation();
  const [dirty, setDirty] = useState(false);
  const blocker = useBlocker(({ currentLocation, nextLocation }) => dirty && currentLocation.pathname !== nextLocation.pathname);
  useEffect(() => {
    if (blocker.state !== 'blocked') return;
    if (window.confirm(t('appSettings.unsavedLeave'))) blocker.proceed();
    else blocker.reset();
  }, [blocker, t]);
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);
  const [aiBot, setAiBot] = useState<ModelAIbot | null>(null);
  useEffect(() => { setAiBot(null); setDirty(false); }, [appId]);
  if (searchParams.get('tab') === 'ai') return <Navigate to={`/app/admin/apps/${appId}/assistant`} replace />;
  if (!app) return error ? <div className="p-6" role="alert">{t('widgets.loadFailed')}<button className="ml-3 underline" onClick={retry}>{t('configAI.retry')}</button></div> : <PanelSkeleton label={t('projectOverview.loading')} />;
  return <div className="space-y-5 p-2 md:p-4">
    <header>
      {!projectContext && <Link className="text-sm text-brand-500 hover:underline" to={`/app/admin/apps/${app._id}`}>← {t('projectOverview.tab')}</Link>}
      <h1 className="text-2xl font-semibold">{t('projectOverview.widget')}</h1>
      {projectContext && <p className="mt-2 text-sm text-gray-600">{t('projectOverview.widgetUsesAssistant')}</p>}
    </header>
    {projectContext && <ProjectAssistantNav appId={app._id} />}
    <div className="rounded-2xl bg-white p-4 md:p-6"><AIWidget key={app._id} standalone onAppearanceDirtyChange={setDirty} appId={app._id} app={app} aiBot={aiBot || app.aiBot || {} as ModelAIbot} setAiBot={setAiBot} defaultChatRooms={app.defaultRooms || []} primaryColor={app.primaryColor} isDisabled={false} aiFeatureDisabled={env.VITE_AI_FEATURE_ENABLED !== 'true'} handleRagChange={() => {}} /></div>
  </div>;
}
