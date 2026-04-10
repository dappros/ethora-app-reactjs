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
import { getUserCredsFromGoogle, IUser } from '../../utils/firebase';
import { navigateToUserPage } from '../../utils/navigateToUserPage';
import CustomButton from './Button';
import GoogleIcon from './Icons/socials/googleIcon';

const ROOT_DOMAIN = String(import.meta.env.VITE_ROOT_DOMAIN || '').trim();
function setEthoraUserCookie(value: string) {
  const domainPart =
    ROOT_DOMAIN && ROOT_DOMAIN !== 'localhost' ? `; domain=.${ROOT_DOMAIN}` : '';
  document.cookie = `ethora_user=${value}; path=/${domainPart}; secure; samesite=lax; max-age=604800`;
}

interface GoogleButtonProps {
  utm?: string | null;
}

export const GoogleButton = ({ utm }: GoogleButtonProps) => {
  const config = useAppStore.getState().currentApp;
  const navigate = useNavigate();

  const loginExistingUser = async (idToken: string, accessToken: string, loginType: string) => {
    const { data } = await httpLoginSocial(idToken, accessToken, loginType);
    logLogin('google', data.user._id);
    await actionAfterLogin(data);
    setEthoraUserCookie('accregred');
    navigateToUserPage(navigate, config?.afterLoginPage);
  };

  const onGoogleLogin = async () => {
    try {
      const loginType = 'google';
      let user, idToken, credential;
      let creds: { user: IUser; idToken: any; credential: any } | undefined;
      try {
        creds = await getUserCredsFromGoogle();
        if (!creds) {
          toast.error('Google login failed');
          return;
        }
        user = creds.user;
        idToken = creds.idToken;
        credential = creds.credential;
      } catch (e) {
        console.error('here ', e);
      }

      if (user) {
        if (!user.providerData[0].email) {
          toast.error('Email not provided by Google');
          return;
        }
        let isNewUser = false;
        try {
          const emailExist = await httpCheckEmailExist(user.providerData[0].email);
          isNewUser = emailExist.data.success === true;
        } catch (error: any) {
          if (error?.response?.status === 422) {
            isNewUser = false;
          } else {
            throw error;
          }
        }

        if (isNewUser) {
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

            const hubspotEnabled = String(import.meta.env.VITE_HUBSPOT_ENABLED || '').toLowerCase() === 'true';
            const portalId = String(import.meta.env.VITE_HUBSPOT_PORTAL_ID || '').trim();
            const formId = String(import.meta.env.VITE_HUBSPOT_FORM_ID_SIGNUP || '').trim();
            if (hubspotEnabled && portalId && formId) {
              const hubspotData = {
                fields: [
                  { name: 'firstname', value: firstName },
                  { name: 'lastname', value: lastName },
                  { name: 'email', value: email },
                  { name: 'website', value: website },
                ],
              };
              await sendHSFormData(portalId, formId, hubspotData);
            }

            setEthoraUserCookie('accregred');
          } catch (error) {
            console.error(error);
            toast.error('Social registration failed');
          }

          await loginExistingUser(
            idToken ?? '',
            credential?.accessToken ?? '',
            loginType
          );
          localStorage.setItem('newUser', true.toString());
        } else {
          console.error('existing user');
          await loginExistingUser(
            idToken ?? '',
            credential?.accessToken ?? '',
            loginType
          );
        }
      }
    } catch (error) {
      console.error('++ ', error);
    }
  };

  return (
    <CustomButton
      fullWidth
      variant="outlined"
      startIcon={<GoogleIcon />}
      onClick={onGoogleLogin}
      style={{
        borderColor: config?.primaryColor ? config.primaryColor : '#0052CD',
        color: config?.primaryColor ? config.primaryColor : '#0052CD',
      }}
    >
      Continue with Google
    </CustomButton>
  );
};
