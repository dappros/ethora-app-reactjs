
import { useEffect } from 'react';
import { getAuth, getRedirectResult, GoogleAuthProvider, FacebookAuthProvider } from 'firebase/auth';
import { initFirebase } from '../utils/firebase';
import { actionAfterLogin } from '../actions';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAppStore } from '../store/useAppStore';
import { navigateToUserPage } from '../utils/navigateToUserPage';

export const useHandleRedirectLogin = () => {
  const navigate = useNavigate();
  const config = useAppStore.getState().currentApp;

  useEffect(() => {
    const handleRedirect = async () => {
      const app = initFirebase();
      if (!app) {
        console.warn('Firebase not ready yet. Retrying in 500ms...');
        setTimeout(handleRedirect, 500);
        return;
      }
  
      const auth = getAuth(app);
      try {
        const result = await getRedirectResult(auth);
        if (!result) return;
  
        GoogleAuthProvider.credentialFromResult(result) ||
          FacebookAuthProvider.credentialFromResult(result);
  
        const idToken = await auth.currentUser?.getIdToken();
  
  
        await actionAfterLogin({
          token: idToken,
          user: result.user,
        });
  
        navigateToUserPage(navigate, config?.afterLoginPage);
      } catch (err) {
        console.error('Redirect login error:', err);
        toast.error('Login failed after redirect');
      }
    };
  
    handleRedirect();
  }, [config]);
  
};
