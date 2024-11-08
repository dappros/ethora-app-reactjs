import { TabGroup, TabPanel, TabPanels } from '@headlessui/react';
import { TablistSettings } from '../../components/TabListSettings';
import { ModelCurrentUser } from '../../models';
import { useAppStore } from '../../store/useAppStore';
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
        {/* <TabGroup className="settings-page-tabs settings-page"></TabGroup> */}
        <TabGroup className="ettings-page-tabs settings-page">
          <TablistSettings
            items={[
              'Manage Data',
              'Visibility',
              'Profile Shares',
              'Document Shares',
              'Referrals',
            ]}
          />
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
            <TabPanel key="Referrals">
              <Referrals id={user._id} />
            </TabPanel>
          </TabPanels>
        </TabGroup>
      </div>
    </>
  );
}
