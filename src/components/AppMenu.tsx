import { useMemo, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { IconAccount } from './Icons/IconAccount';
import { IconAdmin } from './Icons/IconAdmin';
import { IconChat } from './Icons/IconChat';
import { IconHelp } from './Icons/IconHelp';
import { IconMenuBurger } from './Icons/IconMenuBurger';
import { MobileMenuModal } from './modal/MobileMenuModal';
import { ProfilePageUserIcon } from './ProfilePageUserIcon';
import { UnreadBadge } from './UnreadBadge';

export function AppMenu() {
  const location = useLocation();
  const [isMobileMenuVisible, setMobileMenuVisible] = useState(false);
  const currentUser = useAppStore((s) => s.currentUser);
  const isAdmin = useAppStore((s) => s.currentApp?.isAllowedNewAppCreate);

  const getPageTitle = useMemo(() => {
    const parts = location.pathname.split('/').filter(Boolean);

    if (parts.length > 1) {
      return parts[1].charAt(0).toUpperCase() + parts[1].slice(1);
    }

    return 'Ethora';
  }, [location.pathname]);

  if (!currentUser) {
    return null;
  }

  return (
    // md:min-h-[640px]
    <div className="bg-white md:fixed p-2 flex justify-between items-center md:rounded-2xl md:self-start md:h-[calc(100vh-32px)]  md:flex-col">
      <button
        onClick={() => setMobileMenuVisible(!isMobileMenuVisible)}
        className="md:hidden"
      >
        <IconMenuBurger />
      </button>
      <div className="font-varela text-[24px] leading-none md:hidden block">
        {getPageTitle}
      </div>
      <div className="hidden md:flex flex-col">
        {isAdmin && (
          <NavLink
            to="/app/admin"
            className="flex group hover:bg-[#F5F7F9] flex-col items-center justify-center w-[64px] h-[64px] rounded-xl aria-[current=page]:bg-brand-150"
          >
            <IconAdmin />
            <div className="text-center group-aria-[current=page]:text-brand-500 font-sans text-sm">
              Admin
            </div>
          </NavLink>
        )}
        <NavLink
          to="/app/chat"
          className="flex group hover:bg-[#F5F7F9] flex-col items-center justify-center w-[64px] h-[64px] rounded-xl aria-[current=page]:bg-brand-150"
        >
          <div className="relative">
            <IconChat />
            <UnreadBadge className="absolute -top-1 -right-2" />
          </div>
          <div className="text-center font-sans text-sm group-aria-[current=page]:text-brand-500">
            Chats
          </div>
        </NavLink>
        <NavLink
          to="/app/help"
          className="flex group hover:bg-[#F5F7F9] flex-col items-center justify-center w-[64px] h-[64px] rounded-xl aria-[current=page]:bg-brand-150"
        >
          <IconHelp />
          <div className="text-center font-sans text-sm group-aria-[current=page]:text-brand-500">
            Help
          </div>
        </NavLink>
        <div className="my-2 border-b border-b-gray-200"></div>
      </div>
      <div>
        <NavLink
          to="/app/profile"
          className="flex hover:bg-[#F5F7F9] group flex-col items-center md:w-[64px] md:h-[64px] rounded-xl aria-[current=page]:bg-brand-150"
        >
          <ProfilePageUserIcon
            firstName={currentUser.firstName}
            lastName={currentUser.lastName}
            profileImage={currentUser.profileImage}
            width="40px"
            height="40px"
            className="border border-brand-500 rounded-full"
            small={true}
          />
          {/* <div
            className="bg-cover w-[40px] h-[40px] rounded-full"
            style={{ backgroundImage: `url(${profileImage})` }}
          ></div> */}
          <div className="hidden md:block group-aria-[current=page]:text-brand-500 text-center font-sans text-sm ">
            Profile
          </div>
        </NavLink>
        <div className="hidden md:block my-2 border-b border-b-gray-200"></div>
        <NavLink
          to="/app/settings"
          className="hidden group hover:bg-[#F5F7F9] flex-col items-center justify-center md:flex md:w-[64px] md:h-[64px] rounded-xl aria-[current=page]:bg-brand-150"
        >
          <IconAccount />
          <div className="hidden md:block text-center font-sans text-sm group-aria-[current=page]:text-brand-500">
            Account
          </div>
        </NavLink>
      </div>
      {isMobileMenuVisible && (
        <MobileMenuModal
          isAdmin={isAdmin}
          onClose={() => setMobileMenuVisible(false)}
        />
      )}
    </div>
  );
}
