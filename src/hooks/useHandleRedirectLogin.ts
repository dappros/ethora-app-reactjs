
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
  const config = useAppStore((s) => s.currentApp);

  useEffect(() => {
    if (!config?.firebaseConfigParsed) {
      return;
    }

    let cancelled = false;

    const handleRedirect = async () => {
      const app = initFirebase();
      if (!app) {
        return;
      }
  
      const auth = getAuth(app);
      try {
        const result = await getRedirectResult(auth);
        if (!result || cancelled) return;
  
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

    return () => {
      cancelled = true;
    };
  }, [config, navigate]);
  
};
