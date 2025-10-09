import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useState } from 'react';
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
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastClickTime, setLastClickTime] = useState(0);
  
  const onGoogleLogin = async () => {
    const currentTime = Date.now();
    
    if (isLoading || isProcessing || (currentTime - lastClickTime < 1000)) {
      console.log('Click blocked - too fast or already processing');
      return;
    }
    
    setLastClickTime(currentTime);
    setIsLoading(true);
    setIsProcessing(true);
    try {
      const loginType = 'google';
      let user, idToken, credential;
      try {
        const creds = await getUserCredsFromGoogle();
        user = creds.user;
        idToken = creds.idToken;
        credential = creds.credential;
      } catch (e) {
        console.log('here ', e);
        setIsLoading(false);
        setIsProcessing(false);
        return;
      }

      if (user) {
        if (!user.providerData[0].email) {
          toast.error('Email not provided by Google');
          setIsLoading(false);
          setIsProcessing(false);
          return;
        }
        const emailExist = await httpCheckEmailExist(
          user.providerData[0].email
        );

        if (emailExist.data.success) {
          console.log('new registration');
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
              setIsProcessing(false);
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
              setIsProcessing(false);
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
          } catch (error: any) {
            console.log(error);
            if (error?.response?.data?.error?.includes('No such customer')) {
              console.log('Stripe customer error, but continuing with login...');
            } else {
              toast.error('Social registration failed');
              setIsLoading(false);
              setIsProcessing(false);
              return;
            }
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
          }).catch((error: any) => {
            console.log('Login error:', error);
            if (error?.response?.data?.error?.includes('No such customer')) {
              console.log('Stripe customer error during login, but user is authenticated');
            } else {
              toast.error('Login failed');
            }
            setIsLoading(false);
            setIsProcessing(false);
          });
        } else {
          console.log('existing user');
          httpLoginSocial(
            idToken ?? '',
            credential?.accessToken ?? '',
            loginType
          ).then(async ({ data }) => {
            logLogin('google', data.user._id);

            await actionAfterLogin(data);
            document.cookie =
              'ethora_user=accregred; path=/; domain=.ethora.com; secure; samesite=lax; max-age=604800';
            navigateToUserPage(navigate, config?.afterLoginPage);
          }).catch((error: any) => {
            console.log('Login error:', error);
            if (error?.response?.data?.error?.includes('No such customer')) {
              console.log('Stripe customer error during login, but user is authenticated');
            } else {
              toast.error('Login failed');
            }
            setIsLoading(false);
            setIsProcessing(false);
          });
        }
      } else {
        setIsLoading(false);
        setIsProcessing(false);
      }
    } catch (error) {
      console.log('++ ', error);
      setIsLoading(false);
      setIsProcessing(false);
    }
  };
  return (
    <CustomButton
      fullWidth
      variant="outlined"
      startIcon={<GoogleIcon />}
      onClick={onGoogleLogin}
      onTouchStart={(e) => {
        e.preventDefault();
        onGoogleLogin();
      }}
      loading={isLoading}
      disabled={isLoading || isProcessing}
      className="no-double-tap"
      style={{
        borderColor: config?.primaryColor ? config.primaryColor : '#0052CD',
        color: config?.primaryColor ? config.primaryColor : '#0052CD',
        touchAction: 'manipulation',
      }}
    >
      Continue with Google
    </CustomButton>
  );
};
