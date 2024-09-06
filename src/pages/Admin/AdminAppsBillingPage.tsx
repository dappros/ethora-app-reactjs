import { NavLink, Outlet } from "react-router-dom";

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
            <div className="app-content-body">
                <Outlet />
            </div>
        </>
    )
}
