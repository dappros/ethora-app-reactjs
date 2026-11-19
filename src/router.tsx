import { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import AppHelmet from './AppHelmet';
import AppLayout from './AppLayout';
import { RouterErrorElement } from './components/Error/RouterErrorBoundary';
import AccountSuspended from './pages/AccountSuspended';
import ForgetPassword from './pages/AuthPage/ForgetPassword';
import LoginComponent from './pages/AuthPage/Login';
import Register from './pages/AuthPage/Register';
import RegistrationOpenRoute from './pages/AuthPage/Register/RegistrationOpenRoute';
import CallJoin from './pages/CallJoin';
import AgentChatJoin from './pages/AgentChatJoin';
import Chat from './pages/Chat';
import { Error404Page } from './pages/ErrorPage/Error404Page';
const Admin = lazy(() => import('./pages/Admin'));
const Help = lazy(() => import('./pages/Help'));
const AdminApp = lazy(() => import('./pages/AdminApp'));
const AdminApps = lazy(() => import('./pages/AdminApps'));
const StartProject = lazy(() => import('./pages/StartProject'));
const SelfHostedStart = lazy(() => import('./pages/SelfHostedStart'));
const AdminAgents = lazy(() => import('./pages/AdminAgents'));
const AdminBilling = lazy(() => import('./pages/AdminBilling'));
const AdminLicense = lazy(() => import('./pages/AdminLicense'));
const AdminServerSettings = lazy(() => import('./pages/AdminServerSettings'));
const AdminTrustSafety = lazy(() => import('./pages/AdminTrustSafety'));
const LegacyEvidenceRedirect = lazy(() =>
  import('./pages/AdminTrustSafety').then((m) => ({ default: m.LegacyEvidenceRedirect }))
);
const QuarantineIndexRedirect = lazy(() =>
  import('./pages/AdminTrustSafety').then((m) => ({ default: m.QuarantineIndexRedirect }))
);
const AppSettings = lazy(() => import('./pages/AppSettings/AppSettings'));
const AppHome = lazy(() => import('./pages/AppHome'));
const AppAssistant = lazy(() => import('./pages/AppAssistant'));
const AppConversations = lazy(() => import('./pages/AppConversations'));
const AppChats = lazy(() => import('./pages/AppChats'));
const AgentSettings = lazy(() => import('./pages/AgentSettings'));
const AppUsers = lazy(() => import('./pages/AppUsers'));
const AppModeration = lazy(() => import('./pages/AppModeration'));
const Profile = lazy(() => import('./pages/Profile'));
const UserSettings = lazy(() => import('./pages/UserSettings/UserSettings'));
const ProfileEdit = lazy(() => import('./pages/ProfileEdit'));
// Statistics is the only page that uses the charting stack (recharts,
// react-date-range); keep it out of the main chunk like the other admin pages.
const AppStatistics = lazy(() =>
  import('./pages/AppStatistics').then((m) => ({ default: m.AppStatistics }))
);

import App from './App';
import { BaseAppOnly } from './components/BaseAppOnly';
import AdminLayout from './pages/AdminLayout';
import TurnstileBridge from './pages/TurnstileBridge';
import WpSetup from './pages/WpSetup';
import TryStart from './pages/Try/TryStart';
import TryDemoPage from './pages/Try/TryDemoPage';
import { defaultLandingPath } from './utils/appHost';

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
              // Guarded: apps that closed self-service registration bounce
              // this to /login with a notice.
              path: '/register',
              Component: RegistrationOpenRoute,
            },
            {
              // NOT guarded - this is the owner-provisioned user setting their
              // permanent password from the temp one they were emailed. It has
              // to keep working precisely when registration is closed.
              path: '/tempPassword/',
              Component: Register,
            },
            {
              path: '/resetPassword/:token?',
              Component: ForgetPassword,
            },
            {
              // Blocking screen after a 403 USER_SUSPENDED ended the session
              // (http.ts interceptor). Reachable without a token.
              path: '/account-suspended',
              Component: AccountSuspended,
            },
            {
              path: '/turnstile',
              Component: TurnstileBridge,
            },
            {
              path: '/wp-setup',
              Component: WpSetup,
            },
            {
              // "Try it on your site": the front door (sign-in needed to
              // create a demo) and the public demo link (no sign-in).
              path: '/try/:site?',
              Component: TryStart,
            },
            {
              path: '/try/:site/:token',
              Component: TryDemoPage,
            },
            {
              // Join link of a scheduled call (calendar event, invite card,
              // reminder push). Same shell as the chat; AppLayout sends a
              // signed-out visitor through the login and back here.
              path: '/call/:slug',
              element: <AppLayout />,
              children: [{ index: true, Component: CallJoin }],
            },
            {
              path: '/agent/:address',
              element: <AppLayout />,
              children: [{ index: true, Component: AgentChatJoin }],
            },
            {
              path: '/app',
              element: <AppLayout />,
              children: [
                {
                  index: true,
                  element: <Navigate to={defaultLandingPath()} replace />,
                },
                {
                  path: 'chat',
                  Component: Chat,
                },
                // Admin console + help: base app only. Tenant subdomains are
                // chat-only, so these bounce to /app/chat there.
                {
                  element: <BaseAppOnly />,
                  children: [
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
                        // Onboarding: what the owner wants to build, before
                        // any App exists. New accounts land here after sign-up.
                        { path: 'start', Component: StartProject },
                        { path: 'self-hosted', Component: SelfHostedStart },
                        {
                          path: 'billing',
                          Component: AdminBilling,
                        },
                        {
                          path: 'license',
                          Component: AdminLicense,
                        },
                        {
                          path: 'server',
                          Component: AdminServerSettings,
                        },
                        // T&S hub (Trust & Safety): superadmins with write
                        // access; the page shows "not allowed" to others.
                        // Tabs in ?tab=, a quarantine case at quarantine/:caseId.
                        {
                          path: 'trust-safety',
                          Component: AdminTrustSafety,
                        },
                        {
                          path: 'trust-safety/quarantine',
                          Component: QuarantineIndexRedirect,
                        },
                        {
                          path: 'trust-safety/quarantine/:caseId',
                          Component: AdminTrustSafety,
                        },
                        // The former Evidence page and its case links.
                        {
                          path: 'evidence',
                          Component: LegacyEvidenceRedirect,
                        },
                        {
                          path: 'evidence/:caseId',
                          Component: LegacyEvidenceRedirect,
                        },
                        {
                          path: 'agents',
                          Component: AdminAgents,
                        },
                        {
                          path: 'agents/:agentId/settings',
                          Component: AgentSettings,
                        },
                        {
                          path: 'apps/:appId',
                          Component: AdminApp,
                          children: [
                            {
                              // App Home: the next step of the App's goal.
                              index: true,
                              Component: AppHome,
                            },
                            {
                              path: 'assistant',
                              Component: AppAssistant,
                            },
                            {
                              path: 'conversations',
                              Component: AppConversations,
                            },
                            {
                              // This App's chats under its header and tabs
                              // (switches the chat context to the App).
                              path: 'chats',
                              Component: AppChats,
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
                            {
                              path: 'moderation',
                              Component: AppModeration,
                            },
                          ],
                        },
                      ],
                    },

                    {
                      // The hand-written What's new page is gone; the weekly
                      // release notes are on the Help page.
                      path: 'help/whats-new',
                      element: <Navigate to="/app/help" replace />,
                    },
                    {
                      path: 'help',
                      Component: Help,
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
                  path: 'account',
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
