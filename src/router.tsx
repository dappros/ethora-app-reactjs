import { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import AppHelmet from './AppHelmet';
import AppLayout from './AppLayout';
import Admin from './pages/Admin';
import { AdminApp } from './pages/AdminApp';
import AdminApps from './pages/AdminApps';
import { AppSettings } from './pages/AppSettings/AppSettings';
import { AppStatistics } from './pages/AppStatistics';
import AppUsers from './pages/AppUsers';
import ForgetPassword from './pages/AuthPage/ForgetPassword';
import LoginComponent from './pages/AuthPage/Login';
import Register from './pages/AuthPage/Register';
import { AdminBilling } from './pages/Billing/AdminBilling';
import BillingModule from './pages/Billing/BillingModule';
import Chat from './pages/Chat';
import { Error404Page } from './pages/ErrorPage/Error404Page';
import Profile from './pages/Profile';
import { ProfileEdit } from './pages/ProfileEdit';
import UserSettings from './pages/UserSettings/UserSettings';

const App = lazy(() => import('./App'));

export const router = createBrowserRouter(
  [
    {
      Component: App,
      children: [
        {
          path: '/',
          Component: AppHelmet,
          children: [
            {
              path: '/login',
              Component: LoginComponent,
            },
            {
              path: '/register',
              Component: Register,
            },
            {
              path: '/tempPassword/',
              Component: Register,
            },
            {
              path: '/resetPassword/:token?',
              Component: ForgetPassword,
            },
            {
              path: '/app',
              element: <AppLayout />,
              children: [
                {
                  index: true,
                  element: <Navigate to="/app/admin/apps" />,
                },
                {
                  path: 'chat',
                  Component: Chat,
                },
                {
                  path: 'admin',
                  Component: Admin,
                  children: [
                    {
                      index: true,
                      element: <Navigate to="/app/admin/apps" />,
                    },
                    {
                      path: 'apps',
                      Component: AdminApps,
                    },
                    {
                      path: 'billing',
                      Component: BillingModule,
                      children: [
                        {
                          index: true,
                          Component: AdminBilling,
                        },
                      ],
                    },
                  ],
                },
                {
                  path: 'admin/apps/:appId',
                  Component: AdminApp,
                  children: [
                    {
                      path: 'settings',
                      Component: AppSettings,
                    },
                    {
                      path: 'users',
                      Component: AppUsers,
                    },
                    {
                      path: 'statistics',
                      Component: AppStatistics,
                    },
                  ],
                },
                {
                  path: 'profile',
                  Component: Profile,
                },
                {
                  path: 'profile/edit',
                  Component: ProfileEdit,
                },
                {
                  path: 'settings',
                  Component: UserSettings,
                },
              ],
            },
          ],
        },
      ],
    },
    {
      path: '*',
      element: <Error404Page />,
    },
  ],
  {
    future: {
      v7_relativeSplatPath: true,
    },
  }
);
