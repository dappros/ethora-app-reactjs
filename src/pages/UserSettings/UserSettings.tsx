import { TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import TabApp from '../../components/TabApp';
import { ModelCurrentUser } from '../../models';
import { useAppStore } from '../../store/useAppStore';
import { DocumentShares } from './DocumentShares';
import { ManageData } from './ManageData';
import { ProfileShares } from './ProfileShares';
import { Referrals } from './Referrals';
import { Visibility } from './Visibility';

const tabs = [
  'Manage Data',
  'Visiblility',
  'Profile Shares',
  'Document Shares',
  'Blocked Users',
  'Referrals'
];

export default function UserSettings() {
  const user = useAppStore((s) => s.currentUser as ModelCurrentUser);
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Получаем текущий таб из URL
  const tabFromUrl = searchParams.get('tab');
  const initialTabIndex = tabs.includes(tabFromUrl ?? '') 
    ? tabs.indexOf(tabFromUrl!) 
    : 0;
  
  const [selectedIndex, setSelectedIndex] = useState(initialTabIndex);

  // Обновляем URL при изменении таба
  useEffect(() => {
    setSearchParams(params => {
      params.set('tab', tabs[selectedIndex]);
      return params;
    });
  }, [selectedIndex, setSearchParams]);

  return (
    <div className="grid grid-rows-[auto,_1fr] gap-4 h-full">
      <div className="md:px-8 hidden md:flex flex-col justify-between items-stretch md:items-center md:flex-row">
        <div className="font-varela mb-4 text-[24px] md:mb-0 md:text-[34px] leading-none">
          Settings
        </div>
      </div>
      {/* overflow-hidden */}
      <div className="rounded-2xl bg-white px-4 py-4 h-full ">
        <TabGroup 
          className="grid here h-full overflow-hidden grid-rows-[46px,_1fr] gap-y-[16px] md:grid-rows-1 md:grid-cols-[308px,_1fr]"
          selectedIndex={selectedIndex}
          onChange={setSelectedIndex}
        >
          <TabList className="flex flex-row md:flex-col hide-scroll md:mb-0  border-b border-gray-200 md:pr-4 md:border-b-0 overflow-auto  md:border-r md:border-gray-200">
            <TabApp text="Manage Data" />
            <TabApp text="Visiblility" />
            <TabApp text="Profile Shares" />
            <TabApp text="Document Shares" />
            <TabApp text="Blocked Users" disabled />
            <TabApp text="Referrals" last />
          </TabList>
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
            {/* grid grid-rows-1 md:ml-4 h-full  */}
            <TabPanel key="Document Shares" className="">
              <DocumentShares />
            </TabPanel>
            <TabPanel
              key="Blocked Users"
              className="grid grid-rows-1 md:ml-4 h-full "
            >
              {/* <BlockedUsers /> */}
            </TabPanel>

            <TabPanel
              key="Referrals"
              className="grid grid-rows-1 md:ml-4 h-full "
            >
              <Referrals id={user._id} />
            </TabPanel>
          </TabPanels>
        </TabGroup>
      </div>
    </div>
  );
}
