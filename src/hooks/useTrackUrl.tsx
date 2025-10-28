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

      if (token) {
        try {
          const { data } = await httpGetOneUser();
          await actionAfterLogin(data);
        } catch (e) {
          if (isResetPassword || isTempPassword) {
            return;
          }

          navigate(`/login${location.search}`);
          console.error(e);
        }
      } else {
        if (publicPath) {
          return;
        }
        navigate(`/login${location.search}`);
      }
    };

    getUrl();
  }, []);
};
