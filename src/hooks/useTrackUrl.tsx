import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export const useTrackUrl = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token-538');
    const lastPath = localStorage.getItem('lastPath');

    if (!token) {
      if (
        location.pathname.startsWith('/tempPassword') ||
        location.pathname.startsWith('/resetPassword') ||
        location.pathname === '/register'
      ) {
        return;
      } else {
        navigate('/login');
      }
    }

    if (location.pathname === '/') {
      navigate(lastPath || '/app/admin/apps', { replace: true });
      return;
    }

    if ((token && token !== 'undefined') && location.pathname === '/login') {
      navigate(lastPath || '/app/admin/apps', { replace: true });
      return;
    }

    if (isFirstLoad) {
      setIsFirstLoad(false);
    }
  }, [navigate, location.pathname, isFirstLoad]);

  useEffect(() => {
    const token = localStorage.getItem('token-538');
    const lastPath = localStorage.getItem('lastPath');

    if ((token && token !== 'undefined')  && location.pathname === '/login') {
      navigate(lastPath || '/app/admin/apps', { replace: true });
    }
  }, [location.pathname, navigate]);
};
