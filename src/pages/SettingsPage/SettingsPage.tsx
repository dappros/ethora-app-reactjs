import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import { ModelCurrentUser } from '../../models';
import { useAppStore } from '../../store/useAppStore';
import { BlockedUsers } from './BlockedUsers';
import { DocumentShares } from './DocumentShares';
import { ManageData } from './ManageData';
import { ProfileShares } from './ProfileShares';
import { Referrals } from './Referrals';
import './SettingsPage.scss';
import { Visibility } from './Visibility';

export function SettingsPage() {
  const user = useAppStore((s) => s.currentUser as ModelCurrentUser);

  return (
    <>
      <div className="app-content-header">
        <div className="app-content-header-title">Settings</div>
        <div className="app-content-header-actions"></div>
      </div>
      {/* .app-content-body */}
      <div className="bg-white rounded-2xl md:ml-[96px] p-4 w-full md:w-[calc(100vw-166px)]">
        {/* .settings-page */}
        <TabGroup className="settings-page-tabs settings-page">
          {/* .tabs */}
          <TabList className="flex flex-col px-4 border-r border-gray-200 min-w-40 w-full max-w-[276px]">
            <div className="border-b mb-2 border-gray-200">
              <Tab
                className="py-3 rounded-xl mb-2 w-full px-4 text-left text-base hover:bg-gray-100 data-[selected]:bg-brand-100 data-[selected]:text-brand-500"
                key="Manage Data"
              >
                Manage Data
              </Tab>
            </div>
            <div className="border-b mb-2 border-gray-200">
              <Tab
                className="py-3 rounded-xl mb-2 w-full px-4 text-left text-base hover:bg-gray-100 data-[selected]:bg-brand-100 data-[selected]:text-brand-500"
                key="Visibility"
              >
                Visibility
              </Tab>
            </div>
            <div className="border-b mb-2 border-gray-200">
              <Tab
                className="py-3 rounded-xl mb-2 w-full px-4 text-left text-base hover:bg-gray-100 data-[selected]:bg-brand-100 data-[selected]:text-brand-500"
                key="Profile Shares"
              >
                Profile Shares
              </Tab>
            </div>
            <div className="border-b mb-2 border-gray-200">
              <Tab
                className="py-3 rounded-xl mb-2 w-full px-4 text-left text-base hover:bg-gray-100 data-[selected]:bg-brand-100 data-[selected]:text-brand-500"
                key="Document Shares"
              >
                Document Shares
              </Tab>
            </div>
            <div className="border-b mb-2 border-gray-200">
              <Tab
                className="py-3 rounded-xl mb-2 w-full px-4 text-left text-base hover:bg-gray-100 data-[selected]:bg-brand-100 data-[selected]:text-brand-500"
                key="Blocked Users"
              >
                Blocked Users
              </Tab>
            </div>
            <div className="border-b mb-2 border-gray-200">
              <Tab
                className="py-3 rounded-xl mb-2 w-full px-4 text-left text-base hover:bg-gray-100 data-[selected]:bg-brand-100 data-[selected]:text-brand-500"
                key="Referrals"
              >
                Referrals
              </Tab>
            </div>
          </TabList>
          <TabPanels className="tabs-content">
            <TabPanel key="Manage Data">
              <ManageData />
            </TabPanel>
            <TabPanel key="Visibility">
              <Visibility />
            </TabPanel>
            <TabPanel key="Profile Shares">
              <ProfileShares />
            </TabPanel>
            <TabPanel key="Document Shares">
              <DocumentShares />
            </TabPanel>
            <TabPanel key="Blocked Users">
              <BlockedUsers />
            </TabPanel>
            <TabPanel key="Referrals">
              <Referrals id={user._id} />
            </TabPanel>
          </TabPanels>
        </TabGroup>
      </div>
    </>
  );
}
