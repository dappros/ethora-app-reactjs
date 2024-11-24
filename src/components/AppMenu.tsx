import { NavLink } from 'react-router-dom';
import profileImage from '../assets/profile-image.png';
import { IconAdmin } from './Icons/IconAdmin';
import { IconChat } from './Icons/IconChat';
import { IconMenuBurger } from './Icons/IconMenuBurger';
import { useState } from 'react';
import { MobileMenuModal } from './modal/MobileMenuModal';
import { IconSettingsMenu } from './Icons/IconSettingsMenu';

export function AppMenu() {
  const [isMobileMenuVisible, setMobileMenuVisible] = useState(false);

  return (
    // md:min-h-[640px]
    <div className="bg-white md:fixed p-2 flex justify-between items-center md:rounded-2xl md:self-start md:h-[calc(100vh-32px)]  md:flex-col">
      <button onClick={() => setMobileMenuVisible(!isMobileMenuVisible)} className="md:hidden">
        <IconMenuBurger />
      </button>
      <div className="hidden md:flex flex-col">
        <NavLink
          to="/app/chat"
          className="flex group hover:bg-[#F5F7F9] flex-col items-center justify-center w-[64px] h-[64px] rounded-xl aria-[current=page]:bg-brand-150"
        >
          <IconChat />
          <div className="text-center font-sans text-sm group-aria-[current=page]:text-brand-500">Chats</div>
        </NavLink>
        <div className="my-2 border-b border-b-gray-200"></div>
        <NavLink
          to="/app/admin"
          className="flex group hover:bg-[#F5F7F9] flex-col items-center justify-center w-[64px] h-[64px] rounded-xl aria-[current=page]:bg-brand-150"
        >
          <IconAdmin />
          <div className="text-center group-aria-[current=page]:text-brand-500 font-sans text-sm">Admin</div>
        </NavLink>
      </div>
      <div>
        <NavLink
          to="/app/profile"
          className="flex hover:bg-[#F5F7F9] group flex-col items-center md:w-[64px] md:h-[64px] rounded-xl aria-[current=page]:bg-brand-150"
        >
          <div
            className="bg-cover w-[40px] h-[40px] rounded-full"
            style={{ backgroundImage: `url(${profileImage})` }}
          ></div>
          <div className="hidden md:block group-aria-[current=page]:text-brand-500 text-center font-sans text-sm ">
            Profile
          </div>
        </NavLink>
        <div className="hidden md:block my-2 border-b border-b-gray-200"></div>
        <NavLink
          to="/app/settings"
          className="hidden group hover:bg-[#F5F7F9] flex-col items-center justify-center md:flex md:w-[64px] md:h-[64px] rounded-xl aria-[current=page]:bg-brand-150"
        >
          <IconSettingsMenu />
          <div className="hidden md:block text-center font-sans text-sm group-aria-[current=page]:text-brand-500">
            Settings
          </div>
        </NavLink>
      </div>
      {isMobileMenuVisible && (
        <MobileMenuModal onClose={() => setMobileMenuVisible(false)} />
      )}
    </div>
  );
}
