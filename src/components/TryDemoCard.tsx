import { useCallback, useEffect, useState } from 'react';
import { httpTryCreate, httpTryEnd, httpTryExtend, httpTryList, TryDemo } from '../http';
import { useTranslation } from '../i18n/useTranslation';
import { ModelApp } from '../models';
import { CopyButton } from './CopyButton';

const apiError = (e: unknown, fallback: string) =>
  (e as { response?: { data?: { error?: string } } })?.response?.data?.error || fallback;

// "See it on your site" in the assistant page's Install section: a demo link
// for this App's website (backend modules/tryDemo), with its counts.
export function TryDemoCard({ app }: { app: ModelApp }) {
  const { t } = useTranslation();
  const firstSite = (app.aiBot?.siteUrlsV2?.[0] as { url?: string } | undefined)?.url || '';
  const [site, setSite] = useState(firstSite.replace(/^https?:\/\//, '').replace(/\/$/, ''));
  const [demo, setDemo] = useState<TryDemo | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const { data } = await httpTryList(app._id);
      setDemo((data.items || []).find((d) => d.active) || null);
    } catch {
      /* the card stays in its "create" state */
    }
  }, [app._id]);
  useEffect(() => {
    void load();
  }, [load]);

  const act = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    setError('');
    try {
      await fn();
      await load();
    } catch (e) {
      setError(apiError(e, t('tryDemo.error.generic')));
    } finally {
      setBusy(false);
    }
  };

  const date = demo ? new Date(demo.expiresAt).toLocaleDateString(undefined, { dateStyle: 'medium' }) : '';
  const link = demo ? `${window.location.origin}${demo.link}` : '';
  return (
    <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-3" data-testid="try-card">
      <p className="font-semibold">{t('tryDemo.card.title')}</p>
      <p className="mt-1 text-sm text-gray-600">{t('tryDemo.card.text')}</p>
      {demo ? (
        <div className="mt-3 space-y-2 text-sm">
          <div className="flex min-w-0 items-center gap-2">
            <input readOnly className="min-w-0 flex-1 rounded border border-gray-300 bg-white px-2 py-1 font-mono text-xs" value={link} data-testid="try-card-link" />
            <CopyButton value={link} />
          </div>
          <p className="text-gray-700" data-testid="try-card-stats">
            {t('tryDemo.bar.ends').replace('{date}', date)} · {t('tryDemo.card.views').replace('{n}', String(demo.views))} ·{' '}
            {t('tryDemo.card.questions').replace('{n}', String(demo.questions ?? 0))} ·{' '}
            {demo.frameable == null ? t('tryDemo.card.pending') : demo.frameable ? t('tryDemo.card.frame') : t('tryDemo.card.picture')}
          </p>
          <div className="flex flex-wrap gap-2">
            <a className="rounded-lg bg-brand-500 px-3 py-1.5 font-semibold text-white" href={demo.link} target="_blank" rel="noopener">
              {t('tryDemo.done.open')}
            </a>
            <button type="button" disabled={busy} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5" onClick={() => void act(() => httpTryExtend(demo.id))} data-testid="try-card-extend">
              {t('tryDemo.card.extend')}
            </button>
            <button type="button" disabled={busy} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5" onClick={() => void act(() => httpTryEnd(demo.id))} data-testid="try-card-end">
              {t('tryDemo.card.end')}
            </button>
          </div>
        </div>
      ) : (
        <form
          className="mt-3 flex flex-col gap-2 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            if (site.trim()) void act(() => httpTryCreate({ appId: app._id, site: site.trim(), source: 'install' }));
          }}
        >
          <label className="sr-only" htmlFor="try-card-site">{t('tryDemo.card.siteLabel')}</label>
          <input id="try-card-site" className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm" placeholder="example.com" value={site} onChange={(e) => setSite(e.target.value)} />
          <button type="submit" disabled={busy || !site.trim()} className="rounded-lg bg-brand-500 px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50" data-testid="try-card-create">
            {t('tryDemo.card.create')}
          </button>
        </form>
      )}
      {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
    </div>
  );
}
