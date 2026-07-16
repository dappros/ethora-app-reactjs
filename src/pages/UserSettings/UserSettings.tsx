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
import { DocumentShares } from './DocumentShares';
import { ManageData } from './ManageData';
import { ProfileShares } from './ProfileShares';
// Referrals intentionally kept in source; the tab is hidden for now but
// the page may be re-enabled later.
// import { Referrals } from './Referrals';
import { Visibility } from './Visibility';

const tabs = [
  'Manage Data',
  'Visiblility',
  'Profile Shares',
  'Document Shares',
  'Blocked Users',
];

export default function UserSettings() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const tabFromUrl = searchParams.get('tab');
  const initialTabIndex = tabs.includes(tabFromUrl ?? '')
    ? tabs.indexOf(tabFromUrl!)
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
              <TabApp text={t('userSettingsPage.tabManageData')} />
              <TabApp text={t('userSettingsPage.tabVisibility')} />
              <TabApp text={t('userSettingsPage.tabProfileShares')} />
              <TabApp text={t('userSettingsPage.tabDocumentShares')} />
              <TabApp text={t('userSettingsPage.tabBlockedUsers')} disabled />
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
                'md:text-red-400 md:hover:bg-red-50',
                'py-[10px] px-[8px] text-red-400 whitespace-nowrap'
              )}
            >
              {t('userSettingsPage.logoutButton')}
            </button>
          </div>
          <TabPanels className="h-full overflow-hidden">
            <TabPanel key="Manage Data" className="">
              <ManageData />
            </TabPanel>
            <TabPanel key="Visiblility" className="h-full ">
              <Visibility />
            </TabPanel>
            <TabPanel key="Profile Shares" className="h-full overflow-hidden ">
              <ProfileShares />
            </TabPanel>
            <TabPanel key="Document Shares" className="">
              <DocumentShares />
            </TabPanel>
            <TabPanel
              key="Blocked Users"
              className="grid grid-rows-1 md:ml-4 h-full "
            >
              {/* <BlockedUsers /> */}
            </TabPanel>
          </TabPanels>
        </TabGroup>
      </div>
    </div>
  );
}
