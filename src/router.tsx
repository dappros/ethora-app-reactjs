import { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import AppHelmet from './AppHelmet';
import AppLayout from './AppLayout';
import { AppStatistics } from './pages/AppStatistics';
import ForgetPassword from './pages/AuthPage/ForgetPassword';
import LoginComponent from './pages/AuthPage/Login';
import Register from './pages/AuthPage/Register';
import { AdminBilling } from './pages/Billing/AdminBilling';
import { Error404Page } from './pages/ErrorPage/Error404Page';
const Admin = lazy(() => import('./pages/Admin'));
const AdminApp = lazy(() => import('./pages/AdminApp'));
const AdminApps = lazy(() => import('./pages/AdminApps'));
const AppSettings = lazy(() => import('./pages/AppSettings/AppSettings'));
const AppUsers = lazy(() => import('./pages/AppUsers'));
const BillingModule = lazy(() => import('./pages/Billing/BillingModule'));
const Chat = lazy(() => import('./pages/Chat'));
const Profile = lazy(() => import('./pages/Profile'));
const UserSettings = lazy(() => import('./pages/UserSettings/UserSettings'));
const ProfileEdit = lazy(() => import('./pages/ProfileEdit'));

import App from './App'

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
