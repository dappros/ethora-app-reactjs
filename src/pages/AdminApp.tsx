import { NavLink, Outlet, useNavigate, useParams } from 'react-router-dom';
import { IconArrowLeft } from '../components/Icons/IconArrowLeft';
import { useAppStore } from '../store/useAppStore';

export default function AdminApp() {
  let { appId } = useParams();
  const apps = useAppStore((s) => s.apps);
  const app = apps.find((app) => app._id === appId);
  const navigate = useNavigate();

  return (
    // overflow-hidden
    <div className="h-full  grid grid-rows-[auto,_1fr]">
      <div className="mb-4 flex md:flex-row flex-col md:justify-between">
        <div className="flex mb-4 md:mb-0">
          <button
            className="ml-[5px] md:mb-0 mr-[13px]"
            onClick={() => navigate('/app/admin/apps')}
          >
            <IconArrowLeft />
          </button>

          <div className="font-varela  text-[24px] md:text-[34px]">
            {app?.displayName}
          </div>
        </div>
        <div className="grid justify-center content-center grid-cols-3 w-auto md:w-full md:max-w-[400px] md:mr-[32px]">
          <NavLink
            className="aria-[current=page]:bg-brand-500 hover:bg-brand-hover aria-[current=page]:text-white border border-r-0 border-brand-500 block text-center rounded-l-xl items-center py-2 px-4"
            to={`/app/admin/apps/${appId}/users`}
          >
            Users
          </NavLink>
          <NavLink
            className="aria-[current=page]:bg-brand-500 hover:bg-brand-hover aria-[current=page]:text-white border border-brand-500 block text-center items-center py-2 px-4"
            to={`/app/admin/apps/${appId}/settings`}
          >
            Settings
          </NavLink>
          <NavLink
            className="aria-[current=page]:bg-brand-500 hover:bg-brand-hover aria-[current=page]:text-white border border-l-0 border-brand-500 block text-center rounded-r-xl items-center py-2 px-4"
            to={`/app/admin/apps/${appId}/statistics`}
          >
            Statistics
          </NavLink>
        </div>
      </div>
      {/* overflow-hidden */}
      <div className="bg-white rounded-2xl p-4">
        <Outlet />
      </div>
    </div>
  );
}
