import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { env } from '../../config/env';
import { httpTryList, httpTryView, TryDemo, TryDemoView } from '../../http';
import { useTranslation } from '../../i18n/useTranslation';
import { resolveWidgetUrl } from '../../utils/widgetUrl';

// Public demo page /try/<site>/<token>: the named website (in a frame when it
// allows it, else a full-page picture) with the App's assistant widget on top.
// Nothing of the site is copied or served from here: a frame or a picture.
// The frame cannot navigate this page away (no allow-top-navigation) and gets
// no referrer; the page itself is noindex and sends no referrer either.
export default function TryDemoPage() {
  const { site = '', token = '' } = useParams();
  const { t } = useTranslation();
  const [state, setState] = useState<'loading' | 'ended' | 'ok'>('loading');
  const [view, setView] = useState<TryDemoView | null>(null);
  const [mine, setMine] = useState<TryDemo | null>(null);
  const [copied, setCopied] = useState(false);

  // Not for search engines, and no referrer (the address carries the token).
  useEffect(() => {
    const metas = [
      Object.assign(document.createElement('meta'), { name: 'robots', content: 'noindex, nofollow' }),
      Object.assign(document.createElement('meta'), { name: 'referrer', content: 'no-referrer' }),
    ];
    metas.forEach((m) => document.head.appendChild(m));
    return () => metas.forEach((m) => m.remove());
  }, []);

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

  // The App's live assistant widget, the same script operators embed.
  useEffect(() => {
    if (!view?.appId) return;
    const s = document.createElement('script');
    s.src = resolveWidgetUrl();
    s.id = 'chat-content-assistant';
    s.async = true;
    s.setAttribute('data-app-id', view.appId);
    if (env.VITE_API) s.setAttribute('data-api-base', env.VITE_API as string);
    document.body.appendChild(s);
    return () => {
      s.remove();
      document.getElementById('chat-widget')?.remove();
    };
  }, [view?.appId]);

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
      <div className="relative min-h-0 flex-1">
        {view.frameable ? (
          <iframe
            title={view.site}
            src={view.url}
            className="h-full w-full border-0"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
            referrerPolicy="no-referrer"
            data-testid="try-frame"
          />
        ) : view.screenshotUrl ? (
          <div className="h-full overflow-y-auto bg-gray-100" data-testid="try-picture">
            <p className="bg-amber-50 px-3 py-1 text-xs text-amber-900">{t('tryDemo.pictureNote').replace('{site}', view.site)}</p>
            <img src={view.screenshotUrl} alt={view.site} className="mx-auto block w-full max-w-[1280px]" referrerPolicy="no-referrer" />
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-gray-600" data-testid="try-preparing">
            {t('tryDemo.preparing').replace('{site}', view.site)}
          </div>
        )}
      </div>
    </main>
  );
}
