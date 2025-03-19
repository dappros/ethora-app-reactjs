import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { actionAfterLogin } from '../../actions';
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
import {logLogin} from "../../hooks/withTracking.tsx";

export const GoogleButton = () => {
  const config = useAppStore.getState().currentApp;
  const navigate = useNavigate();
  const onGoogleLogin = async () => {
    try {
      console.log('google login');
      const loginType = 'google';
      let user, idToken, credential;
      try {
        const creds = await getUserCredsFromGoogle();
        user = creds.user;
        idToken = creds.idToken;
        credential = creds.credential;
      } catch (e) {
        console.log('here ', e);
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
          console.log('new registration');
          try {
            const userResult = await httpRegisterSocial(
              idToken ?? '',
              credential?.accessToken ?? '',
              '',
              loginType
            );
            const { firstName, lastName, email } = userResult?.data?.user;

            console.log('userResult', userResult)

            logLogin("google", userResult?.data?.user?.user._id);

            const website = `${window?.location?.origin || ''}/google`;
            const allowedDomains =
              import.meta.env.REACT_APP_ALLOWED_DOMAINS?.split(",") || [];
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
          } catch (error) {
            toast.error('Social registration failed');
          }

          httpLoginSocial(
            idToken ?? '',
            credential?.accessToken ?? '',
            loginType
          ).then(async ({ data }) => {
            await actionAfterLogin(data);
            navigateToUserPage(navigate, config?.afterLoginPage);
          });
        } else {
          console.log('existing user');
          httpLoginSocial(
            idToken ?? '',
            credential?.accessToken ?? '',
            loginType
          ).then(async ({ data }) => {
            logLogin("google", data.user._id);

            await actionAfterLogin(data);
            navigateToUserPage(navigate, config?.afterLoginPage);
          });
        }
      }
    } catch (error) {
      console.log('++ ', error);
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
