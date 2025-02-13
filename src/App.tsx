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
      let res = hexToRgba(primaryColor);
      if (res) {
        let match = res.match(/\d+(\.\d+)?/g);
        if (match) {
          let arr = match.map(Number);
          let [r, g, b, a] = arr;
          r = Math.ceil(r * 0.8);
          g = Math.ceil(g * 0.8);
          b = Math.ceil(b * 0.8);
          let newColor = `rgba(${r},${g},${b},${a})`;
          console.log({ newColor });
          document.documentElement.style.setProperty(
            '--brand-darker',
            newColor
          );
        }
      }
    }
  }, [currentApp]);

  useEffect(() => {
    // alert("here ++")
    const example = async () => {
      if (token) {
        // sleep(1000)
        try {
          const { data } = await httpGetOneUser();
          await actionAfterLogin(data);
          // navigateToUserPage(navigate, currentApp?.afterLoginPage);
        } catch (e) {
          if (
            !location.pathname.startsWith('/tempPassword') ||
            !location.pathname.startsWith('/resetPassword')
          ) {
            navigate('/login');
          }
        }
      } else {
        if (
          location.pathname.startsWith('/tempPassword') ||
          location.pathname.startsWith('/resetPassword')
        ) {
          return;
        } else {
          navigate('/login');
        }
      }
    };

    example();
  }, []);

  if (!currentApp) {
    return <Loading></Loading>;
  } else {
    return <Outlet />;
  }
}

export default App;
