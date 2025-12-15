import { useEffect, useState } from 'react';
import { matchPath, useLocation, useNavigate } from 'react-router-dom';
import { actionAfterLogin } from '../actions.ts';
import { httpGetOneUser } from '../http.ts';

const publicPaths = ['/register', '/resetPassword', '/tempPassword', '/turnstile'];

export const useTrackUrl = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const token = localStorage.getItem('token-538');
  const lastPath = localStorage.getItem('lastPath');

  const publicPath = publicPaths.filter((path) => {
    const currentPath = location.pathname.split('?')[0];
    return currentPath.startsWith(path);
  })[0];

  useEffect(() => {
    if (!token) {
      if (publicPath) {
        return;
      }
      return navigate(`/login${location.search}`);
    }

    if (location.pathname === '/') {
      navigate(lastPath || '/app/admin/apps', { replace: true });
      return;
    }

    if (token && token !== 'undefined' && location.pathname === '/login') {
      navigate(lastPath || '/app/admin/apps', { replace: true });
      return;
    }

    if (isFirstLoad) {
      setIsFirstLoad(false);
    }
  }, [navigate, location.pathname, isFirstLoad]);

  useEffect(() => {
    if (token && token !== 'undefined' && location.pathname === '/login') {
      navigate(lastPath || '/app/admin/apps', { replace: true });
    }
  }, [location.pathname, navigate]);

  useEffect(() => {
    const getUrl = async () => {
      const isResetPassword = matchPath(
        '/resetPassword/:token?',
        location.pathname
      );
      const isTempPassword = matchPath('/tempPassword', location.pathname);

      if (token && token !== 'undefined') {
        try {
          const { data } = await httpGetOneUser();
          await actionAfterLogin(data);
        } catch (e: any) {
          // If 401/400, token is invalid - clear it and redirect to login
          if (e?.response?.status === 401 || e?.response?.status === 400) {
            localStorage.removeItem('token-538');
            localStorage.removeItem('refreshToken-538');
            if (!isResetPassword && !isTempPassword) {
              navigate(`/login${location.search}`, { replace: true });
            }
          } else if (isResetPassword || isTempPassword) {
            return;
          } else {
            navigate(`/login${location.search}`, { replace: true });
          }
          // Don't log expected auth errors
          if (e?.response?.status !== 401 && e?.response?.status !== 400) {
            console.error(e);
          }
        }
      } else {
        if (publicPath) {
          return;
        }
        // Only navigate if not already on login page to avoid conflicts
        if (location.pathname !== '/login') {
          navigate(`/login${location.search}`, { replace: true });
        }
      }
    };

    getUrl();
  }, [location.pathname, location.search]);
};
