import { Suspense, useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { AppMenu } from './components/AppMenu';
import { useAppStore } from './store/useAppStore';

export default function AppLayout() {
  const user = useAppStore((s) => s.currentUser);
  const location = useLocation();
  
  const [redirectPath, setRedirectPath] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('lastPath', location.pathname);
  }, [location.pathname]);

  useEffect(() => {
    const lastPath = localStorage.getItem('lastPath');
    if (lastPath && lastPath !== location.pathname) {
      setRedirectPath(lastPath);
    }
  }, []);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (redirectPath) {
    const path = redirectPath;
    setRedirectPath(null);
    return <Navigate to={path} replace />;
  }

  return (
    <Suspense fallback={null}>
      <div className="bg-gray-100 w-full flex justify-center">
        <div className="h-screen max-w-[1920px] w-full md:p-4">
          {/* app content */}
          <div className="h-full grid grid-rows-[72px,_1fr] md:grid-rows-1 md:grid-cols-[80px,_1fr] md:gap-4">
            {/* menu */}
            <div className="h-full overflow-hidden">
              <AppMenu />
            </div>
           {/* router content */}
            <div className="p-4 min-h-[calc(100vh-72px)] md:p-0">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </Suspense>
 );
}
