import { TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import TabApp from "../../components/TabApp";

export default function UserSettings() {
  return (
    <div className="grid grid-rows-[auto,_1fr] gap-4 h-full">
      <div className="md:px-8 flex flex-col justify-between items-stretch md:items-center md:flex-row">
        <div className="font-varela mb-4 text-[24px] md:mb-0 md:text-[34px] leading-none">
          Settings
        </div>
      </div>
      <div className="rounded-2xl bg-white px-4 py-4 h-full overflow-hidden">
        <TabGroup className="grid here h-full overflow-hidden grid-rows-[46px,_1fr] gap-y-[16px] md:grid-rows-1 md:grid-cols-[308px,_1fr]">
          <TabList className="flex flex-row md:flex-col hide-scroll md:mb-0  border-b border-gray-200 md:px-4 md:border-b-0 overflow-auto  md:border-r md:border-gray-200">
            <TabApp text="Manage Data" />
            <TabApp text="Visiblility" />
            <TabApp text="Profile Shares" />
            <TabApp text="Document Shares" />
            <TabApp text="Blocked Users" />
            <TabApp text="Referrals" last />
          </TabList>
          <TabPanels className="h-full">
            <TabPanel
              key="Appearance"
              className="grid grid-rows-[auto,_368px] lg:grid-rows-1 lg:gap-x-[40px] lg:grid-cols-[416px,_1fr] md:ml-4 h-full "
            >
              app
            </TabPanel>
            <TabPanel
              key="Sign-on options"
              className="grid grid-rows-1 md:ml-4 h-full "
            >
              sig
            </TabPanel>
            <TabPanel key="Web app" className="grid grid-rows-1 md:ml-4 h-full ">
              web
            </TabPanel>
            <TabPanel
              key="Mobile app"
              className="grid grid-rows-1 md:ml-4 h-full "
            >
              mob
            </TabPanel>
            <TabPanel
              key="Home screen"
              className="grid grid-rows-1 md:ml-4 h-full "
            >
              home
            </TabPanel>
            <TabPanel key="Menu" className="grid grid-rows-1 md:ml-4 h-full ">
              menu
            </TabPanel>
          </TabPanels>
        </TabGroup>
      </div>
    </div>
  )
}
