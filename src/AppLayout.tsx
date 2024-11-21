import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AppMenu } from './components/AppMenu';
import { useAppStore } from './store/useAppStore';
import { useEffect } from 'react';
import { httpGetOneUser } from './http';
import { actionAfterLogin } from './actions';

export default function AppLayout() {
  const user = useAppStore((s) => s.currentUser);
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');

  useEffect(() => {
    localStorage.setItem("lastPath", location.pathname);
  }, [location]);

  useEffect(() => {
    const example = async () => {
      if(token) {
        const response = await httpGetOneUser();
        if(response.status === 200) {
          localStorage.setItem('token', response.data.token);
          await actionAfterLogin(response.data);
          const savedPath = localStorage.getItem("lastPath");
          if (savedPath) {
            navigate(savedPath);
          } else {
            navigate('/app/admin/apps');
          }
        }
      }
    };

    example();
  }, []);


  if (!user) {
    return <Navigate to="/login" replace></Navigate>;
  } else {
    return (
      <div className="bg-gray-100 w-full min-h-screen flex justify-center">
        <div className="min-h-screen max-w-[1920px] w-full md:p-4">
          {/* app content */}
          <div className="h-full overflow-hidden grid grid-rows-[72px,_1fr] md:grid-rows-1 md:grid-cols-[80px,_1fr] md:gap-4">
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
}
