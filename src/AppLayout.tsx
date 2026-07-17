import { Suspense } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { AppMenu } from './components/AppMenu';
import { useAppStore } from './store/useAppStore';

export default function AppLayout() {
  const location = useLocation();
  const user = useAppStore((s) => s.currentUser);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (location.pathname !== '/login') {
    localStorage.setItem('lastPath', location.pathname + location.search);
  }

  return (
    <Suspense fallback={null}>
      <div className="bg-gray-100 w-full flex justify-center">
        <div className="h-screen max-w-[1920px] w-full md:p-4">
          {/* app content */}
          <div className="h-full grid grid-rows-[72px,_1fr] md:grid-rows-1 md:grid-cols-[96px,_1fr] md:gap-4">
            {/* menu */}
            <div className="h-full overflow-hidden">
              <AppMenu />
            </div>
            {/* router content — edge-to-edge on mobile (no grey inset between
                the top bar and the chat panel); padded card on desktop. */}
            <div className="min-h-[calc(100vh-72px)] md:p-0">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </Suspense>
  );
}
