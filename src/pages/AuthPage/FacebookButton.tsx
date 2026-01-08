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
import CustomButton from './Button.tsx';
import { getUserCredsFromFacebook } from './firebase';
import FacebookIcon from './Icons/socials/facebookIcon';

const HUBSPOT_ENABLED = String(import.meta.env.VITE_HUBSPOT_ENABLED || '').toLowerCase() === 'true';
const HUBSPOT_PORTAL_ID = String(import.meta.env.VITE_HUBSPOT_PORTAL_ID || '').trim();
const HUBSPOT_FORM_ID_SIGNUP = String(import.meta.env.VITE_HUBSPOT_FORM_ID_SIGNUP || '').trim();

export const FacebookButton = () => {
  const config = useAppStore((s) => s.currentApp);
  const navigate = useNavigate();

  if (!config) return null;

  const onFacebookLogin = async () => {
    try {
      const loginType = 'facebook';
      let user, idToken, credential;
      try {
        const creds = await getUserCredsFromFacebook();
        user = creds.user;
        idToken = creds.idToken;
        credential = creds.credential;
      } catch (e) {
        console.error('Facebook login error:', e);
        return;
      }

      if (user) {
        const email = user.providerData[0]?.email;
        if (!email) {
          toast.error('Email not provided by Facebook');
          return;
        }

        const emailExist = await httpCheckEmailExist(email);

        if (emailExist.data.success) {
          try {
            const userResult = await httpRegisterSocial(
              idToken ?? '',
              credential?.accessToken ?? '',
              '',
              loginType
            );
            const { firstName, lastName, email } = userResult?.data?.user;

            logLogin('facebook', userResult?.data?.user?._id);

            const website = `${window?.location?.origin || ''}/facebook`;
            const allowedDomains =
              import.meta.env.VITE_APP_ALLOWED_DOMAINS?.split(',') || [];
            const currentDomain = window.location.hostname;

            if (!allowedDomains.includes(currentDomain)) {
              return;
            }

            if (HUBSPOT_ENABLED && HUBSPOT_PORTAL_ID && HUBSPOT_FORM_ID_SIGNUP) {
              const hubspotData = {
                fields: [
                  { name: 'firstname', value: firstName },
                  { name: 'lastname', value: lastName },
                  { name: 'email', value: email },
                  { name: 'website', value: website },
                ],
              };

              await sendHSFormData(HUBSPOT_PORTAL_ID, HUBSPOT_FORM_ID_SIGNUP, hubspotData);
            }
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
            navigateToUserPage(navigate, config?.afterLoginPage);
          });
        } else {
          httpLoginSocial(
            idToken ?? '',
            credential?.accessToken ?? '',
            loginType
          ).then(async ({ data }) => {
            logLogin('facebook', data.user._id);
            await actionAfterLogin(data);
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
      startIcon={<FacebookIcon />}
      onClick={onFacebookLogin}
      style={{
        borderColor: config?.primaryColor ? config.primaryColor : '#0052CD',
        color: config?.primaryColor ? config.primaryColor : '#0052CD',
      }}
    >
      {config?.signonOptions.length < 3 && 'Continue with Facebook'}
    </CustomButton>
  );
};
