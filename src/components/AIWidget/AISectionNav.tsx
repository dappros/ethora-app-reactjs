import { NavLink } from 'react-router-dom';
import { useTranslation } from '../../i18n/useTranslation';

/** Page navigation for the shared AI area, on desktop and mobile. */
export function AISectionNav() {
  const { t } = useTranslation();
  const linkClass = 'rounded-lg px-4 py-2 text-center text-sm font-semibold text-gray-600 hover:bg-gray-100 aria-[current=page]:bg-brand-100 aria-[current=page]:text-brand-500';
  return <nav aria-label={t('aiNavigation.sections')} className="inline-grid grid-cols-2 gap-1 rounded-xl border border-gray-200 bg-white p-1">
    <NavLink to="/app/admin/agents" className={linkClass}>{t('nav.agents')}</NavLink>
    <NavLink to="/app/admin/widgets" className={linkClass}>{t('widgets.title')}</NavLink>
  </nav>;
}
