import { useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import {
  matchPath,
  Outlet,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { ModelApp } from './models';
import { useAppStore } from './store/useAppStore';

const PLATFORM_NAME = String(
  import.meta.env.VITE_PLATFORM_NAME || ''
).trim();

// Tab label for each app-shell route. Used to build per-route browser titles
// so multiple Ethora tabs are distinguishable. Keep in sync with router.tsx.
type RouteEntry = { pattern: string; tab: string };
const ROUTE_TABS: RouteEntry[] = [
  // In-context (under a specific App): show "{tab} - {childApp.displayName}"
  { pattern: '/app/admin/apps/:appId/settings', tab: 'Settings' },
  { pattern: '/app/admin/apps/:appId/users', tab: 'Users' },
  { pattern: '/app/admin/apps/:appId/statistics', tab: 'Statistics' },
  { pattern: '/app/admin/apps/:appId', tab: 'App' },
  // Tenant-level admin: show "{tab} - {brand}"
  { pattern: '/app/admin/apps', tab: 'Apps' },
  { pattern: '/app/admin/agents/:agentId/settings', tab: 'Agent Settings' },
  { pattern: '/app/admin/agents', tab: 'Agents' },
  { pattern: '/app/admin/billing', tab: 'Billing' },
  // Other top-level routes
  { pattern: '/app/chat', tab: 'Chats' },
  { pattern: '/app/help', tab: 'Help & Support' },
  { pattern: '/app/profile/edit', tab: 'Edit Profile' },
  { pattern: '/app/profile', tab: 'Profile' },
  { pattern: '/app/account', tab: 'Account' },
];

function matchRoute(pathname: string): {
  tab: string | null;
  appIdParam: string | null;
} {
  for (const entry of ROUTE_TABS) {
    const m = matchPath(entry.pattern, pathname);
    if (m) {
      const appIdParam = (m.params as { appId?: string }).appId || null;
      return { tab: entry.tab, appIdParam };
    }
  }
  return { tab: null, appIdParam: null };
}

export default function AppHelmet() {
  const currentApp = useAppStore((s) => s.currentApp as ModelApp | null);
  const apps = useAppStore((s) => s.apps);
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token-538');
  const lastPath = localStorage.getItem('lastPath') || '/app/admin/apps';

  useEffect(() => {
    if (!token) {
      if (
        location.pathname.startsWith('/tempPassword') ||
        location.pathname.startsWith('/resetPassword') ||
        location.pathname === '/register' ||
        location.pathname === '/turnstile'
      ) {
        return;
      } else {
        navigate('/login');
      }
    }
  }, [token, location.pathname, navigate]);

  useEffect(() => {
    if (
      token &&
      token !== 'undefined' &&
      (location.pathname === '/login' || location.pathname === '/')
    ) {
      navigate(lastPath, { replace: true });
    }
  }, [token, lastPath]);

  const title = useMemo(() => {
    const brand = (currentApp?.displayName || PLATFORM_NAME || 'Ethora').trim();
    const { tab, appIdParam } = matchRoute(location.pathname);

    if (!tab) {
      // Login, register, fallback - just the brand tagline.
      return `${brand} - messaging & AI`;
    }

    // In-context routes: prefer the child app's displayName, fall back to brand
    // if it hasn't loaded into the store yet.
    if (appIdParam) {
      const childApp = apps.find((a) => a._id === appIdParam);
      const ctx = childApp?.displayName || brand;
      return `${tab} - ${ctx}`;
    }

    return `${tab} - ${brand}`;
  }, [location.pathname, currentApp?.displayName, apps]);

  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta property="og:title" content={title} />
      </Helmet>
      <Outlet />
    </>
  );
}
