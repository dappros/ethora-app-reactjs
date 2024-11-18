import { Navigate, Outlet } from 'react-router-dom';
import { AppMenu } from './components/AppMenu';
import { useAppStore } from './store/useAppStore';

export default function AppLayout() {
  const user = useAppStore((s) => s.currentUser);

  if (!user) {
    return <Navigate to="/login"></Navigate>;
  }

  return (
    <div className="bg-gray-100 w-full min-h-screen flex justify-center">
      <div className="min-h-screen max-w-[1920px] w-full md:p-4">
        {/* app content */}
        <div className="h-full grid grid-rows-[72px,_1fr] md:grid-rows-1 md:grid-cols-[80px,_1fr] md:gap-4">
          {/* menu */}
          <AppMenu />
          {/* router content */}
          <div className="h-full p-4 md:p-0">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}