import { FormEvent, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { httpTryPreview, TryPreview } from '../http';
import { useTranslation } from '../i18n/useTranslation';

// "Try on Website": the owner's own website with the App's live widget, under
// the App's header and tabs. The admin panel's pages may not frame other
// sites, so this tab frames our own /try/preview/<appId> page (served from
// try.html, which may), and that page frames the site. Private to the owner:
// no share link, no end date, no limits; its visitors are not counted.
export default function AppTryWebsite() {
  const { appId = '' } = useParams();
  const { t } = useTranslation();
  const [info, setInfo] = useState<TryPreview | null>(null);
  const [page, setPage] = useState('');
  const [draft, setDraft] = useState('');

  useEffect(() => {
    setInfo(null);
    setPage('');
    httpTryPreview(appId, { check: true })
      .then(({ data }) => {
        setInfo(data);
        setDraft(data.homeUrl || '');
      })
      .catch(() => setInfo({ available: false, appId }));
  }, [appId]);

  const src = `/try/preview/${encodeURIComponent(appId)}${page ? `?page=${encodeURIComponent(page)}` : ''}`;
  const go = (e: FormEvent) => {
    e.preventDefault();
    const value = draft.trim();
    setPage(value && value !== info?.homeUrl ? value : '');
  };

  if (!info) return <div className="h-full bg-white" />;
  if (!info.available) {
    return (
      <div className="p-4 text-sm text-gray-700" data-testid="try-website-unavailable">
        <p>{t('tryPreview.unavailable')}</p>
        <Link className="mt-2 inline-block text-brand-500 underline" to={`/app/admin/apps/${appId}/assistant#knows`}>
          {t('tryPreview.addWebsite')}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col" data-testid="try-website">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-gray-200 bg-gray-50 px-3 py-1.5 text-sm">
        <form className="flex min-w-0 flex-1 items-center gap-2" onSubmit={go}>
          <label className="sr-only" htmlFor="try-website-page">{t('tryPreview.pageLabel')}</label>
          <input
            id="try-website-page"
            className="min-w-0 flex-1 rounded border border-gray-300 bg-white px-2 py-1 font-mono text-xs"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            data-testid="try-website-page"
          />
          <button type="submit" className="shrink-0 rounded border border-gray-300 bg-white px-2 py-1 text-xs font-semibold" data-testid="try-website-go">
            {t('tryPreview.show')}
          </button>
        </form>
        <span className="flex shrink-0 items-center gap-x-3">
          <a className="text-brand-500 underline" href={src} target="_blank" rel="noopener" data-testid="try-website-open">
            {t('tryPreview.openNewTab')}
          </a>
          <Link className="text-brand-500 underline" to={`/app/admin/apps/${appId}/assistant#install`} data-testid="try-website-share">
            {t('tryPreview.share')}
          </Link>
        </span>
      </div>
      <iframe key={src} title={t('tryPreview.frameTitle').replace('{site}', info.site || '')} src={src} className="min-h-0 w-full flex-1 border-0" data-testid="try-website-frame" />
    </div>
  );
}
