import { useEffect, useState } from 'react';
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useParams,
} from 'react-router-dom';
import { ThemeToggle } from '../components/ThemeToggle';
import { httpGetApp } from '../http';
import { useTranslation } from '../i18n/useTranslation';
import { useAppStore } from '../store/useAppStore';
import { isForbidden } from '../utils/accessError';
import { Error403Page } from './ErrorPage/Error403Page';
import { Error404Page } from './ErrorPage/Error404Page';

export default function AdminApp() {
  const { t } = useTranslation();
  const { appId } = useParams();
  const location = useLocation();
  const apps = useAppStore((s) => s.apps);
  const doSetApp = useAppStore((s) => s.doSetApp);
  const app = apps.find((app) => app._id === appId);
  const [loadError, setLoadError] = useState<'notFound' | 'forbidden' | null>(null);

  useEffect(() => {
    if (!appId) return;

    const getApp = async () => {
      try {
        setLoadError(null);
        const response = await httpGetApp(appId);
        doSetApp(response.data.result);
      } catch (e) {
        setLoadError(isForbidden(e) ? 'forbidden' : 'notFound');
        console.error(e);
      }
    };

    getApp();
  }, [appId, doSetApp]);

  if (loadError === 'forbidden') {
    return <Error403Page forApp navigateUrl="/app/admin/apps" />;
  }

  if (loadError) {
    return (
      <Error404Page navigateUrl={location.state?.from || '/app/admin/apps/'} />
    );
  }

  return (
    // overflow-hidden
    <div className="grid h-full min-h-0 grid-rows-[auto,_1fr] overflow-hidden rounded-2xl bg-white">
      <header className="min-w-0 border-b border-gray-200">
        <div className="flex items-center justify-between gap-4 px-6 pb-3 pt-5">
          <div className="min-w-0">
            <Link to="/app/admin/apps" className="text-sm font-medium text-brand-500 hover:underline">{t('nav.apps')}</Link>
            <h1 className="truncate font-varela text-2xl md:text-[32px]">{app?.displayName}</h1>
          </div>
          <ThemeToggle className="hidden md:flex" />
        </div>
        <nav aria-label={t('projectOverview.navigation')} className="flex w-full gap-2 overflow-x-auto px-4">
          {[
            { path: '', label: t('projectOverview.tab'), end: true },
            { path: '/assistant', label: t('projectOverview.assistant'), end: false },
            { path: '/widget', label: t('projectOverview.widgetTab'), end: false },
            { path: '/users', label: t('projectOverview.people'), end: false },
            { path: '/statistics', label: t('projectOverview.activity'), end: false },
            { path: '/settings', label: t('adminApp.tabSettings'), end: false },
          ].map(({ path, label, end }) => (
            <NavLink key={path} to={`/app/admin/apps/${appId}${path}`} end={end}
              className={({ isActive }) => `min-h-11 shrink-0 rounded-t-lg border-b-[3px] px-4 py-3 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 ${isActive ? 'border-brand-500 bg-brand-50 text-brand-500' : 'border-transparent text-gray-800 hover:bg-gray-100 hover:text-brand-500'}`}>
              {label}
            </NavLink>
          ))}
        </nav>
      </header>
      {/* overflow-hidden */}
      <div className="min-h-0 p-4">
        <Outlet />
      </div>
    </div>
  );
}
