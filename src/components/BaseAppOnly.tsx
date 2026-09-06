import { Navigate, Outlet } from 'react-router-dom';
import { isBaseAppHost } from '../utils/appHost';

/**
 * Route guard for the admin console. On a tenant app's subdomain the only
 * surface is chat, so typing an /app/admin/... URL by hand (or restoring one
 * from `lastPath`) bounces back to the chat instead of rendering the page.
 */
export function BaseAppOnly() {
  if (!isBaseAppHost()) {
    return <Navigate to="/app/chat" replace />;
  }

  return <Outlet />;
}
