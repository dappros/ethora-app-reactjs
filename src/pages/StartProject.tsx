import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { actionCreateApp } from '../actions';
import { GoalIllustration } from '../components/GoalIllustration';
import { BookACallModal } from '../components/modal/BookACallModal';
import { env } from '../config/env';
import { httpRecordOnboarding, httpUpdateApp } from '../http';
import { useTranslation } from '../i18n/useTranslation';
import { TrustSafetyOverrides } from '../models';
import { phCapture } from '../posthog';
import { clearAgentsOnboarding } from '../utils/agentsOnboarding';
import {
  createWebsiteAssistant,
  WebsiteAssistantError,
  WebsiteAssistantProgress,
  WebsiteAssistantStage,
} from '../utils/createWebsiteAssistant';
import {
  explicitOnboardingIntent,
  getOnboardingIntent,
  isOnboardingIntentExplicit,
  normaliseWebsite,
  ONBOARDING_GOALS,
  OnboardingIntent,
  setOnboardingIntent,
  suggestAssistantName,
} from '../utils/onboardingIntent';

type Step = 'choose' | 'website' | 'sdk' | 'messenger';

// Trust and Safety starting point of a ready-made messenger, as App overrides
// (they only ever tighten the install policy). Changeable later under
// Settings > Trust & Safety.
const MESSENGER_PRESETS: Record<'team' | 'clients', TrustSafetyOverrides> = {
  team: { imageLevel: 'standard', textToxicityAction: 'flag', textSevereAction: 'blur' },
  clients: { imageLevel: 'strict', textToxicityAction: 'blur', textSevereAction: 'hide', piiAction: 'flag' },
};

const DOC_ACCEPT = '.pdf,.doc,.docx,.txt,.md,.csv,.html';

function finishOnboarding() {
  try {
    localStorage.removeItem('newUser');
  } catch {
    /* Storage may be unavailable. */
  }
  clearAgentsOnboarding();
  setOnboardingIntent(null);
}

export default function StartProject() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const aiEnabled = env.VITE_AI_FEATURE_ENABLED === 'true';
  const [searchParams] = useSearchParams();
  // ?intent= on this page itself (a link from the website for a signed-in
  // owner) counts like one carried through sign-up.
  const urlIntent = useMemo(() => explicitOnboardingIntent(searchParams), [searchParams]);
  const preselected = useMemo(() => urlIntent || getOnboardingIntent(), [urlIntent]);
  const [step, setStep] = useState<Step>('choose');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [uncertain, setUncertain] = useState(false);
  const [stage, setStage] = useState<WebsiteAssistantStage | 'creating' | ''>('');

  // Website path.
  const [website, setWebsite] = useState('');
  const [name, setName] = useState('');
  const [nameEdited, setNameEdited] = useState(false);
  const [useDocs, setUseDocs] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const progress = useRef<WebsiteAssistantProgress>({});

  // Messenger path.
  const [preset, setPreset] = useState<'team' | 'clients'>('team');
  const [adultsOnly, setAdultsOnly] = useState(false);
  const [showCall, setShowCall] = useState(false);

  const choose = (goal: OnboardingIntent, explicit = false) => {
    // Stored without the explicit flag: it is consumed by this one skip, so
    // a later visit to the start screen shows the chooser again.
    setOnboardingIntent(goal, false);
    setError('');
    phCapture('onboarding_intent_selected', { intent: goal, explicit });
    httpRecordOnboarding({ goal }).catch(() => {});
    if (goal === 'selfHost') {
      navigate('/app/admin/self-hosted');
      return;
    }
    setStep(goal);
  };

  // A new account is sent here once after sign-up (navigateToUserPage reads
  // the newUser flag). Clear it as soon as the screen is shown, so whichever
  // way the owner leaves (a goal, a link, the menu, the back button) the next
  // login lands where it normally would.
  useEffect(() => {
    try {
      localStorage.removeItem('newUser');
    } catch {
      /* Storage may be unavailable. */
    }
    clearAgentsOnboarding();
  }, []);

  // An explicit ?intent= from the website skips the chooser.
  useEffect(() => {
    if (!preselected || !(urlIntent || isOnboardingIntentExplicit())) return;
    if (preselected === 'website' && !aiEnabled) return;
    choose(preselected, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onWebsiteChange = (value: string) => {
    setWebsite(value);
    if (!nameEdited) setName(suggestAssistantName(value, t('onboarding.website.nameTemplate')));
  };

  const websiteUrl = normaliseWebsite(website);
  const canCreateWebsite =
    !busy && !uncertain && name.trim().length >= 3 && (useDocs ? files.length > 0 : Boolean(websiteUrl));

  const createWebsite = async () => {
    if (!canCreateWebsite) return;
    setBusy(true);
    setError('');
    try {
      const { app, jobId, crawlError } = await createWebsiteAssistant(
        {
          name: name.trim(),
          website: useDocs ? null : websiteUrl,
          files: useDocs ? files : undefined,
          prompt: t('onboarding.website.defaultPrompt'),
        },
        progress.current,
        setStage
      );
      finishOnboarding();
      navigate(`/app/admin/apps/${app._id}`, { state: { justCreated: true, jobId, crawlError, website: useDocs ? null : websiteUrl } });
    } catch (e) {
      const err = e as WebsiteAssistantError;
      if (err.uncertain) setUncertain(true);
      const key = `onboarding.error.${err.message}`;
      const translated = t(key);
      setError(translated === key ? err.message : translated);
    } finally {
      setBusy(false);
      setStage('');
    }
  };

  const createApp = async (goal: 'sdk' | 'messenger') => {
    if (busy || name.trim().length < 3 || (goal === 'messenger' && !adultsOnly)) return;
    setBusy(true);
    setError('');
    setStage('creating');
    try {
      const app = await actionCreateApp(name.trim(), { onboardingGoal: goal });
      if (!app?._id) throw new Error(t('startProject.createFailed'));
      if (goal === 'messenger') {
        // Best effort: the App exists either way and the preset can be set
        // under Settings > Trust & Safety.
        await httpUpdateApp(app._id, { trustSafety: MESSENGER_PRESETS[preset] }).catch(() => {});
      }
      phCapture('onboarding_project_created', { intent: goal, ...(goal === 'messenger' ? { ts_preset: preset } : {}) });
      finishOnboarding();
      navigate(`/app/admin/apps/${app._id}`, { state: { justCreated: true } });
    } catch (e) {
      setError((e as { response?: { data?: { error?: string } } })?.response?.data?.error || t('startProject.createFailed'));
    } finally {
      setBusy(false);
      setStage('');
    }
  };

  const back = (
    <button type="button" className="text-sm text-brand-500 underline" onClick={() => { setStep('choose'); setError(''); setOnboardingIntent(null); }}>
      ← {t('startProject.back')}
    </button>
  );

  const input = 'mt-1 block h-11 w-full rounded-xl border border-gray-300 bg-white px-4 text-base outline-none focus-visible:ring-2 focus-visible:ring-brand-500';
  const primary = 'h-11 rounded-xl bg-brand-500 px-6 font-semibold text-white hover:bg-brand-darker disabled:opacity-50';
  const errorBox = error && (
    <div role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
      {error} {uncertain && t('onboarding.error.checkBeforeRetry')}
    </div>
  );

  if (step === 'website') {
    return (
      <main className="mx-auto w-full max-w-2xl overflow-y-auto p-4 md:p-8">
        {back}
        <h1 className="mt-4 text-2xl font-semibold md:text-3xl">{t('onboarding.website.title')}</h1>
        <p className="mt-2 text-gray-600">{useDocs ? t('onboarding.website.subtitleDocs') : t('onboarding.website.subtitle')}</p>
        <form className="mt-6 space-y-4" onSubmit={(e) => { e.preventDefault(); void createWebsite(); }}>
          {!useDocs ? (
            <label className="block text-sm font-medium">
              {t('onboarding.website.websiteLabel')}
              <input
                autoFocus
                type="text"
                inputMode="url"
                autoComplete="url"
                value={website}
                onChange={(e) => onWebsiteChange(e.target.value)}
                disabled={busy || Boolean(progress.current.connected)}
                placeholder="https://yourbusiness.com"
                className={input}
                data-testid="onboarding-website"
              />
              {website.trim() && !websiteUrl && <span className="mt-1 block text-xs text-red-700">{t('onboarding.website.invalid')}</span>}
            </label>
          ) : (
            <label className="block text-sm font-medium">
              {t('onboarding.website.docsLabel')}
              <input
                type="file"
                multiple
                accept={DOC_ACCEPT}
                disabled={busy}
                onChange={(e) => setFiles(Array.from(e.target.files || []))}
                className="mt-1 block w-full rounded-xl border border-dashed border-gray-300 bg-white p-4 text-sm"
              />
              <span className="mt-1 block text-xs text-gray-500">{t('onboarding.website.docsHint')}</span>
            </label>
          )}
          <label className="block text-sm font-medium">
            {t('onboarding.website.nameLabel')}
            <input
              value={name}
              maxLength={100}
              onChange={(e) => { setName(e.target.value); setNameEdited(true); }}
              disabled={busy || Boolean(progress.current.app)}
              placeholder={t('onboarding.website.namePlaceholder')}
              className={input}
              data-testid="onboarding-name"
            />
            {!useDocs && !nameEdited && name && <span className="mt-1 block text-xs text-gray-500">{t('onboarding.website.nameSuggested')}</span>}
          </label>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1">
            <button type="submit" disabled={!canCreateWebsite} className={primary} data-testid="onboarding-create-assistant">
              {busy ? t(`onboarding.stage.${stage || 'creatingApp'}`) : error ? t('onboarding.retry') : t('onboarding.website.create')}
            </button>
            {!busy && (
              <button type="button" className="text-sm text-gray-700 underline" onClick={() => { setUseDocs(!useDocs); setError(''); }}>
                {useDocs ? t('onboarding.website.useWebsite') : t('onboarding.website.useDocs')}
              </button>
            )}
          </div>
          {busy && <p role="status" className="text-sm text-gray-600">{t('onboarding.website.busyNote')}</p>}
          {errorBox}
        </form>
      </main>
    );
  }

  if (step === 'sdk' || step === 'messenger') {
    const messenger = step === 'messenger';
    return (
      <main className="mx-auto w-full max-w-2xl overflow-y-auto p-4 md:p-8">
        {back}
        <h1 className="mt-4 text-2xl font-semibold md:text-3xl">{t(`onboarding.${step}.title`)}</h1>
        <p className="mt-2 text-gray-600">{t(`onboarding.${step}.subtitle`)}</p>
        <form className="mt-6 space-y-5" onSubmit={(e) => { e.preventDefault(); void createApp(step); }}>
          <label className="block text-sm font-medium">
            {t(`onboarding.${step}.nameLabel`)}
            <input autoFocus maxLength={100} value={name} onChange={(e) => setName(e.target.value)} placeholder={t(`onboarding.${step}.namePlaceholder`)} className={input} />
          </label>
          {messenger && (
            <fieldset>
              <legend className="text-sm font-medium">{t('onboarding.messenger.presetLabel')}</legend>
              <p className="mt-1 text-xs text-gray-500">{t('onboarding.messenger.presetHint')}</p>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {(['team', 'clients'] as const).map((p) => (
                  <label key={p} className={`cursor-pointer rounded-xl border p-3 text-sm ${preset === p ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-500' : 'border-gray-200 bg-white'}`}>
                    <input type="radio" name="ts-preset" className="sr-only" checked={preset === p} onChange={() => setPreset(p)} />
                    <span className="block font-semibold">{t(`onboarding.messenger.preset.${p}`)}</span>
                    <span className="mt-1 block text-gray-600">{t(`onboarding.messenger.preset.${p}Desc`)}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          )}
          {messenger && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              <label className="flex items-start gap-2">
                <input type="checkbox" className="mt-1" checked={adultsOnly} onChange={(e) => setAdultsOnly(e.target.checked)} data-testid="onboarding-adults-only" />
                <span>{t('onboarding.messenger.adultsOnly')}</span>
              </label>
              <p className="mt-2 pl-6">
                {t('onboarding.messenger.minorsNote')}{' '}
                <button type="button" className="underline" onClick={() => setShowCall(true)}>{t('onboarding.talkToUs')}</button>
              </p>
            </div>
          )}
          <button type="submit" disabled={busy || name.trim().length < 3 || (messenger && !adultsOnly)} className={primary}>
            {busy ? t('startProject.creating') : t(`onboarding.${step}.create`)}
          </button>
          {errorBox}
        </form>
        {showCall && <BookACallModal onClose={() => setShowCall(false)} />}
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-5xl overflow-y-auto p-4 md:p-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold md:text-3xl">{t('startProject.title')}</h1>
          <p className="mt-2 text-gray-600">{t('onboarding.choose.subtitle')}</p>
        </div>
        <Link className="text-sm text-brand-500 underline" to="/app/admin/apps" onClick={finishOnboarding}>{t('startProject.myProjects')}</Link>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" role="group" aria-label={t('startProject.title')}>
        {ONBOARDING_GOALS.map((goal) => {
          const disabled = goal === 'website' && !aiEnabled;
          return (
            <button
              key={goal}
              type="button"
              onClick={() => choose(goal)}
              disabled={disabled}
              data-testid={`onboarding-goal-${goal}`}
              className={`flex h-full min-h-36 flex-col rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:border-brand-500 focus-visible:outline-2 focus-visible:outline-brand-500 disabled:cursor-not-allowed disabled:opacity-50 ${preselected === goal ? 'border-brand-500 ring-2 ring-brand-100' : 'border-gray-200'}`}
            >
              <GoalIllustration goal={goal} />
              <span className="block text-base font-semibold">{t(`onboarding.goal.${goal}`)}</span>
              <span className="mt-2 block text-sm leading-6 text-gray-600">{disabled ? t('onboarding.goal.websiteDisabled') : t(`onboarding.goal.${goal}Desc`)}</span>
            </button>
          );
        })}
      </div>
      <p className="mt-6 text-sm text-gray-600">
        {t('onboarding.choose.mcpPrefix')}{' '}
        <Link className="text-brand-500 underline" to="/app/account?tab=AI+Assistants" onClick={() => phCapture('onboarding_intent_selected', { intent: 'mcp' })}>
          {t('onboarding.choose.mcpLink')}
        </Link>
        <span className="px-2 text-gray-400">·</span>
        <Link className="text-brand-500 underline" to="/app/admin/apps" onClick={() => { phCapture('onboarding_intent_selected', { intent: 'browse' }); finishOnboarding(); }}>
          {t('onboarding.choose.justLooking')}
        </Link>
      </p>
      {errorBox}
    </main>
  );
}
