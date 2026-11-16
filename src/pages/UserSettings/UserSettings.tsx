import { logoutService } from '@ethora/chat-component';
import { TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import cn from 'classnames';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { actionLogout } from '../../actions';
import TabApp from '../../components/TabApp';
import { logLogout } from '../../hooks/withTracking.tsx';
import { httpLogout } from '../../http';
import { useTranslation } from '../../i18n/useTranslation';
import { AiAssistants } from './AiAssistants';
import { Appearance } from './Appearance';
import { Documents } from './Documents';
import { PrivacyData } from './PrivacyData';
import { Security } from './Security';
// Referrals and BlockedUsers intentionally kept in source; their tabs are
// hidden for now. Blocked Users, once it has a real UI, belongs in Privacy &
// Data rather than on a tab of its own.
// import { Referrals } from './Referrals';
// import { BlockedUsers } from './BlockedUsers';

// `?tab=` values, in rail order. They are part of the URL, so treat them as
// stable identifiers: SECURITY_TAB_PATH (utils/finishLogin.ts) links here.
const tabs = [
  'Appearance',
  'Security',
  'AI Assistants',
  'Documents',
  'Privacy & Data',
];

// Tab names from before the Account page was regrouped, so old bookmarks and
// links still land on the tab that now holds that content. ('Visiblility' is
// the original misspelling, which was what the URL carried.)
const legacyTabs: Record<string, string> = {
  'Manage Data': 'Privacy & Data',
  Visiblility: 'Privacy & Data',
  Visibility: 'Privacy & Data',
  'Profile Shares': 'Privacy & Data',
  'Document Shares': 'Documents',
  'Blocked Users': 'Privacy & Data',
};

export default function UserSettings() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const rawTab = searchParams.get('tab') ?? '';
  const tabFromUrl = legacyTabs[rawTab] ?? rawTab;
  const initialTabIndex = tabs.includes(tabFromUrl)
    ? tabs.indexOf(tabFromUrl)
    : 0;

  const selectedIndex = initialTabIndex;
  const labels = [
    t('userSettingsPage.tabAppearance'), t('userSettingsPage.tabSecurity'),
    t('userSettingsPage.tabAiAssistants'), t('userSettingsPage.tabDocuments'),
    t('userSettingsPage.tabPrivacyData'),
  ];
  const selectTab = (index: number) => {
    setSearchParams((params) => {
      const next = new URLSearchParams(params);
      next.set('tab', tabs[index]);
      return next;
    });
  };

  const onLogout = async () => {
    try {
      await httpLogout();
    } catch {
      // ignore HTTP failures - the local-side cleanup below still needs to run
    }
    logLogout();
    actionLogout();
    logoutService.performLogout();
    document.cookie =
      'ethora_user=; domain=.ethora.com; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
    navigate('/login', { replace: true });
  };

  return (
    <div className="grid grid-rows-[auto,_1fr] gap-4 h-full min-h-0 min-w-0">
      <div className="md:px-8 hidden md:flex flex-col justify-between items-stretch md:items-center md:flex-row md:min-h-[40px]">
        <div className="font-varela mb-4 text-[24px] md:mb-0 md:text-[34px] leading-none">
          {t('userSettingsPage.heading')}
        </div>
      </div>
      <div className="rounded-2xl bg-white px-4 py-4 h-full min-h-0 min-w-0">
        <TabGroup
          className="grid h-full min-h-0 min-w-0 grid-rows-[auto,minmax(0,1fr)] gap-4 md:grid-rows-[minmax(0,1fr)] md:grid-cols-[minmax(160px,240px),minmax(0,1fr)]"
          selectedIndex={selectedIndex}
          onChange={selectTab}
        >
          <div className="flex min-w-0 items-center gap-3 border-b border-gray-200 pb-3 md:hidden">
            <div className="relative min-w-0 flex-1">
            <select aria-label={t('userSettingsPage.heading')} value={selectedIndex} onChange={(e) => selectTab(Number(e.target.value))}
              className="min-h-11 w-full appearance-none rounded-xl border border-gray-300 bg-gray-100 pl-3 pr-9 text-sm font-semibold text-gray-950">
              {labels.map((label, index) => <option key={tabs[index]} value={index}>{label}</option>)}
            </select>
            <svg aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-gray-600" fill="none" viewBox="0 0 16 16">
              <path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            </div>
            <button type="button" onClick={onLogout} className="min-h-11 shrink-0 rounded-xl px-3 text-sm font-semibold text-red-500">
              {t('userSettingsPage.logoutButton')}
            </button>
          </div>
          <div className="hidden min-h-0 md:flex md:flex-col md:border-r md:border-gray-200 md:pr-4">
            <TabList className="flex flex-row md:flex-col hide-scroll md:mb-0 border-b border-gray-200 md:border-b-0 overflow-auto md:flex-1">
              <TabApp text={t('userSettingsPage.tabAppearance')} />
              <TabApp text={t('userSettingsPage.tabSecurity')} />
              <TabApp text={t('userSettingsPage.tabAiAssistants')} />
              <TabApp text={t('userSettingsPage.tabDocuments')} />
              <TabApp text={t('userSettingsPage.tabPrivacyData')} />
            </TabList>
            {/* Logout sits where Referrals used to live (bottom of the left
                rail on desktop). Some users instinctively look for Logout on
                the Account page; Profile already has it but having it in
                both places keeps people from getting stuck. */}
            <button
              type="button"
              onClick={onLogout}
              className={cn(
                'md:mb-2 md:rounded-xl md:py-3 md:px-4 md:w-full md:text-left md:text-base',
                'md:text-red-400 md:hover:bg-red-50 md:dark:hover:bg-red-950/30',
                'py-[10px] px-[8px] text-red-400 whitespace-nowrap'
              )}
            >
              {t('userSettingsPage.logoutButton')}
            </button>
          </div>
          <TabPanels className="h-full min-h-0 min-w-0 overflow-hidden">
            <TabPanel key="Appearance" className="h-full overflow-auto">
              <Appearance />
            </TabPanel>
            <TabPanel key="Security" className="h-full overflow-auto">
              <Security />
            </TabPanel>
            <TabPanel key="AI Assistants" className="h-full overflow-auto">
              <AiAssistants />
            </TabPanel>
            <TabPanel key="Documents" className="h-full overflow-auto">
              <Documents />
            </TabPanel>
            <TabPanel key="Privacy & Data" className="h-full overflow-auto">
              <PrivacyData />
            </TabPanel>
          </TabPanels>
        </TabGroup>
      </div>
    </div>
  );
}
