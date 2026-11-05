import { Suspense } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { AppMenu } from './components/AppMenu';
import { LicenseBanner } from './components/LicenseBanner';
import { Loading } from './components/Loading';
import { PanelSkeleton } from './components/PanelSkeleton';
import { useTranslation } from './i18n/useTranslation';
import { useAppStore } from './store/useAppStore';
import { isReturnablePath, rememberReturnPath, signedOutEntryPath } from './utils/returnPath';

export default function AppLayout() {
  const location = useLocation();
  const user = useAppStore((s) => s.currentUser);
  const { t } = useTranslation();

  if (!user) {
    // On a reload the app config and the session restore (useTrackUrl's
    // GET /users/me) resolve within a few ms of each other, so this layout
    // can render before the user is back in the store. With a stored token
    // that is a session being restored, not a signed-out visitor: show the
    // loader and let the restore finish. A dead token is cleared by
    // useTrackUrl on the 401, which lands here again and redirects.
    let hasToken = false;
    try {
      const token = localStorage.getItem('token-538');
      hasToken = Boolean(token && token !== 'undefined');
    } catch {
      hasToken = false;
    }
    if (hasToken) {
      return <Loading />;
    }
    // A scheduled-call join link opened signed out: park it so the login
    // sends the user back here (see utils/returnPath.ts).
    rememberReturnPath(location.pathname + location.search);
    return <Navigate to={signedOutEntryPath(location.pathname)} replace />;
  }

  // A join link is a one-off destination, not "where the user last was":
  // remembering it would send every later visit to / back into that call.
  if (location.pathname !== '/login' && !isReturnablePath(location.pathname)) {
    localStorage.setItem('lastPath', location.pathname + location.search);
  }

  return (
    <div className="bg-page w-full flex justify-center">
      <div className="h-screen max-w-[1920px] w-full md:p-4">
        {/* app content */}
        <div className="h-full grid grid-rows-[72px,_1fr] md:grid-rows-1 md:grid-cols-[96px,_1fr] md:gap-4">
          {/* menu */}
          <div className="h-full overflow-hidden">
            <AppMenu />
          </div>
          {/* router content — edge-to-edge on mobile (no grey inset between
              the top bar and the chat panel); padded card on desktop. */}
          <div className="min-h-[calc(100vh-72px)] md:p-0 flex flex-col">
            <LicenseBanner />
            <div className="flex-1 min-h-0">
              <Suspense fallback={<div className="h-full rounded-2xl bg-white p-4 md:p-6"><PanelSkeleton label={t('projectOverview.loading')} /></div>}>
                <Outlet />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
