import { logoutService } from '@ethora/chat-component';
import { TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import cn from 'classnames';
import { useEffect, useState } from 'react';
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
  'Privacy & Data',
  'Documents',
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

  const [selectedIndex, setSelectedIndex] = useState(initialTabIndex);

  useEffect(() => {
    setSearchParams((params) => {
      params.set('tab', tabs[selectedIndex]);
      return params;
    });
  }, [selectedIndex, setSearchParams]);

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
    <div className="grid grid-rows-[auto,_1fr] gap-4 h-full">
      <div className="md:px-8 hidden md:flex flex-col justify-between items-stretch md:items-center md:flex-row md:min-h-[40px]">
        <div className="font-varela mb-4 text-[24px] md:mb-0 md:text-[34px] leading-none">
          {t('userSettingsPage.heading')}
        </div>
      </div>
      <div className="rounded-2xl bg-white px-4 py-4 h-full">
        <TabGroup
          className="grid here h-full overflow-hidden grid-rows-[46px,_1fr] gap-y-[16px] md:grid-rows-1 md:grid-cols-[308px,_1fr]"
          selectedIndex={selectedIndex}
          onChange={setSelectedIndex}
        >
          <div className="flex flex-row md:flex-col md:h-full md:border-r md:border-gray-200 md:pr-4">
            <TabList className="flex flex-row md:flex-col hide-scroll md:mb-0 border-b border-gray-200 md:border-b-0 overflow-auto md:flex-1">
              <TabApp text={t('userSettingsPage.tabAppearance')} />
              <TabApp text={t('userSettingsPage.tabSecurity')} />
              <TabApp text={t('userSettingsPage.tabAiAssistants')} />
              <TabApp text={t('userSettingsPage.tabPrivacyData')} />
              <TabApp text={t('userSettingsPage.tabDocuments')} />
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
          <TabPanels className="h-full overflow-hidden">
            <TabPanel key="Appearance" className="h-full overflow-auto">
              <Appearance />
            </TabPanel>
            <TabPanel key="Security" className="h-full overflow-auto">
              <Security />
            </TabPanel>
            <TabPanel key="AI Assistants" className="h-full overflow-auto">
              <AiAssistants />
            </TabPanel>
            <TabPanel key="Privacy & Data" className="h-full overflow-auto">
              <PrivacyData />
            </TabPanel>
            <TabPanel key="Documents" className="h-full overflow-auto">
              <Documents />
            </TabPanel>
          </TabPanels>
        </TabGroup>
      </div>
    </div>
  );
}
