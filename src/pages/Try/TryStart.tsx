import { FormEvent, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { actionCreateApp } from '../../actions';
import { CopyButton } from '../../components/CopyButton';
import { httpGetSiteCrawlJob, httpTryCreate, httpTryPrepare, TryDemo } from '../../http';
import { useTranslation } from '../../i18n/useTranslation';
import { createWebsiteAssistant } from '../../utils/createWebsiteAssistant';
import { rememberReturnPath } from '../../utils/returnPath';

type Phase = 'idle' | 'checking' | 'creating' | 'reading' | 'done' | 'error';

const hostOf = (value: string) => value.trim().replace(/^https?:\/\//i, '').replace(/[/?#].*$/, '').toLowerCase();
const apiError = (e: unknown, fallback: string) =>
  (e as { response?: { data?: { error?: string } } })?.response?.data?.error || fallback;

// The front door of "Try it on your site": /try (one field and a button) and
// /try/<site> (goes straight on when signed in). Creating needs a sign-in;
// the finished link works without one.
export default function TryStart() {
  const { site } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const signedIn = Boolean(localStorage.getItem('token-538'));
  const [value, setValue] = useState(site || '');
  const [phase, setPhase] = useState<Phase>('idle');
  const [error, setError] = useState('');
  const [demo, setDemo] = useState<TryDemo | null>(null);
  const [reused, setReused] = useState(false);
  const [read, setRead] = useState(0);
  const [reading, setReading] = useState(false);
  const started = useRef<string>('');

  useEffect(() => {
    if (site && signedIn && started.current !== site) {
      started.current = site;
      setValue(site);
      void run(site);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [site, signedIn]);

  const run = async (name: string) => {
    setError('');
    setDemo(null);
    setReused(false);
    setRead(0);
    try {
      setPhase('checking');
      const { data: prep } = await httpTryPrepare(name);
      if (prep.existing) {
        setDemo(prep.existing);
        setReused(true);
        setPhase('done');
        return;
      }
      setPhase('creating');
      const app = await actionCreateApp(prep.site, { onboardingGoal: 'website' });
      if (!app?._id) throw new Error(t('tryDemo.error.generic'));
      // The demo first: it marks the App so its crawl is capped.
      const { data: created } = await httpTryCreate({ appId: app._id, site: prep.site, source: 'try' });
      setDemo(created.demo);
      const { jobId, crawlError } = await createWebsiteAssistant(
        { name: prep.site, website: prep.url, existingApp: app, prompt: t('onboarding.website.defaultPrompt') },
        { app },
        () => {}
      );
      if (crawlError || !jobId) {
        setError(t('tryDemo.error.crawl').replace('{reason}', crawlError || t('tryDemo.error.generic')));
        setPhase('done');
        return;
      }
      setPhase('reading');
      setReading(true);
      const poll = async () => {
        try {
          const { data } = await httpGetSiteCrawlJob(app._id, jobId);
          const job = data?.result as { status?: string; savedPages?: number } | undefined;
          const pages = Number(job?.savedPages) || 0;
          setRead(pages);
          if (pages > 0) setPhase('done');
          if (job && ['completed', 'failed', 'cancelled'].includes(String(job.status))) {
            setReading(false);
            setPhase('done');
            return;
          }
        } catch {
          /* keep polling */
        }
        window.setTimeout(() => void poll(), 3000);
      };
      void poll();
    } catch (e) {
      setError(apiError(e, t('tryDemo.error.generic')));
      setPhase('error');
    }
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const host = hostOf(value);
    if (!host) return;
    if (!signedIn) {
      rememberReturnPath(`/try/${host}`);
      navigate('/login');
      return;
    }
    started.current = '';
    navigate(`/try/${encodeURIComponent(host)}`);
  };

  const link = demo ? `${window.location.origin}${demo.link}` : '';
  const busy = phase === 'checking' || phase === 'creating' || phase === 'reading';

  return (
    <main className="flex min-h-screen items-start justify-center bg-gray-50 px-4 py-10 sm:items-center" data-testid="try-start">
      <section className="w-full max-w-xl rounded-xl border border-gray-200 bg-white p-5 sm:p-6">
        <h1 className="text-xl font-semibold">{t('tryDemo.start.title')}</h1>
        <p className="mt-1 text-sm text-gray-600">{t('tryDemo.start.text')}</p>
        <form className="mt-4 flex flex-col gap-2 sm:flex-row" onSubmit={submit}>
          <label className="sr-only" htmlFor="try-site">{t('tryDemo.start.label')}</label>
          <input
            id="try-site"
            className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
            placeholder="example.com"
            value={value}
            disabled={busy}
            onChange={(e) => setValue(e.target.value)}
            data-testid="try-site"
          />
          <button
            type="submit"
            disabled={busy || !hostOf(value)}
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            data-testid="try-go"
          >
            {signedIn ? t('tryDemo.start.button') : t('tryDemo.start.signIn')}
          </button>
        </form>
        {!signedIn && <p className="mt-2 text-xs text-gray-500">{t('tryDemo.start.signInNote')}</p>}

        {busy && (
          <p className="mt-4 text-sm text-gray-700" data-testid="try-progress">
            {phase === 'checking'
              ? t('tryDemo.progress.checking')
              : phase === 'creating'
                ? t('tryDemo.progress.creating')
                : read > 0
                  ? t('tryDemo.progress.reading').replace('{read}', String(read))
                  : t('tryDemo.progress.waiting')}
          </p>
        )}
        {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-800" data-testid="try-error">{error}</p>}

        {phase === 'done' && demo && (
          <div className="mt-5 rounded-lg border border-green-200 bg-green-50 p-4" data-testid="try-done">
            <p className="font-semibold">{t('tryDemo.done.title')}</p>
            {reused && <p className="mt-1 text-sm text-gray-700">{t('tryDemo.done.reused')}</p>}
            <p className="mt-1 text-sm text-gray-700">
              {t('tryDemo.done.text').replace('{date}', new Date(demo.expiresAt).toLocaleDateString(undefined, { dateStyle: 'medium' }))}
            </p>
            <div className="mt-3 flex min-w-0 items-center gap-2">
              <input readOnly className="min-w-0 flex-1 rounded border border-gray-300 bg-white px-2 py-1 font-mono text-xs" value={link} data-testid="try-link" />
              <CopyButton value={link} />
            </div>
            <a className="mt-3 inline-block rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white" href={demo.link} target="_blank" rel="noopener">
              {t('tryDemo.done.open')}
            </a>
            {reading && (
              <p className="mt-2 text-xs text-gray-600">
                {t('tryDemo.progress.reading').replace('{read}', String(read))}. {t('tryDemo.done.stillReading')}
              </p>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
