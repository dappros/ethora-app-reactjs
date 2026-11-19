import { ReactNode, useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { httpTryPreview, TryPreview } from '../../http';
import { useTranslation } from '../../i18n/useTranslation';
import { TrySiteView } from './TrySiteView';
import { useNoIndexNoReferrer } from './useNoIndexNoReferrer';

const apiError = (e: unknown) => (e as { response?: { data?: { error?: string } } })?.response?.data?.error || '';

// The owner's preview /try/preview/<appId>?page=<url>: the App's website with
// its live widget, for the signed-in owner (no share link, no token). The
// App's "Try on Website" tab frames this page: it is served from try.html,
// whose frame policy may frame the site, so the admin panel's own pages keep
// theirs. Opened in its own tab it works the same.
export default function TryPreviewPage() {
  const { appId = '' } = useParams();
  const [params] = useSearchParams();
  const page = params.get('page') || '';
  const { t } = useTranslation();
  const signedIn = Boolean(localStorage.getItem('token-538'));
  const [view, setView] = useState<TryPreview | null>(null);
  const [error, setError] = useState('');
  useNoIndexNoReferrer();

  useEffect(() => {
    if (!signedIn || !appId) return;
    let cancelled = false;
    let timer: number | undefined;
    const load = async () => {
      try {
        const { data } = await httpTryPreview(appId, { page });
        if (cancelled) return;
        setError('');
        setView(data);
        if (data.pending) timer = window.setTimeout(() => void load(), 4000);
      } catch (e) {
        if (!cancelled) setError(apiError(e) || t('tryDemo.error.generic'));
      }
    };
    void load();
    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
    };
  }, [appId, page, signedIn, t]);

  const note = (text: string, action?: ReactNode) => (
    <main className="flex h-[100dvh] items-center justify-center bg-gray-50 p-4 text-center text-sm text-gray-700" data-testid="try-preview-note">
      <div>
        <p>{text}</p>
        {action}
      </div>
    </main>
  );
  if (!signedIn) return note(t('tryPreview.signIn'), <Link className="mt-3 inline-block text-brand-500 underline" to="/login">{t('tryPreview.signInLink')}</Link>);
  if (error) return note(error);
  if (!view) return <main className="h-[100dvh] bg-gray-50" />;
  if (!view.available) return note(t('tryPreview.unavailable'));

  return (
    <main className="flex h-[100dvh] flex-col bg-white" data-testid="try-preview">
      <TrySiteView appId={view.appId} site={view.site || ''} url={view.url || ''} frameable={view.frameable} screenshotUrl={view.screenshotUrl} />
    </main>
  );
}
