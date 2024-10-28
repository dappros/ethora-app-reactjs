import { NavLink, Outlet, useParams } from 'react-router-dom';
import { useAppStore } from '../../../store/useAppStore';

export function AdminAppPage({}) {
  let { appId } = useParams();
  const apps = useAppStore((s) => s.apps);
  const app = apps.find((app) => app._id === appId);
  return (
    <>
      <div className="app-content-header">
        <div className="app-content-header-title">{app?.displayName}</div>
        <div className="app-content-header-actions">
          <NavLink to={`/app/admin/application/${appId}/users`}>Users</NavLink>
          <NavLink to={`/app/admin/application/${appId}/settings`}>
            Settings
          </NavLink>
          <NavLink to={`/app/admin/application/${appId}/statistics`}>
            Statistics
          </NavLink>
        </div>
      </div>
      <div className="app-content-body">
        <Outlet />
      </div>
    </>
  );
}
