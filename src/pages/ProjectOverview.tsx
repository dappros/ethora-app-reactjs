import { Link, useNavigate, useParams } from 'react-router-dom';
import { actionSwitchChatApp } from '../actions';
import { useTranslation } from '../i18n/useTranslation';
import { ModelApp } from '../models';
import { useAppStore } from '../store/useAppStore';

export default function ProjectOverview() {
  const { appId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const app = useAppStore((state) => state.apps.find((item) => item._id === appId));
  if (!app) return <p role="status" className="p-5 text-gray-600">{t('configAI.loading')}</p>;

  const hasAssistant = Boolean((app as ModelApp & { defaultBotInstanceId?: string }).defaultBotInstanceId || app.aiBot?.userId);
  const base = `/app/admin/apps/${app._id}`;
  const cards = [
    { title: t(hasAssistant ? 'projectOverview.assistantSetup' : 'projectOverview.setup'), body: t(hasAssistant ? 'projectOverview.assistantSetupText' : 'projectOverview.setupText'), to: hasAssistant ? `${base}/ai` : `${base}/settings?tab=Appearance`, action: hasAssistant ? t('projectOverview.configureAssistant') : t('projectCard.configure') },
    { title: t('projectOverview.people'), body: t('projectOverview.peopleText'), to: `${base}/users`, action: t('projectOverview.openPeople') },
    { title: t('projectOverview.activity'), body: t('projectOverview.activityText'), to: `${base}/statistics`, action: t('projectOverview.openActivity') },
  ];
  return <main className="mx-auto max-w-5xl overflow-y-auto p-2 md:p-5">
    <div className="rounded-2xl bg-brand-50 p-5 md:p-6">
      <h1 className="text-2xl font-semibold">{t('projectOverview.title')}</h1>
      <p className="mt-2 text-sm text-gray-600">{hasAssistant ? t('projectOverview.assistantSummary') : t('projectOverview.appSummary')}</p>
      <button type="button" onClick={() => { void actionSwitchChatApp(app._id).catch(() => {}).finally(() => navigate('/app/chat')); }} className="mt-4 block text-sm font-semibold text-brand-500 underline">{t('projectOverview.openChat')} →</button>
    </div>
    {hasAssistant && <section className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-brand-200 bg-white p-5 md:p-6" aria-label={t('projectOverview.widget')}>
      <div className="min-w-0 max-w-2xl">
        <h2 className="text-lg font-semibold">{t('projectOverview.widget')}</h2>
        <p className="mt-1 text-sm leading-6 text-gray-600">{t('projectOverview.widgetText')}</p>
      </div>
      <Link to={`/app/admin/widgets/${app._id}?tab=appearance`} className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl bg-brand-500 px-5 font-semibold text-white hover:bg-brand-darker focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500">{t('widgets.edit')}</Link>
    </section>}
    <div className="mt-5 grid gap-4 md:grid-cols-3">
      {cards.map((card) => <section key={card.title} className="flex flex-col rounded-2xl border border-gray-200 p-5">
        <h2 className="text-lg font-semibold">{card.title}</h2>
        <p className="mt-2 flex-1 text-sm leading-6 text-gray-600">{card.body}</p>
        <Link to={card.to} className="mt-5 text-sm font-semibold text-brand-500 underline">{card.action} →</Link>
      </section>)}
    </div>
  </main>;
}
