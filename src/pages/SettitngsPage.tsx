import { Outlet } from "react-router-dom";

export function SettingsPage() {
    return (
        <>
            <div className="app-content-header">
                <div className="app-content-header-title">Settings</div>
                <div className="app-content-header-actions">actions</div>
            </div>
            <div className="app-content-body">
                <Outlet />
            </div>
        </>
    )
}