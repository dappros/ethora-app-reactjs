import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { actionCreateApp } from '../actions';
import { CreateWidgetModal } from '../components/modal/CreateWidgetModal';
import { env } from '../config/env';
import { useTranslation } from '../i18n/useTranslation';
import { phCapture } from '../posthog';
import { getOnboardingIntent, OnboardingIntent, setOnboardingIntent } from '../utils/onboardingIntent';

const paths: OnboardingIntent[] = ['website', 'chat', 'calls', 'selfHost'];

export default function StartProject() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [intent, setIntent] = useState<OnboardingIntent | null>(getOnboardingIntent);
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [showWidget, setShowWidget] = useState(false);

  const select = (value: OnboardingIntent) => {
    setIntent(value);
    setOnboardingIntent(value);
    phCapture('onboarding_intent_selected', { intent: value });
    setError('');
  };

  const continueToSetup = async () => {
    if (intent === 'website') { setShowWidget(true); return; }
    if (intent === 'selfHost') { localStorage.removeItem('newUser'); setOnboardingIntent(null); navigate('/app/admin/self-hosted'); return; }
    if (!intent || name.trim().length < 3 || busy) return;
    setBusy(true);
    setError('');
    try {
      const app = await actionCreateApp(name.trim());
      if (!app?._id) throw new Error(t('startProject.createFailed'));
      phCapture('onboarding_project_created', { intent });
      localStorage.removeItem('newUser');
      setOnboardingIntent(null);
      navigate(intent === 'calls' ? `/app/admin/apps/${app._id}/settings?tab=Chats` : `/app/admin/apps/${app._id}/settings?tab=Appearance&section=chat`);
    } catch (e) {
      setError((e as { response?: { data?: { error?: string } } })?.response?.data?.error || t('startProject.createFailed'));
    } finally { setBusy(false); }
  };

  return <main className="mx-auto w-full max-w-5xl overflow-y-auto p-4 md:p-8">
    <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
      <div><h1 className="text-3xl font-semibold">{t('startProject.title')}</h1><p className="mt-2 text-gray-600">{t('startProject.subtitle')}</p></div>
      <Link className="text-sm text-brand-500 underline" to="/app/admin/apps">{t('startProject.myProjects')}</Link>
    </div>
    <div className="grid gap-4 md:grid-cols-2" role="group" aria-label={t('startProject.title')}>
      {paths.map((path) => <button key={path} type="button" onClick={() => select(path)} disabled={path === 'website' && env.VITE_AI_FEATURE_ENABLED !== 'true'} aria-pressed={intent === path} className={`min-h-44 rounded-2xl border bg-white p-5 text-left shadow-sm transition hover:border-brand-500 focus-visible:outline-2 focus-visible:outline-brand-500 disabled:opacity-50 ${intent === path ? 'border-brand-500 ring-2 ring-brand-100' : 'border-gray-200'}`}>
        <span className="text-lg font-semibold">{t(`appIntent.${path}`)}</span>
        <span className="mt-3 block text-sm leading-6 text-gray-600">{t(`appIntent.${path}Description`)}</span>
      </button>)}
    </div>
    {intent && <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 md:p-6">
      <h2 className="text-lg font-semibold">{t(`appIntent.${intent}`)}</h2>
      <p className="mt-2 text-sm text-gray-600">{t(`appIntent.${intent}Steps`)}</p>
      {(intent === 'chat' || intent === 'calls') && <label className="mt-5 block max-w-lg text-sm font-medium">{t('startProject.name')}
        <input autoFocus maxLength={100} value={name} onChange={(e) => setName(e.target.value)} placeholder={t('startProject.namePlaceholder')} className="mt-2 block h-11 w-full rounded-xl border border-gray-300 px-4 outline-none focus-visible:ring-2 focus-visible:ring-brand-500" />
      </label>}
      {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
      <button type="button" onClick={() => void continueToSetup()} disabled={busy || ((intent === 'chat' || intent === 'calls') && name.trim().length < 3)} className="mt-5 h-11 rounded-xl bg-brand-500 px-6 font-semibold text-white hover:bg-brand-darker disabled:opacity-50">{busy ? t('startProject.creating') : t('startProject.continue')}</button>
    </section>}
    <p className="mt-7 text-sm text-gray-500">{t('startProject.help')} <Link className="text-brand-500 underline" to="/app/help">{t('nav.help')}</Link></p>
    {showWidget && <CreateWidgetModal onClose={() => setShowWidget(false)} />}
  </main>;
}
