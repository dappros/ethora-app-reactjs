import { useEffect, useState } from 'react';
import { matchPath, useLocation, useNavigate } from 'react-router-dom';
import { actionAfterLogin } from '../actions.ts';
import { httpGetOneUser } from '../http.ts';
import { isTransientRefreshFailure } from '../authRefresh.ts';

const publicPaths = ['/register', '/resetPassword', '/tempPassword', '/turnstile', '/wp-setup'];

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
    
          if (isTransientRefreshFailure(e)) {
            console.warn('[useTrackUrl] transient refresh failure, session kept', e);
            return;
          }
          if (e?.response?.status === 401 || e?.response?.status === 400) {
            localStorage.removeItem('token-538');
            localStorage.removeItem('refreshToken-538');
            if (!isResetPassword && !isTempPassword) {
              navigate(`/login${location.search}`, { replace: true });
            }
            console.error(e);
            return;
          }
          console.error(e);
        }
      } else {
        if (publicPath) {
          return;
        }
        if (location.pathname !== '/login') {
          navigate(`/login${location.search}`, { replace: true });
        }
      }
    };

    getUrl();
    // Run ONCE per app load, not on every location change. The chat-component
    // rewrites the URL with ?chatId=... as it resolves the active room
    // (setRoomJidInPath: true); re-running this on every such change used to
    // call actionAfterLogin() again each time, producing a brand-new
    // currentUser object even though nothing changed. XmppProviderBridge's
    // config is memoized on currentUser (main.tsx), so each spurious update
    // tore down and rebuilt the whole XmppProvider/chat tree - the source of
    // the violent first-load flicker and DOM reconciliation errors.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
