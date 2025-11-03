import { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import AppHelmet from './AppHelmet';
import AppLayout from './AppLayout';
import { AppStatistics } from './pages/AppStatistics';
import ForgetPassword from './pages/AuthPage/ForgetPassword';
import LoginComponent from './pages/AuthPage/Login';
import Register from './pages/AuthPage/Register';
import Chat from './pages/Chat';
import { Error404Page } from './pages/ErrorPage/Error404Page';
import { RouterErrorElement } from './components/Error/RouterErrorBoundary';
const Admin = lazy(() => import('./pages/Admin'));
const AdminApp = lazy(() => import('./pages/AdminApp'));
const AdminApps = lazy(() => import('./pages/AdminApps'));
const AdminBilling = lazy(() => import('./pages/AdminBilling'));
const AppSettings = lazy(() => import('./pages/AppSettings/AppSettings'));
const AppUsers = lazy(() => import('./pages/AppUsers'));
const Profile = lazy(() => import('./pages/Profile'));
const UserSettings = lazy(() => import('./pages/UserSettings/UserSettings'));
const ProfileEdit = lazy(() => import('./pages/ProfileEdit'));

import App from './App';
import AdminLayout from './pages/AdminLayout';
import TurnstileBridge from './pages/TurnstileBridge';

export const router = createBrowserRouter(
  [
    {
      Component: App,
      errorElement: <RouterErrorElement />,
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
              path: '/turnstile',
              Component: TurnstileBridge,
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
                  Component: () => (
                    <AdminLayout>
                      <Admin />
                    </AdminLayout>
                  ),
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
                    {
                      path: 'apps/:appId',
                      Component: AdminApp,
                      children: [
                        {
                          index: true,
                          element: <Navigate to="settings" replace />,
                        },
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
        {
          path: '*',
          element: <Error404Page />,
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
