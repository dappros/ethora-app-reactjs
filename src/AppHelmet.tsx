import { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Outlet, useNavigate } from 'react-router-dom';
import { ModelApp } from './models';
import { useAppStore } from './store/useAppStore';

export default function AppHelmet() {
  const currentApp = useAppStore((s) => s.currentApp as ModelApp);
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/login');
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
