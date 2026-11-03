import { Link, useNavigate, useParams } from 'react-router-dom';
import { PanelSkeleton } from '../components/PanelSkeleton';
import { actionSwitchChatApp } from '../actions';
import { useTranslation } from '../i18n/useTranslation';
import { ModelApp } from '../models';
import { useAppStore } from '../store/useAppStore';

export default function ProjectOverview() {
  const { appId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const app = useAppStore((state) => state.apps.find((item) => item._id === appId));
  if (!app) return <PanelSkeleton label={t('projectOverview.loading')} />;

  const hasAssistant = Boolean((app as ModelApp & { defaultBotInstanceId?: string }).defaultBotInstanceId || app.aiBot?.userId);
  const base = `/app/admin/apps/${app._id}`;
  return <main className="mx-auto max-w-5xl overflow-y-auto p-2 md:p-5">
    <div className="rounded-2xl bg-brand-50 p-5 md:p-6">
      <h1 className="text-2xl font-semibold">{t('projectOverview.title')}</h1>
      <p className="mt-2 text-sm text-gray-700">{hasAssistant ? t('projectOverview.assistantSummary') : t('projectOverview.appSummary')}</p>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Link to={hasAssistant ? `${base}/assistant` : `${base}/settings?tab=Appearance`} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand-500 px-5 text-sm font-semibold text-white shadow-sm hover:bg-brand-darker focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500">{hasAssistant ? t('projectOverview.configureAssistant') : t('projectCard.configure')}</Link>
        <button type="button" onClick={() => { void actionSwitchChatApp(app._id).catch(() => {}).finally(() => navigate('/app/chat')); }} className="inline-flex min-h-11 items-center rounded-xl px-4 text-sm font-semibold text-gray-800 hover:bg-white/70">{t('projectOverview.openChat')} →</button>
      </div>
    </div>
    {hasAssistant && <section className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-brand-200 bg-white p-5 md:p-6" aria-label={t('projectOverview.widget')}>
      <div className="min-w-0 max-w-2xl">
        <h2 className="text-lg font-semibold">{t('projectOverview.widget')}</h2>
        <p className="mt-1 text-sm leading-6 text-gray-700">{t('projectOverview.widgetText')}</p>
      </div>
      <Link to={`${base}/widget?tab=appearance`} className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl bg-brand-500 px-5 font-semibold text-white hover:bg-brand-darker focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500">{t('widgets.edit')}</Link>
    </section>}
  </main>;
}
