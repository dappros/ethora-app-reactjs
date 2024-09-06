import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { actionGetConfig } from './actions';
import { RequireAuth } from './components/RequireAuth';
import { useEffect } from "react";
import { useAppStore } from "./store/useAppStore";
import { Loading } from "./components/Loading";
import { Login } from "./pages/Auth/Login";
import { Register } from "./pages/Auth/Register";
import { NotFound } from "./pages/NotFound";
import { AppPage } from "./pages/AppPage";
import { ChatPage } from "./pages/ChatPage";
import { AdminBilling } from "./pages/Admin/AdminBilling";
import { ProfilePage } from "./pages/ProfilePage";
import { SettingsPage } from "./pages/SettitngsPage";
import { AdminApp } from "./pages/Admin/AdminApp";
import { AdminAppsBillingPage } from "./pages/Admin/AdminAppsBillingPage";
import { AdminApps } from "./pages/Admin/AdminApps";
import { AdminAppPage } from "./pages/Admin/App/AdminAppPage";
import { AdminAppUsers } from "./pages/Admin/App/AdminAppUsers";
import { AdminAppSettings } from "./pages/Admin/App/AdminAppSettings";
import { AdminAppStatistics } from "./pages/Admin/App/AdminAppStatistics";

function App() {
  const currentApp = useAppStore(s => s.currentApp)
  
  useEffect(() => {
    actionGetConfig(import.meta.env.VITE_DOMAIN_NAME)
  }, [])

  if (!currentApp) {
    return <Loading></Loading>
  } else {
    return (
      <>
        <Routes>
          <Route path="/" element={<Navigate to="/app" />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register" element={<Register />} />
          <Route
            path="/app"
            element={
              <RequireAuth>
                <AppPage />
              </RequireAuth>
            }
          >
            <Route path="chat" element={<ChatPage />} />
            <Route path="admin" element={<AdminAppsBillingPage />}>
              <Route path="apps" element={<AdminApps />} />
              <Route path="billing" element={<AdminBilling />} />
              
            </Route>
            <Route path="admin/application" element={<AdminAppPage />}>
              <Route path=":appId" element={<AdminApp />}>
                <Route path="users" element={<AdminAppUsers />} />
                <Route path="settings" element={<AdminAppSettings />} />
                <Route path="statistics" element={<AdminAppStatistics />} />
              </Route>
            </Route>
            <Route path="profile" element={<ProfilePage />}></Route>
            <Route path="settings" element={<SettingsPage />}></Route>
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </>
    )
  }
}

export default App