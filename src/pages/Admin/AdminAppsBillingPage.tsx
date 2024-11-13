import { NavLink, Outlet } from 'react-router-dom';

export function AdminAppsBillingPage() {
  return (
    <>
      <div className="app-content-header">
        <div className="app-content-header-title">Admin</div>
        <div className="app-content-header-actions">
          <NavLink to="/app/admin/apps">Apps</NavLink>
          <NavLink to="/app/admin/billing">Billing</NavLink>
        </div>
      </div>
      <div className="bg-white rounded-2xl md:ml-[96px] p-4 w-full md:w-[calc(100vw-166px)] md:max-w-[1800px]">
        <Outlet />
      </div>
    </>
  );
}
