import { NavLink, Outlet, useNavigate, useParams } from 'react-router-dom';
import { IconArrowLeft } from '../../../components/Icons/IconArrowLeft';
import { useAppStore } from '../../../store/useAppStore';

export function AdminAppPage({}) {
  let { appId } = useParams();
  const apps = useAppStore((s) => s.apps);
  const app = apps.find((app) => app._id === appId);
  const navigate = useNavigate();
  return (
    <>
      {/* app-content-header align-center */}
      <div className="mb-4 md:ml-[96px] flex md:flex-row flex-col md:justify-between md:w-[calc(100vw-166px)] md:max-w-[1800px]">
        {/* app-content-header-title */}
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
        {/* app-content-header-actions */}
        <div className="grid justify-center content-center grid-cols-3 w-auto md:w-full md:max-w-[400px] md:mr-[32px]">
          <NavLink
            className="aria-[current=page]:bg-brand-500 aria-[current=page]:text-white border border-brand-500 block text-center rounded-l-xl items-center py-2 px-4"
            to={`/app/admin/application/${appId}/users`}
          >
            Users
          </NavLink>
          <NavLink
            className="aria-[current=page]:bg-brand-500 aria-[current=page]:text-white border border-brand-500 block text-center items-center py-2 px-4"
            to={`/app/admin/application/${appId}/settings`}
          >
            Settings
          </NavLink>
          <NavLink
            className="aria-[current=page]:bg-brand-500 aria-[current=page]:text-white border border-brand-500 block text-center rounded-r-xl items-center py-2 px-4"
            to={`/app/admin/application/${appId}/statistics`}
          >
            Statistics
          </NavLink>
        </div>
      </div>
      <div className="bg-white rounded-2xl md:ml-[96px] p-4 w-full md:w-[calc(100vw-166px)] md:max-w-[1800px]">
        <Outlet />
      </div>
    </>
  );
}
