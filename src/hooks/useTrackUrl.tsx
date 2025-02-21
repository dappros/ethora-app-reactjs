import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export const useTrackUrl = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem('savedUrl', location.pathname + location.search);
  }, [location]);

  useEffect(() => {
    const handlePopState = () => {
      const savedUrl = localStorage.getItem('savedUrl');

      if (
        savedUrl &&
        savedUrl !== window.location.pathname + window.location.search
      ) {
        console.log('window.location.pathname:', window.location.pathname);
        navigate(savedUrl);
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [navigate]);
};
