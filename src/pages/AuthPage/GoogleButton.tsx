import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
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
import { useEffect, useRef } from 'react';

interface GoogleButtonProps {
  utm?: string | null;
}

export const GoogleButton = ({ utm }: GoogleButtonProps) => {
  const config = useAppStore.getState().currentApp;
  const navigate = useNavigate();

  const isRedirecctRef = useRef(false);

  useEffect(() => {
    isRedirecctRef.current = false;
  }, []);
  
  if (!config) return null;

  const processGoogleLogin = async (user: any, idToken: string, credential: any) => {
    const loginType = 'google';
    
    if (!user.providerData[0].email) {
      toast.error('Email not provided by Google');
      return;
    }
    
    const emailExist = await httpCheckEmailExist(user.providerData[0].email);

    if (emailExist.data.success) {
      console.error('new registration');
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
          return;
        }

        const { firstName, lastName, email } = userResult.data.user;

        logLogin('google', userResult?.data?.user?._id);

        const website = `${window?.location?.origin || ''}/google`;
        const allowedDomains =
          import.meta.env.VITE_APP_ALLOWED_DOMAINS?.split(',') || [];
        const currentDomain = window.location.hostname;

        if (!allowedDomains.includes(currentDomain)) {
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
      });
    } else {
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
      });
    }
  };

  const onGoogleLogin = async () => {
    if (isRedirecctRef.current) return;


      try {
        const creds = await getUserCredsFromGoogle();
        if (creds.user) {
          isRedirecctRef.current = false;
          await processGoogleLogin(creds.user, creds.idToken || '', creds.credential);
        }
      } catch (e) {
        if (e instanceof Error && e.message !== 'Redirect initiated') {
          isRedirecctRef.current = true;
          return;
        }
      }

    try {
      const creds = await getUserCredsFromGoogle();
      await processGoogleLogin(creds.user, creds.idToken || '', creds.credential);
    } catch (e) {
      console.error('here ', e);
      if (e instanceof Error && e.message === 'Redirect initiated') {
        return;
      }
    }
  };
  return (
    <CustomButton
      fullWidth
      variant="outlined"
      startIcon={<GoogleIcon />}
      onClick={() => onGoogleLogin()}
      style={{
        borderColor: config?.primaryColor ? config.primaryColor : '#0052CD',
        color: config?.primaryColor ? config.primaryColor : '#0052CD',
      }}
    >
      Continue with Google
    </CustomButton>
  );
};
