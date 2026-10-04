import { Suspense } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { AppMenu } from './components/AppMenu';
import { LicenseBanner } from './components/LicenseBanner';
import { Loading } from './components/Loading';
import { useAppStore } from './store/useAppStore';

export default function AppLayout() {
  const location = useLocation();
  const user = useAppStore((s) => s.currentUser);

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
    return <Navigate to="/login" replace />;
  }

  if (location.pathname !== '/login') {
    localStorage.setItem('lastPath', location.pathname + location.search);
  }

  return (
    <Suspense fallback={null}>
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
                <Outlet />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Suspense>
  );
}
