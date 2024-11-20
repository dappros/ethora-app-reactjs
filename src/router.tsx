import { createBrowserRouter, Navigate } from 'react-router-dom';
import AppHelmet from './AppHelmet';
import AppLayout from './AppLayout';
import Admin from './pages/Admin';
import { AdminApp } from './pages/AdminApp';
import AdminApps from './pages/AdminApps';
import { AdminBilling } from './pages/AdminBilling';
import { AppSettings } from './pages/AppSettings/AppSettings';
import { AppStatistics } from './pages/AppStatistics';
import AppUsers from './pages/AppUsers';
import LoginComponent from './pages/AuthPage/Login';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import Settings from './pages/Settings';

export const router = createBrowserRouter(
  [
    {
      path: '/',
      Component: AppHelmet,
      children: [
        {
          path: '/login',
          Component: LoginComponent,
        },
        {
          path: '/app',
          element: <AppLayout />,
          children: [
            {
              index: true,
              element: <Navigate to="/app/admin" />,
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
                  Component: AdminBilling,
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
              path: 'settings',
              Component: Settings,
            },
          ],
        },
      ],
    },
  ],
  {
    future: {
      v7_relativeSplatPath: true,
    },
  }
);
