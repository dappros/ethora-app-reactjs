import { Suspense, useEffect, useState } from 'react';
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useParams,
} from 'react-router-dom';
import { ThemeToggle } from '../components/ThemeToggle';
import { PanelSkeleton } from '../components/PanelSkeleton';
import { httpGetApp } from '../http';
import { useTranslation } from '../i18n/useTranslation';
import { useAppStore } from '../store/useAppStore';
import { isForbidden } from '../utils/accessError';
import { saveRecentProjectPage, type ProjectSection } from '../utils/projectRecentPage';
import { Error403Page } from './ErrorPage/Error403Page';
import { Error404Page } from './ErrorPage/Error404Page';

const projectTabClass = (active: boolean) => `min-h-11 shrink-0 rounded-lg px-4 py-3 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-500 ${active ? 'bg-brand-50 text-brand-500' : 'text-gray-800 hover:bg-gray-100 hover:text-brand-500'}`;

export default function AdminApp() {
  const { t } = useTranslation();
  const { appId } = useParams();
  const location = useLocation();
  const apps = useAppStore((s) => s.apps);
  const doSetApp = useAppStore((s) => s.doSetApp);
  const app = apps.find((app) => app._id === appId);
  const assistantAreaActive = location.pathname === `/app/admin/apps/${appId}/assistant` || location.pathname === `/app/admin/apps/${appId}/widget`;
  const [loadError, setLoadError] = useState<{ appId: string; reason: 'notFound' | 'forbidden' } | null>(null);

  useEffect(() => {
    if (!appId) return;
    let cancelled = false;

    const getApp = async () => {
      try {
        setLoadError(null);
        const response = await httpGetApp(appId);
        if (!cancelled) doSetApp(response.data.result);
      } catch (e) {
        if (!cancelled) {
          setLoadError({ appId, reason: isForbidden(e) ? 'forbidden' : 'notFound' });
          console.error(e);
        }
      }
    };

    void getApp();
    return () => { cancelled = true; };
  }, [appId, doSetApp]);

  useEffect(() => {
    if (!appId) return;
    const prefix = `/app/admin/apps/${appId}/`;
    if (!location.pathname.startsWith(prefix)) return;
    const section = location.pathname.slice(prefix.length);
    if (['assistant', 'widget', 'users', 'statistics', 'settings'].includes(section)) {
      saveRecentProjectPage(appId, section as ProjectSection, location.search);
    }
  }, [appId, location.pathname, location.search]);

  const currentLoadError = loadError && loadError.appId === appId ? loadError.reason : null;
  if (currentLoadError === 'forbidden') {
    return <Error403Page forApp navigateUrl="/app/admin/apps" />;
  }

  if (currentLoadError) {
    return (
      <Error404Page navigateUrl={location.state?.from || '/app/admin/apps/'} />
    );
  }

  return (
    <div className="grid h-full min-h-0 grid-rows-[auto,_1fr] overflow-hidden rounded-2xl bg-white">
      <header className="min-w-0 border-b border-gray-200">
        <div className="flex items-center justify-between gap-4 px-6 pb-3 pt-5">
          <div className="flex min-w-0 items-center gap-3">
            <Link to="/app/admin/apps" className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-lg px-2 text-sm font-semibold text-brand-500 hover:bg-brand-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500">
              <span aria-hidden="true">←</span>{t('nav.apps')}
            </Link>
            <span aria-hidden="true" className="h-6 w-px shrink-0 bg-gray-300" />
            <h1 className="min-w-0 truncate font-varela text-2xl md:text-[32px]">
              {app?.displayName || <span aria-hidden="true" className="inline-block h-7 w-36 animate-pulse rounded-md bg-gray-200 align-middle md:h-9" />}
            </h1>
          </div>
          <ThemeToggle className="hidden md:flex" />
        </div>
        <nav aria-label={t('projectOverview.navigation')} className="flex w-full gap-2 overflow-x-auto px-4 py-2">
          {[
            { path: '', label: t('projectOverview.tab'), end: true },
            { path: '/assistant', label: t('projectOverview.assistantWidget'), end: false },
            { path: '/users', label: t('projectOverview.people'), end: false },
            { path: '/statistics', label: t('projectOverview.activity'), end: false },
            { path: '/settings', label: t('adminApp.tabSettings'), end: false },
          ].map(({ path, label, end }) => path === '/assistant' ? (
            <Link key={path} to={`/app/admin/apps/${appId}/assistant`} aria-current={assistantAreaActive ? 'page' : undefined} className={projectTabClass(assistantAreaActive)}>{label}</Link>
          ) : (
            <NavLink key={path} to={`/app/admin/apps/${appId}${path}`} end={end} className={({ isActive }) => projectTabClass(isActive)}>{label}</NavLink>
          ))}
        </nav>
      </header>
      <div data-testid="project-content-scroll" className="min-h-0 overflow-y-auto p-4">
        <Suspense fallback={<PanelSkeleton label={t('projectOverview.loading')} />}>
          <Outlet />
        </Suspense>
      </div>
    </div>
  );
}
