import { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ModelApp } from './models';
import { useAppStore } from './store/useAppStore';

export default function AppHelmet() {
  // const [isViewFeedback, setIsViewFeedback] = useState<boolean>(false);

  const currentApp = useAppStore((s) => s.currentApp as ModelApp);
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token-538');
  const lastPath = localStorage.getItem('lastPath') || '/app/admin/apps';

  // const handleChangeIsViewFeedback = (value: boolean) => {
  //   setIsViewFeedback(value);
  // };

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

  return (
    <>
      <Helmet>
        <title>
          {currentApp.displayName || 'Ethora - Web3 super app engine'}
        </title>
        <meta
          property="og:title"
          content={currentApp.displayName || 'Ethora - Web3 super app engine'}
        />
      </Helmet>
      {/* <FeedbackButton onClick={handleChangeIsViewFeedback} />
      {isViewFeedback && (
        <FeedbackIframe onClick={handleChangeIsViewFeedback} />
      )} */}
      <Outlet />
    </>
  );
}
