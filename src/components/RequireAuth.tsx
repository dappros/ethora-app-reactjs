import { Navigate, useLocation } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';

export function RequireAuth({ children }: { children: JSX.Element }) {
  const currentUser = useAppStore((s) => s.currentUser);
  let location = useLocation();

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
