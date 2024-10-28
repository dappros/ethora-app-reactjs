import hexToRgba from 'hex-to-rgba';
import { useEffect } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

import { Helmet } from 'react-helmet';
import { actionGetConfig } from './actions';
import { Loading } from './components/Loading';
import { RequireAuth } from './components/RequireAuth';
import { AdminApp } from './pages/Admin/AdminApp';
import { AdminApps } from './pages/Admin/AdminApps';
import { AdminAppsBillingPage } from './pages/Admin/AdminAppsBillingPage';
import { AdminBilling } from './pages/Admin/AdminBilling';
import { AdminAppPage } from './pages/Admin/App/AdminAppPage';
import { AdminAppSettings } from './pages/Admin/App/AdminAppSettings';
import { AdminAppStatistics } from './pages/Admin/App/AdminAppStatistics';
import { AdminAppUsers } from './pages/Admin/App/AdminAppUsers';
import { AppPage } from './pages/AppPage';
import ForgetPassword from './pages/AuthPage/ForgetPassword';
import LoginComponent from './pages/AuthPage/Login/index';
import Register from './pages/AuthPage/Register';
import { ChatPage } from './pages/ChatPage';
import { NotFound } from './pages/NotFound';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage/SettingsPage';
import { useAppStore } from './store/useAppStore';

import 'react-toastify/dist/ReactToastify.css';
import { ProfilePageEdit } from './pages/ProfilePageEdit';
import { PublicProfile } from './pages/PublicProfile';

function App() {
  const currentApp = useAppStore((s) => s.currentApp);
  const navigate = useNavigate();

  useEffect(() => {
    actionGetConfig(import.meta.env.VITE_DOMAIN_NAME);
  }, []);

  useEffect(() => {
    if (currentApp) {
      const primaryColor = currentApp.primaryColor;
      document.documentElement.style.setProperty(
        '--bg-brand-primary',
        primaryColor
      );
      document.documentElement.style.setProperty(
        '--bg-auth-background',
        hexToRgba(primaryColor, '0.05')
      );
    }
  }, [currentApp]);

  // useEffect(() => {
  //   const user: ModelCurrentUser = useLocalStorage(
  //     localStorageConstants.ETHORA_USER
  //   ).get() as ModelCurrentUser;

  //   if (user) {
  //     actionRefreshUserFromLocalStorage(user);
  //     navigate("/app/admin/apps");
  //   }
  // }, [currentApp]);

  if (!currentApp) {
    return <Loading></Loading>;
  } else {
    return (
      <>
        <Helmet>
          <title>{currentApp.displayName || 'Dappros Platform'}</title>
          <meta
            property="og:title"
            content={currentApp.displayName || 'Dappros Platform'}
          />
        </Helmet>
        <Routes>
          <Route path="/" element={<Navigate to="/app" />} />
          <Route path="/login" element={<LoginComponent />} />
          <Route path="/register" element={<Register />} />
          <Route path="/tempPassword" element={<Register />} />
          <Route path="/resetPassword/:token?" element={<ForgetPassword />} />
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
            <Route path="profile/edit" element={<ProfilePageEdit />}></Route>
            <Route path="settings" element={<SettingsPage />}></Route>
          </Route>
          <Route path="/public/:address" element={<PublicProfile />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <ToastContainer />
      </>
    );
  }
}

export default App;
