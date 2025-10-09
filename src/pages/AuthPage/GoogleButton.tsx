import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useState, useRef } from 'react';
import { actionAfterLogin } from '../../actions';
import { logLogin } from '../../hooks/withTracking.tsx';
import {
  httpCheckEmailExist,
  httpLoginSocial,
  httpRegisterSocial,
  sendHSFormData,
} from '../../http';
import { useAppStore } from '../../store/useAppStore';
import { navigateToUserPage } from '../../utils/navigateToUserPage';
import CustomButton from './Button';
import { getUserCredsFromGoogle } from './firebase';
import GoogleIcon from './Icons/socials/googleIcon';

interface GoogleButtonProps {
  utm?: string | null;
}

export const GoogleButton = ({ utm }: GoogleButtonProps) => {
  const config = useAppStore.getState().currentApp;
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const isProcessingRef = useRef(false);
  const lastClickTimeRef = useRef(0);

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  const onGoogleLogin = async () => {
    const currentTime = Date.now();
    
    if (isLoading || isProcessingRef.current || (currentTime - lastClickTimeRef.current < 1000)) {
      return;
    }
    
    lastClickTimeRef.current = currentTime;
    isProcessingRef.current = true;
    setIsLoading(true);
    try {
      const loginType = 'google';
      let user, idToken, credential;
      try {
        const creds = await getUserCredsFromGoogle();
        user = creds.user;
        idToken = creds.idToken;
        credential = creds.credential;
      } catch (e) {
        console.error(e);
        setIsLoading(false);
        isProcessingRef.current = false;
        return;
      }

      if (user) {
        if (!user.providerData[0].email) {
          toast.error('Email not provided by Google');
          setIsLoading(false);
          isProcessingRef.current = false;
          return;
        }
        const emailExist = await httpCheckEmailExist(
          user.providerData[0].email
        );

        if (emailExist.data.success) {
          try {
            const userResult = await httpRegisterSocial(
              idToken ?? '',
              credential?.accessToken ?? '',
              '',
              loginType,
              '',
              utm || ''
            );

            if (!userResult?.data?.user) {
              toast.error('Social registration failed');
              setIsLoading(false);
              isProcessingRef.current = false;
              return;
            }

            const { firstName, lastName, email } = userResult.data.user;

            logLogin('google', userResult?.data?.user?._id);

            const website = `${window?.location?.origin || ''}/google`;
            const allowedDomains =
              import.meta.env.VITE_APP_ALLOWED_DOMAINS?.split(',') || [];
            const currentDomain = window.location.hostname;

            if (!allowedDomains.includes(currentDomain)) {
              setIsLoading(false);
              isProcessingRef.current = false;
              return;
            }

            const hubspotData = {
              fields: [
                { name: 'firstname', value: firstName },
                { name: 'lastname', value: lastName },
                { name: 'email', value: email },
                { name: 'website', value: website },
              ],
            };

            await sendHSFormData(
              '4732608',
              '1bf4cbda-8d42-4bfc-8015-c41304eabf19',
              hubspotData
            );

            document.cookie =
              'ethora_user=accregred; path=/; domain=.ethora.com; secure; samesite=lax; max-age=604800';
          } catch (error) {
            console.error(error);
            toast.error('Social registration failed');
            setIsLoading(false);
            isProcessingRef.current = false;
            return;
          }

          httpLoginSocial(
            idToken ?? '',
            credential?.accessToken ?? '',
            loginType
          ).then(async ({ data }) => {
            await actionAfterLogin(data);
            document.cookie =
              'ethora_user=accregred; path=/; domain=.ethora.com; secure; samesite=lax; max-age=604800';
            navigateToUserPage(navigate, config?.afterLoginPage);
          }).catch((error) => {
            console.error('Login error:', error);
            toast.error('Login failed');
            setIsLoading(false);
            isProcessingRef.current = false;
          });
        } else {
          httpLoginSocial(
            idToken ?? '',
            credential?.accessToken ?? '',
            loginType
          ).then(async ({ data }) => {

            await actionAfterLogin(data);
            document.cookie =
              'ethora_user=accregred; path=/; domain=.ethora.com; secure; samesite=lax; max-age=604800';
            navigateToUserPage(navigate, config?.afterLoginPage);
          }).catch((error) => {
            console.error('Login error:', error);
            toast.error('Login failed');
            setIsLoading(false);
            isProcessingRef.current = false;
          });
        }
      } else {
        setIsLoading(false);
        isProcessingRef.current = false;
      }
    } catch (error) {
      console.error('++ ', error);
      setIsLoading(false);
      isProcessingRef.current = false;
    }
  };

  const handleIOSClick = (e: React.MouseEvent) => {
    if (isIOS) {
      e.preventDefault();
      e.stopPropagation();
      setTimeout(() => {
        onGoogleLogin();
      }, 50);
    } else {
      onGoogleLogin();
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isIOS) {
      e.preventDefault();
      e.stopPropagation();
      setTimeout(() => {
        onGoogleLogin();
      }, 50);
    }
  };

  return (
    <CustomButton
      fullWidth
      variant="outlined"
      startIcon={<GoogleIcon />}
      onClick={handleIOSClick}
      onTouchStart={handleTouchStart}
      loading={isLoading}
      disabled={isLoading || isProcessingRef.current}
      className={isIOS ? 'ios-button' : ''}
      style={{
        borderColor: config?.primaryColor ? config.primaryColor : '#0052CD',
        color: config?.primaryColor ? config.primaryColor : '#0052CD',
        ...(isIOS && {
          WebkitTapHighlightColor: 'transparent',
          WebkitTouchCallout: 'none',
          WebkitUserSelect: 'none',
          touchAction: 'manipulation',
          cursor: 'pointer',
        }),
      }}
    >
      Continue with Google
    </CustomButton>
  );
};
