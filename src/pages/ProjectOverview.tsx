import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import HistoryIcon from '@mui/icons-material/History';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import WidgetsOutlinedIcon from '@mui/icons-material/WidgetsOutlined';
import { Link, useParams } from 'react-router-dom';
import { PanelSkeleton } from '../components/PanelSkeleton';
import { useTranslation } from '../i18n/useTranslation';
import { useAppStore } from '../store/useAppStore';
import { readRecentProjectPage, recentProjectUrl } from '../utils/projectRecentPage';

const cardClass = 'flex min-h-[228px] flex-col rounded-2xl border border-gray-200 bg-white p-5 md:p-6';
const iconClass = 'flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-500';
const buttonClass = 'inline-flex min-h-11 items-center justify-center rounded-xl px-5 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500';

export default function ProjectOverview() {
  const { appId } = useParams();
  const { t } = useTranslation();
  const app = useAppStore((state) => state.apps.find((item) => item._id === appId));
  if (!app) return <PanelSkeleton label={t('projectOverview.loading')} />;

  const base = `/app/admin/apps/${app._id}`;
  const recent = readRecentProjectPage(app._id);
  const settingsTab = recent?.section === 'settings' ? new URLSearchParams(recent.search).get('tab') : null;
  const recentLabel = settingsTab === 'Mobile App'
    ? t('appSettings.tab.mobileApp')
    : settingsTab === 'Chats' ? t('projectOverview.chatSettings')
    : recent ? t({
      assistant: 'projectOverview.assistant',
      widget: 'projectOverview.widget',
      users: 'projectOverview.people',
      statistics: 'projectOverview.activity',
      settings: 'adminApp.tabSettings',
    }[recent.section]) : '';

  return <main className="mx-auto max-w-7xl p-2 md:p-6">
    <div className="mb-6">
      <h1 className="text-2xl font-semibold">{t('projectOverview.title')}</h1>
      <p className="mt-2 text-sm text-gray-700">{t('projectOverview.chooseDirection')}</p>
    </div>
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <section className={`${cardClass} border-brand-200 bg-brand-50`} aria-label={recent ? t('projectOverview.continue') : t('projectOverview.assistant')}>
        <span className={iconClass}>{recent ? <HistoryIcon fontSize="small" /> : <SmartToyOutlinedIcon fontSize="small" />}</span>
        <h2 className="mt-5 text-lg font-semibold">{recent ? t('projectOverview.continue') : t('projectOverview.assistant')}</h2>
        <p className="mt-2 flex-1 text-sm leading-6 text-gray-700">
          {recent ? t('projectOverview.continueText').replace('{section}', recentLabel) : t('projectOverview.assistantSetupText')}
        </p>
        <div className="mt-5">
          <Link to={recent ? recentProjectUrl(app._id, recent) : `${base}/assistant`} className={`${buttonClass} bg-brand-500 text-white hover:bg-brand-darker`}>{t(recent ? 'projectOverview.continue' : 'projectOverview.configureAssistant')} →</Link>
        </div>
      </section>

      <section className={cardClass} aria-label={t('projectOverview.chat')}>
        <span className={iconClass}><ChatBubbleOutlineIcon fontSize="small" /></span>
        <h2 className="mt-5 text-lg font-semibold">{t('projectOverview.chat')}</h2>
        <p className="mt-2 flex-1 text-sm leading-6 text-gray-700">{t('projectOverview.chatDirectionText')}</p>
        <div className="mt-5">
          <Link to={`${base}/settings?tab=Chats`} className={`${buttonClass} border border-gray-300 text-gray-900 hover:bg-gray-100`}>{t('projectOverview.openChatSettings')} →</Link>
        </div>
      </section>

      <section className={cardClass} aria-label={t('appSettings.tab.mobileApp')}>
        <span className={iconClass}><PhoneIphoneIcon fontSize="small" /></span>
        <h2 className="mt-5 text-lg font-semibold">{t('appSettings.tab.mobileApp')}</h2>
        <p className="mt-2 flex-1 text-sm leading-6 text-gray-700">{t('projectOverview.mobileDirectionText')}</p>
        <div className="mt-5">
          <Link to={`${base}/settings?tab=Mobile+App`} className={`${buttonClass} border border-gray-300 text-gray-900 hover:bg-gray-100`}>{t('projectOverview.openMobile')} →</Link>
        </div>
      </section>

      <section className={cardClass} aria-label={t('projectOverview.widget')}>
        <span className={iconClass}><WidgetsOutlinedIcon fontSize="small" /></span>
        <h2 className="mt-5 text-lg font-semibold">{t('projectOverview.widget')}</h2>
        <p className="mt-2 flex-1 text-sm leading-6 text-gray-700">{t('projectOverview.widgetDirectionText')}</p>
        <div className="mt-5">
          <Link to={`${base}/widget`} className={`${buttonClass} border border-gray-300 text-gray-900 hover:bg-gray-100`}>{t('projectOverview.openWidget')} →</Link>
        </div>
      </section>
    </div>
  </main>;
}
