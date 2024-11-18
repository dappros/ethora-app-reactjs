import { NavLink } from 'react-router-dom';
import profileImage from '../assets/profile-image.png';
import { IconAdmin } from './Icons/IconAdmin';
import { IconChat } from './Icons/IconChat';
import { IconMenuBurger } from './Icons/IconMenuBurger';
import { IconSettings } from './Icons/IconSettings';

export function AppMenu() {
  return (
    <div className="bg-white p-2 flex justify-between items-center md:rounded-2xl md:self-start md:min-h-[640px] md:flex-col">
      <button className="md:hidden">
        <IconMenuBurger />
      </button>
      <div className="hidden md:flex flex-col">
        <NavLink
          to="/app/chat"
          className="flex flex-col items-center justify-center w-[64px] h-[64px] rounded-xl aria-[current=page]:bg-brand-150"
        >
          <IconChat />
          <div className="text-center font-sans text-sm">Chats</div>
        </NavLink>
        <div className="my-2 border-b border-b-gray-200"></div>
        <NavLink
          to="/app/admin"
          className="flex flex-col items-center justify-center w-[64px] h-[64px] rounded-xl aria-[current=page]:bg-brand-150"
        >
          <IconAdmin />
          <div className="text-center font-sans text-sm">Admin</div>
        </NavLink>
      </div>
      <div>
        <NavLink
          to="/app/profile"
          className="flex flex-col items-center md:w-[64px] md:h-[64px] rounded-xl aria-[current=page]:bg-brand-150"
        >
          <div
            className="bg-cover w-[40px] h-[40px] rounded-full"
            style={{ backgroundImage: `url(${profileImage})` }}
          ></div>
          <div className="hidden md:block text-center font-sans text-sm">
            Profile
          </div>
        </NavLink>
        <div className="hidden md:block my-2 border-b border-b-gray-200"></div>
        <NavLink
          to="/app/settings"
          className="hidden flex-col items-center justify-center md:flex md:w-[64px] md:h-[64px] rounded-xl aria-[current=page]:bg-brand-150"
        >
          <IconSettings />
          <div className="hidden md:block text-center font-sans text-sm">
            Settings
          </div>
        </NavLink>
      </div>
    </div>
  );
}
