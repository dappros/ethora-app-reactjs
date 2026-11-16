import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookACallModal } from '../components/modal/BookACallModal';
import { httpRecordOnboarding } from '../http';
import { useTranslation } from '../i18n/useTranslation';
import { phCapture } from '../posthog';

// The self-serve install hub on the website: one-command install, cloud
// images, Docker, Kubernetes.
const GET_HUB_URL = 'https://ethora.com/get/';

// Ethora on the owner's own server. Two ways forward, both recorded on the
// account so the signup report shows the lead: install it yourself from the
// /get/ hub, or ask us (Book a call).
export default function SelfHostedStart() {
  const { t } = useTranslation();
  const [showCall, setShowCall] = useState(false);
  const [asked, setAsked] = useState(false);

  useEffect(() => {
    httpRecordOnboarding({ goal: 'selfHost' }).catch(() => {});
  }, []);

  const talkToUs = () => {
    setShowCall(true);
    if (asked) return;
    setAsked(true);
    phCapture('onboarding_self_hosted_talk_to_us', {});
    httpRecordOnboarding({ goal: 'selfHost', talkToUs: true }).catch(() => {});
  };

  return (
    <main className="mx-auto w-full max-w-4xl overflow-y-auto p-4 md:p-8">
      <Link className="text-sm text-brand-500 underline" to="/app/admin/start">← {t('startProject.back')}</Link>
      <h1 className="mt-4 text-2xl font-semibold md:text-3xl">{t('selfHosted.title')}</h1>
      <p className="mt-3 max-w-2xl text-gray-600">{t('onboarding.selfHosted.intro')}</p>
      <ol className="mt-6 grid gap-3 md:grid-cols-3">
        {(['requirements', 'install', 'verify'] as const).map((step, index) => (
          <li key={step} className="rounded-2xl border border-gray-200 bg-white p-4">
            <span className="text-sm font-semibold text-brand-500">{index + 1}</span>
            <h2 className="mt-1 text-base font-semibold">{t(`onboarding.selfHosted.${step}`)}</h2>
            <p className="mt-2 text-sm leading-6 text-gray-600">{t(`onboarding.selfHosted.${step}Text`)}</p>
          </li>
        ))}
      </ol>
      <div className="mt-6 flex flex-wrap gap-3">
        <a
          href={GET_HUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => phCapture('onboarding_self_hosted_get', {})}
          className="rounded-xl bg-brand-500 px-5 py-3 font-semibold text-white hover:bg-brand-darker"
        >
          {t('onboarding.selfHosted.getHub')} ↗
        </a>
        <button type="button" onClick={talkToUs} className="rounded-xl border border-gray-300 bg-white px-5 py-3 font-semibold" data-testid="self-hosted-talk-to-us">
          {t('onboarding.talkToUs')}
        </button>
      </div>
      <p className="mt-4 max-w-2xl text-sm text-gray-500">{t('onboarding.selfHosted.talkNote')}</p>
      {showCall && <BookACallModal onClose={() => setShowCall(false)} />}
    </main>
  );
}
