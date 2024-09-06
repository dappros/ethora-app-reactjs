import { Outlet } from "react-router-dom";

export function ChatPage() {
    return (
        <>
            <div className="app-content-header">
                <div className="app-content-header-title">Chats</div>
                <div className="app-content-header-actions">actions</div>
            </div>
            <div className="app-content-body">
                <Outlet />
            </div>
        </>
    )
}
