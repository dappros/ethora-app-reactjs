import { useEffect } from 'react';
import { env } from '../../config/env';
import { useTranslation } from '../../i18n/useTranslation';
import { resolveWidgetUrl } from '../../utils/widgetUrl';

type Props = {
  appId: string;
  site: string;
  url: string;
  frameable: boolean | null | undefined;
  screenshotUrl?: string;
};

// The named website with the App's live assistant widget on top: in a frame
// when the site allows it, else a full-page picture, else "Preparing". Used
// by the public share page (/try/<site>/<token>) and the owner's preview
// (/try/preview/<appId>, framed by the App's "Try on Website" tab). Nothing
// of the site is copied or served from here: a frame or a picture. The frame
// cannot navigate this page away (no allow-top-navigation) and gets no
// referrer.
export function TrySiteView({ appId, site, url, frameable, screenshotUrl }: Props) {
  const { t } = useTranslation();

  // The App's live assistant widget, the same script operators embed.
  useEffect(() => {
    if (!appId) return;
    const s = document.createElement('script');
    s.src = resolveWidgetUrl();
    s.id = 'chat-content-assistant';
    s.async = true;
    s.setAttribute('data-app-id', appId);
    if (env.VITE_API) s.setAttribute('data-api-base', env.VITE_API as string);
    document.body.appendChild(s);
    return () => {
      s.remove();
      document.getElementById('chat-widget')?.remove();
    };
  }, [appId]);

  return (
    <div className="relative min-h-0 flex-1">
      {frameable ? (
        <iframe
          key={url}
          title={site}
          src={url}
          className="h-full w-full border-0"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
          referrerPolicy="no-referrer"
          data-testid="try-frame"
        />
      ) : screenshotUrl ? (
        <div className="h-full overflow-y-auto bg-gray-100" data-testid="try-picture">
          <p className="bg-amber-50 px-3 py-1 text-xs text-amber-900">{t('tryDemo.pictureNote').replace('{site}', site)}</p>
          <img src={screenshotUrl} alt={site} className="mx-auto block w-full max-w-[1280px]" referrerPolicy="no-referrer" />
        </div>
      ) : (
        <div className="flex h-full items-center justify-center text-sm text-gray-600" data-testid="try-preparing">
          {t('tryDemo.preparing').replace('{site}', site)}
        </div>
      )}
    </div>
  );
}
