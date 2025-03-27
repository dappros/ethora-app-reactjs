import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {httpGetOneUser} from "../http.ts";
import {actionAfterLogin} from "../actions.ts";

export const useTrackUrl = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const token = localStorage.getItem('token-538');
  const lastPath = localStorage.getItem('lastPath');

  useEffect(() => {
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

    if ((token && token !== 'undefined')  && location.pathname === '/login') {
      navigate(lastPath || '/app/admin/apps', { replace: true });
    }
  }, [location.pathname, navigate]);

  useEffect(() => {
    // alert("here ++")
    const getUrl = async () => {
      if (token) {
        // sleep(1000)
        try {
          const { data } = await httpGetOneUser();
          await actionAfterLogin(data);
        } catch (e) {
          if (
            !location.pathname.startsWith('/tempPassword') ||
            !location.pathname.startsWith('/resetPassword')
          ) {
            navigate('/login');
          }
          console.error(e);
        }
      } else {
        if (
          location.pathname.startsWith('/tempPassword') ||
          location.pathname.startsWith('/resetPassword')
        ) {
          return;
        } else {
          navigate('/login');
        }
      }
    };

    getUrl();
  }, []);
};
