import hexToRgba from 'hex-to-rgba';
import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { actionAfterLogin, actionGetConfig } from './actions';
import { Loading } from './components/Loading';
import { httpGetOneUser } from './http';
import { useAppStore } from './store/useAppStore';

export function Fallback() {
  return <p>Performing initial data load</p>;
}

function App() {
  const navigate = useNavigate();
  const currentApp = useAppStore((s) => s.currentApp);
  const token = localStorage.getItem('token');


  console.log("location ", location)

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
    const example = async () => {
      if (token) {
        const response = await httpGetOneUser();
        if (response.status === 200) {
          localStorage.setItem('token', response.data.token);
          sessionStorage.setItem('refreshToken', response.data.refreshToken);
          await actionAfterLogin(response.data);

          const savedPath = localStorage.getItem('lastPath');
          if (savedPath) {
            navigate(savedPath);
          } else {
            navigate('/app/admin/apps/list');
          }
        }
      } else {
        navigate('/login');
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
