import { NavLink } from 'react-router-dom';
import { useTranslation } from '../../i18n/useTranslation';

export function ProjectAssistantNav({ appId }: { appId: string }) {
  const { t } = useTranslation();
  const linkClass = (active: boolean) => `inline-flex min-h-10 items-center rounded-lg px-4 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 ${active ? 'bg-white text-brand-500 shadow-sm' : 'text-gray-700 hover:bg-white hover:text-brand-500'}`;

  return (
    <nav aria-label={t('projectOverview.assistantWidgetNav')} className="inline-flex max-w-full gap-1 rounded-xl border border-gray-200 bg-gray-50 p-1">
      <NavLink to={`/app/admin/apps/${appId}/assistant`} end className={({ isActive }) => linkClass(isActive)}>{t('projectOverview.setUpAssistant')}</NavLink>
      <NavLink to={`/app/admin/apps/${appId}/widget`} end className={({ isActive }) => linkClass(isActive)}>{t('projectOverview.widget')}</NavLink>
    </nav>
  );
}
