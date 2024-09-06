import { Outlet } from "react-router-dom";

export function ProfilePage() {
    return (
        <>
            <div className="app-content-header">
                <div className="app-content-header-title">Profile</div>
                <div className="app-content-header-actions">actions</div>
            </div>
            <div className="app-content-body">
                <Outlet />
            </div>
        </>
    )
}
