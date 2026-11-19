import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { httpTryList, httpTryView, TryDemo, TryDemoView } from '../../http';
import { useTranslation } from '../../i18n/useTranslation';
import { TrySiteView } from './TrySiteView';
import { useNoIndexNoReferrer } from './useNoIndexNoReferrer';

// Public demo page /try/<site>/<token>: the named website with the App's
// assistant widget on top (TrySiteView), under a bar. The page is noindex and
// sends no referrer.
export default function TryDemoPage() {
  const { site = '', token = '' } = useParams();
  const { t } = useTranslation();
  const [state, setState] = useState<'loading' | 'ended' | 'ok'>('loading');
  const [view, setView] = useState<TryDemoView | null>(null);
  const [mine, setMine] = useState<TryDemo | null>(null);
  const [copied, setCopied] = useState(false);

  useNoIndexNoReferrer();

  useEffect(() => {
    let cancelled = false;
    let timer: number | undefined;
    const load = async (count: boolean) => {
      try {
        const { data } = await httpTryView(site, token, count);
        if (cancelled) return;
        setView(data);
        setState('ok');
        // The frame decision or the picture is still being prepared.
        if (data.pending) timer = window.setTimeout(() => void load(false), 4000);
      } catch {
        if (!cancelled) setState('ended');
      }
    };
    void load(true);
    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
    };
  }, [site, token]);

  // The creator (signed in, owns the demo) gets the link, the end date and a
  // way to the assistant's page.
  useEffect(() => {
    if (!view?.demoId || !localStorage.getItem('token-538')) return;
    httpTryList(view.appId)
      .then(({ data }) => setMine((data.items || []).find((d) => d.id === view.demoId) || null))
      .catch(() => {});
  }, [view?.demoId, view?.appId]);

  if (state === 'ended') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4" data-testid="try-ended">
        <section className="max-w-md rounded-xl border border-gray-200 bg-white p-6 text-center">
          <h1 className="text-xl font-semibold">{t('tryDemo.ended.title')}</h1>
          <p className="mt-2 text-sm text-gray-600">{t('tryDemo.ended.text')}</p>
          <a className="mt-4 inline-block rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white" href="https://ethora.com/">
            {t('tryDemo.ended.cta')}
          </a>
        </section>
      </main>
    );
  }
  if (state === 'loading' || !view) return <main className="min-h-screen bg-gray-50" />;

  const date = new Date(view.expiresAt).toLocaleDateString(undefined, { dateStyle: 'medium' });
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      /* the address bar still has it */
    }
  };

  return (
    <main className="flex h-[100dvh] flex-col bg-white" data-testid="try-demo">
      <header className="flex min-h-10 flex-wrap items-center gap-x-3 gap-y-1 border-b border-gray-200 bg-gray-900 px-3 py-1.5 text-sm text-white">
        <span className="min-w-0 truncate font-semibold" data-testid="try-bar-title">{t('tryDemo.bar.title').replace('{site}', view.site)}</span>
        <span className="ml-auto flex flex-wrap items-center gap-x-3">
          {mine && (
            <>
              <button type="button" className="underline" onClick={() => void copy()} data-testid="try-copy">
                {copied ? t('tryDemo.bar.copied') : t('tryDemo.bar.copy')}
              </button>
              <span className="text-gray-300" data-testid="try-ends">{t('tryDemo.bar.ends').replace('{date}', date)}</span>
              <a className="underline" href={`/app/admin/apps/${view.appId}/assistant`}>{t('tryDemo.bar.openAssistant')}</a>
            </>
          )}
          <a className="text-gray-300 underline" href="https://ethora.com/" target="_blank" rel="noopener">{t('tryDemo.bar.madeWith')}</a>
        </span>
      </header>
      <TrySiteView appId={view.appId} site={view.site} url={view.url} frameable={view.frameable} screenshotUrl={view.screenshotUrl} />
    </main>
  );
}
