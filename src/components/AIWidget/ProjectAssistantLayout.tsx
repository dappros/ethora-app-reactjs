import { Suspense, useLayoutEffect, useRef } from 'react';
import { NavLink, Outlet, useLocation, useParams } from 'react-router-dom';
import { useTranslation } from '../../i18n/useTranslation';
import { PanelSkeleton } from '../PanelSkeleton';

export function ProjectAssistantLayout() {
  const { appId } = useParams();
  const { pathname } = useLocation();
  const { t } = useTranslation();
  const panel = useRef<HTMLDivElement>(null);
  const basePath = `/app/admin/apps/${appId}`;
  const linkClass = (active: boolean) => `inline-flex min-h-10 items-center rounded-lg px-4 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 ${active ? 'bg-white text-brand-500 shadow-sm' : 'text-gray-700 hover:bg-white hover:text-brand-500'}`;

  useLayoutEffect(() => {
    // The two editors have different heights. Start each at its own top.
    if (panel.current) panel.current.scrollTop = 0;
  }, [pathname]);

  return (
    <div className="grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)] gap-4 p-2 md:p-4">
      <header className="min-w-0 space-y-4">
        <div>
          <h2 className="text-2xl font-semibold">{t('projectOverview.assistantWidget')}</h2>
          <p className="mt-2 text-sm text-gray-600">{t('projectOverview.assistantWidgetText')}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <nav aria-label={t('projectOverview.assistantWidgetNav')} className="inline-flex max-w-full flex-wrap gap-1 rounded-xl border border-gray-200 bg-gray-50 p-1">
            <NavLink to={`${basePath}/assistant`} end className={({ isActive }) => linkClass(isActive)}>{t('projectOverview.setUpAssistant')}</NavLink>
            <NavLink to={`${basePath}/widget`} end className={({ isActive }) => linkClass(isActive)}>{t('projectOverview.widget')}</NavLink>
          </nav>
        </div>
      </header>
      <div ref={panel} data-testid="assistant-panel-scroll" className="min-w-0 overflow-y-auto [overflow-anchor:none] [scrollbar-gutter:stable]">
        <Suspense fallback={<PanelSkeleton label={t('projectOverview.loading')} />}>
          <Outlet />
        </Suspense>
      </div>
    </div>
  );
}
