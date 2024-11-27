import hexToRgba from 'hex-to-rgba';
import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { actionAfterLogin, actionGetConfig } from './actions';
import { Loading } from './components/Loading';
import { httpGetOneUser } from './http';
import { useAppStore } from './store/useAppStore';
import { sleep } from './utils/sleep';

export function Fallback() {
  return <p>Performing initial data load</p>;
}

function App() {
  const navigate = useNavigate();
  const currentApp = useAppStore((s) => s.currentApp);
  const token = localStorage.getItem('token-538');

  useEffect(() => {
    actionGetConfig(import.meta.env.VITE_DOMAIN_NAME);
  }, []);

  useEffect(() => {
    if (currentApp) {
      const primaryColor = currentApp.primaryColor;
      document.documentElement.style.setProperty(
        '--bg-brand-primary',
        primaryColor
      );
      document.documentElement.style.setProperty(
        '--bg-auth-background',
        hexToRgba(primaryColor, '0.05')
      );
    }
  }, [currentApp]);

  useEffect(() => {
    // alert("here ++")
    const example = async () => {
      if (token) {
        sleep(1000)
        const response = await httpGetOneUser();
        if (response.status === 200) {

          await actionAfterLogin(response.data);

          const savedPath = localStorage.getItem('lastPath');
          if (savedPath) {
            navigate(savedPath);
          } else {
            navigate('/app/admin/apps');
          }
        }
      } else {
        if (!location.pathname.startsWith('/tempPassword') || !location.pathname.startsWith('/resetPassword')) {
          navigate('/login');
        }
      }
    };

    example();
  }, []);

  if (!currentApp) {
    return <Loading></Loading>;
  } else {
    return (
      <Outlet />
    );
  }
}

export default App;
