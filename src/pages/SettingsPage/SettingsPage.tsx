import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import { ManageData } from './ManageData';
import './SettingsPage.scss';
import { Visibility } from './Visibility';

export function SettingsPage() {
  return (
    <>
      <div className="app-content-header">
        <div className="app-content-header-title">Settings</div>
        <div className="app-content-header-actions"></div>
      </div>
      <div className="app-content-body ">
        <TabGroup className="settings-page-tabs settings-page">
          <TabList className="tabs">
            <Tab key="Manage Data">Manage Data</Tab>
            <Tab key="Visibility">Visibility</Tab>
            <Tab key="Profile Shares">Profile Shares</Tab>
            <Tab key="Document Shares">Document Shares</Tab>
            <Tab key="Blocked Users">Blocked Users</Tab>
            <Tab key="Referrals">Referrals</Tab>
          </TabList>
          <TabPanels className="tabs-content">
            <TabPanel key="Manage Data">
              <ManageData />
            </TabPanel>
            <TabPanel key="Visibility">
              <Visibility />
            </TabPanel>
            <TabPanel key="Profile Shares">Profile Shares</TabPanel>
            <TabPanel key="Document Shares">Document Shares</TabPanel>
            <TabPanel key="Blocked Users">Blocked Users</TabPanel>
            <TabPanel key="Referrals">Referrals</TabPanel>
          </TabPanels>
        </TabGroup>
      </div>
    </>
  );
}
