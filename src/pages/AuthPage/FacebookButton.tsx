import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { actionAfterLogin } from '../../actions';
import { logLogin, logSignup } from '../../hooks/withTracking.tsx';
import {
  httpCheckEmailExist,
  httpLoginSocial,
  httpRegisterSocial,
  sendHSFormData,
} from '../../http';
import { useAppStore } from '../../store/useAppStore';
import { navigateToUserPage } from '../../utils/navigateToUserPage';
import { useTranslation } from '../../i18n/useTranslation';
import CustomButton from './Button.tsx';
import { getUserCredsFromFacebook } from './firebase';
import FacebookIcon from './Icons/socials/facebookIcon';

const HUBSPOT_ENABLED = String(import.meta.env.VITE_HUBSPOT_ENABLED || '').toLowerCase() === 'true';
const HUBSPOT_PORTAL_ID = String(import.meta.env.VITE_HUBSPOT_PORTAL_ID || '').trim();
const HUBSPOT_FORM_ID_SIGNUP = String(import.meta.env.VITE_HUBSPOT_FORM_ID_SIGNUP || '').trim();

export const FacebookButton = () => {
  const config = useAppStore((s) => s.currentApp);
  const navigate = useNavigate();
  const { t } = useTranslation();

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
          toast.error(t('authFacebookButton.emailNotProvided'));
          return;
        }

        let shouldRegister = false;
        try {
          const emailExist = await httpCheckEmailExist(email);
          shouldRegister = Boolean(emailExist.data.success);
        } catch (error: any) {
          const errorCode = error?.response?.data?.code;
          if (error?.response?.status === 422 && errorCode === 'EMAIL_ALREADY_EXISTS') {
            shouldRegister = false;
          } else {
            throw error;
          }
        }

        // Registration closed: this button is login-only. Never fall into the
        // register path - say plainly that there is no account and stop.
        if (shouldRegister && config?.userRegistrationDisabled) {
          toast.error(t('authRegistrationClosed.socialNoAccount'));
          return;
        }

        if (shouldRegister) {
          try {
            const userResult = await httpRegisterSocial(
              idToken ?? '',
              credential?.accessToken ?? '',
              '',
              loginType
            );
            const { firstName, lastName, email } = userResult?.data?.user;

            logSignup('facebook', userResult?.data?.user?._id, userResult?.data?.user?.email);

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
            toast.error(t('authFacebookButton.registrationFailed'));
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
      {config?.signonOptions.length < 3 &&
        t('authFacebookButton.continueLabel')}
    </CustomButton>
  );
};
