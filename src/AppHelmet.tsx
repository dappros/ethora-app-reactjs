import { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ModelApp } from './models';
import { useAppStore } from './store/useAppStore';

export default function AppHelmet() {
  const currentApp = useAppStore((s) => s.currentApp as ModelApp);
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token-538');

  useEffect(() => {
      if (!token ) {
        if (location.pathname.startsWith('/tempPassword') || location.pathname.startsWith('/resetPassword')) {
          return
        } else {
          navigate('/login');
        }
      }
  }, []);

  return (
    <>
      <Helmet>
        <title>{currentApp.displayName || 'Dappros Platform'}</title>
        <meta
          property="og:title"
          content={currentApp.displayName || 'Dappros Platform'}
        />
      </Helmet>
      <Outlet />
    </>
  );
}
