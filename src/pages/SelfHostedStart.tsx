import { Link } from 'react-router-dom';
import { useTranslation } from '../i18n/useTranslation';

export default function SelfHostedStart() {
  const { t } = useTranslation();
  return <main className="mx-auto w-full max-w-4xl overflow-y-auto p-4 md:p-8">
    <Link className="text-sm text-brand-500 underline" to="/app/admin/start">← {t('startProject.back')}</Link>
    <h1 className="mt-5 text-3xl font-semibold">{t('selfHosted.title')}</h1>
    <p className="mt-3 max-w-2xl text-gray-600">{t('selfHosted.intro')}</p>
    <ol className="mt-8 grid gap-4 md:grid-cols-3">
      {(['requirements', 'install', 'verify'] as const).map((step, index) => <li key={step} className="rounded-2xl border border-gray-200 bg-white p-5">
        <span className="text-sm font-semibold text-brand-500">{index + 1}</span>
        <h2 className="mt-2 text-lg font-semibold">{t(`selfHosted.${step}`)}</h2>
        <p className="mt-2 text-sm leading-6 text-gray-600">{t(`selfHosted.${step}Text`)}</p>
      </li>)}
    </ol>
    <div className="mt-7 flex flex-wrap gap-3">
      <a href="https://ethora.com/chat-sdk/self-hosted-chat-server-aws/" target="_blank" rel="noopener noreferrer" className="rounded-xl bg-brand-500 px-5 py-3 font-semibold text-white">{t('selfHosted.guide')} ↗</a>
      <Link to="/app/help" className="rounded-xl border border-gray-300 px-5 py-3 font-semibold">{t('selfHosted.support')}</Link>
    </div>
  </main>;
}
