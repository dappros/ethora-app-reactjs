import cn from 'classnames';
import { NavLink, Outlet } from 'react-router-dom';

export default function Admin() {
  const isProd = import.meta.env.VITE_SITE_IS_PRODUCTION;

  return (
    <div className="grid grid-rows-[auto,_1fr] gap-4 h-full">
      <div className="md:px-8 hidden md:flex flex-col justify-between items-stretch md:items-center md:flex-row">
        <div className="font-varela mb-4 text-[24px] md:mb-0 md:text-[34px] leading-none">
          Admin
        </div>
        <div className="md:w-[400px] h-[40px] flex justify-between">
          <NavLink
            className={({ isActive }) =>
              cn(
                'w-1/2 border flex items-center hover:bg-brand-darker justify-center rounded-l-xl border-brand-500 font-sans text-base',
                {
                  'bg-brand-500 text-white': isActive,
                  'hover:bg-brand-hover': !isActive,
                }
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
                {
                  'bg-brand-500 text-white': isActive,
                  'hover:bg-brand-hover': !isActive,
                  'cursor-not-allowed pointer-events-none text-gray-300 border-gray-300':
                    isProd === 'true',
                }
              )
            }
            to="/app/admin/billing"
          >
            Billing
          </NavLink>
        </div>
      </div>
      <div
        id="admin"
        className="rounded-2xl bg-white p-4 grid grid-rows-[auto,_1fr]"
      >
        <Outlet />
      </div>
    </div>
  );
}
