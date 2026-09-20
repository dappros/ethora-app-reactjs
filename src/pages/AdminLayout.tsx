import { Navigate, useLocation } from 'react-router-dom';
import { useLicenseStatus } from '../hooks/useLicenseStatus';
import { useAppStore } from '../store/useAppStore';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const location = useLocation();
  const isAdmin = useAppStore((s) => s.currentApp?.isAllowedNewAppCreate);
  const { status } = useLicenseStatus();

  if (!isAdmin) {
    return <Navigate to="/app/chat" state={{ from: location }} replace />;
  }

  // Restricted license: the admin console is locked to the License page so
  // the operator lands on the one screen that fixes the situation. The
  // backend refuses the gated actions regardless; this only shapes the UI.
  if (
    status?.restrictions.adminPanel &&
    !location.pathname.startsWith('/app/admin/license')
  ) {
    return <Navigate to="/app/admin/license" replace />;
  }

  return <>{children}</>;
};

export default AdminLayout;
