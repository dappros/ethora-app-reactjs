import { Navigate, useLocation } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const location = useLocation();
  const isAdmin = useAppStore((s) => s.currentApp?.isAllowedNewAppCreate);

  if (!isAdmin) {
    return <Navigate to="/app/chat" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default AdminLayout;
