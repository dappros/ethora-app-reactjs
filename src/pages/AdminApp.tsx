import { Suspense, useCallback, useEffect, useState } from 'react';
import {
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom';
import { IconArrowLeft } from '../components/Icons/IconArrowLeft';
import { PanelSkeleton } from '../components/PanelSkeleton';
import { appGoal } from '../utils/appGoal';
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
  const navigate = useNavigate();
  const [loadError, setLoadError] = useState<'notFound' | 'forbidden' | null>(null);

  const goBack = useCallback(() => {
    const backUrl = location.state?.from;
    navigate(backUrl || '/app/admin/apps');
  }, [location.state?.from, navigate]);

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

  // On a phone the tab row scrolls sideways: keep the active tab in view.
  useEffect(() => {
    document.querySelector('[data-app-tabs] a[aria-current="page"]')?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [location.pathname]);

  if (loadError === 'forbidden') {
    return <Error403Page forApp navigateUrl="/app/admin/apps" />;
  }

  if (loadError) {
    return (
      <Error404Page navigateUrl={location.state?.from || '/app/admin/apps/'} />
    );
  }

  const goal = appGoal(app);
  const installed = Boolean(app?.milestones?.widget_installed?.firstAt);
  const onTestPage = !installed && Boolean(app?.milestones?.widget_test_page?.firstAt);
  const showWebsiteStatus = goal === 'website';
  const base = `/app/admin/apps/${appId}`;
  const tabClass = ({ isActive }: { isActive: boolean }) =>
    `shrink-0 whitespace-nowrap rounded-t-lg px-3 py-2 text-sm font-semibold ${isActive ? 'bg-brand-50 text-brand-600 shadow-[inset_0_-2px_0] shadow-brand-500' : 'text-gray-600 hover:text-gray-900'}`;
  const tabs: { to: string; label: string; end?: boolean }[] = [
    { to: base, label: t('appTabs.home'), end: true },
    { to: `${base}/assistant`, label: t('appTabs.assistant') },
    { to: `${base}/conversations`, label: t('appTabs.conversations') },
    { to: `${base}/users`, label: t('adminApp.tabUsers') },
    { to: `${base}/statistics`, label: t('adminApp.tabStatistics') },
    { to: `${base}/moderation`, label: t('trustSafetyModeration.tab') },
    { to: `${base}/settings`, label: t('adminApp.tabSettings') },
    { to: `${base}/chats`, label: t('appTabs.testChats') },
  ];
  // The chat fills the height under the header; every other tab scrolls
  // with the page.
  const isChats = /\/chats\/?$/.test(location.pathname);

  return (
    // grid-cols minmax(0,1fr) + min-w-0: the tab row scrolls sideways on a
    // phone instead of widening the whole page.
    <div className={`h-full min-w-0 grid grid-cols-[minmax(0,1fr)] ${isChats ? 'grid-rows-[auto,_minmax(0,1fr)]' : 'grid-rows-[auto,_1fr]'}`}>
      <div className="mb-3 px-4 pt-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <nav aria-label={t('appTabs.breadcrumb')} className="flex items-center gap-1 text-sm text-gray-600">
              <button type="button" className="flex items-center gap-1 text-brand-500 hover:underline" onClick={goBack}>
                <IconArrowLeft />
                {t('appTabs.apps')}
              </button>
              <span aria-hidden="true">/</span>
              <span className="truncate">{app?.displayName}</span>
            </nav>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <h1 className="font-varela text-[24px] md:text-[30px] truncate">{app?.displayName}</h1>
              {app && showWebsiteStatus && (
                <span
                  data-testid="app-status-pill"
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${installed || onTestPage ? 'bg-green-100 text-green-800 dark:bg-green-950/70 dark:text-green-300' : 'bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-200'}`}
                >
                  {installed ? t('appTabs.live') : onTestPage ? t('appTabs.testPage') : t('appTabs.notLive')}
                </span>
              )}
            </div>
          </div>
          <ThemeToggle className="hidden md:flex" />
        </div>
        <nav data-app-tabs aria-label={t('appTabs.navigation')} className="mt-3 flex gap-1 overflow-x-auto border-b border-gray-200 hide-scroll">
          {tabs.map((tab) => (
            <NavLink key={tab.to} to={tab.to} end={tab.end} className={tabClass}>
              {tab.label}
            </NavLink>
          ))}
        </nav>
      </div>
      {/* No overflow here: the page scrolls in AdminLayout, which keeps the
          AI assistant's test column sticky. */}
      <div className={isChats ? 'min-h-0 overflow-hidden bg-white md:rounded-2xl' : 'bg-white rounded-2xl p-4'}>
        <Suspense fallback={<PanelSkeleton label={t('appBootstrap.loadingPage')} />}>
          <Outlet />
        </Suspense>
      </div>
    </div>
  );
}
