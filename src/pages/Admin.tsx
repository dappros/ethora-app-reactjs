import cn from 'classnames';
import { NavLink, Outlet } from 'react-router-dom';

export default function Admin() {
  return (
    <div className="grid grid-rows-[auto,_1fr] gap-4 h-full">
      <div className="md:px-8 flex flex-col justify-between items-stretch md:items-center md:flex-row">
        <div className="font-varela mb-4 text-[24px] md:mb-0 md:text-[34px] leading-none">
          Admin
        </div>
        <div className="md:w-[400px] h-[40px] flex justify-between">
          <NavLink
            className={({ isActive }) =>
              cn(
                'w-1/2 border flex items-center justify-center rounded-l-xl border-brand-500 font-sans text-base',
                { 'bg-brand-500 text-white': isActive }
              )
            }
            to="/app/admin/apps"
          >
            Apps
          </NavLink>
          <NavLink
            className={({ isActive }) =>
              cn(
                'w-1/2 border flex items-center justify-center rounded-r-xl border-brand-500 font-sans text-base',
                { 'bg-brand-500 text-white': isActive }
              )
            }
            to="/app/admin/billing"
          >
            Billing
          </NavLink>
        </div>
      </div>
      <div id="admin" className="rounded-2xl bg-white p-4 grid grid-rows-[auto,_1fr]">
        <Outlet />
      </div>
    </div>
  );
}
