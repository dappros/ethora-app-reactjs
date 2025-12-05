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

interface GoogleButtonProps {
  utm?: string | null;
}

export const GoogleButton = ({ utm }: GoogleButtonProps) => {
  const config = useAppStore.getState().currentApp;
  const navigate = useNavigate();

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
        const emailExist = await httpCheckEmailExist(
          user.providerData[0].email
        );

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
            localStorage.setItem('newUser', true.toString());

            navigateToUserPage(navigate, config?.afterLoginPage);
          });
        } else {
          console.error('existing user');
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
