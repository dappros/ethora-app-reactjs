import { Box, Typography } from '@mui/material';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { toast } from 'react-toastify';
import { actionAfterLogin } from '../../../../actions';
import CustomInput from '../../../../components/input/Input';
import PasswordInput from '../../../../components/input/PasswordInput';
import { logLogin } from '../../../../hooks/withTracking.tsx';
import { httpLoginWithEmail } from '../../../../http.ts';
import { useTranslation } from '../../../../i18n/useTranslation';
import { useAppStore } from '../../../../store/useAppStore';
import { navigateToUserPage } from '../../../../utils/navigateToUserPage';
import CustomButton from '../../Button';
import { GoogleButton } from '../../GoogleButton';
import { MetamaskButton } from '../../MetamaskButton';

const ROOT_DOMAIN = String(import.meta.env.VITE_ROOT_DOMAIN || '').trim();
function setEthoraUserCookie(value: string) {
  const domainPart =
    ROOT_DOMAIN && ROOT_DOMAIN !== 'localhost' ? `; domain=.${ROOT_DOMAIN}` : '';
  document.cookie = `ethora_user=${value}; path=/${domainPart}; secure; samesite=lax; max-age=604800`;
}

type Inputs = {
  email: string;
  password: string;
};

const LoginStep = () => {
  const navigate = useNavigate();
  const config = useAppStore((s) => s.currentApp);
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>();

  const onSubmit: SubmitHandler<Inputs> = ({ email, password }) => {
    httpLoginWithEmail(email, password)
      .then(async ({ data }) => {
        try {
          if (!data || !data.user) {
            throw new Error('Invalid response from server');
          }
          
          await actionAfterLogin(data);

          logLogin('email', data.user._id);
          setEthoraUserCookie('1');

          if (config?.afterLoginPage) {
            navigateToUserPage(navigate, config.afterLoginPage as string);
          } else {
            // Default navigation if no afterLoginPage is set
            navigate('/');
          }
        } catch (error: any) {
          console.error('Error processing login response:', error);
          toast.error(error?.message || t('authLoginStep.processError'));
        }
      })
      .catch((error) => {
        console.error('Login error:', error);

        let errorMessage = t('authLoginStep.loginFailed');

        if (error.code === 'ECONNABORTED' || error.message === 'Request aborted') {
          errorMessage = t('authLoginStep.timeoutError');
        } else if (error.response) {
          // Server responded with error status
          errorMessage = error.response.data?.error || `${t('authLoginStep.serverErrorPrefix')}: ${error.response.status}`;
        } else if (error.request) {
          // Request was made but no response received
          errorMessage = t('authLoginStep.noResponseError');
        } else {
          errorMessage = error.message || t('authLoginStep.unexpectedError');
        }

        toast.error(errorMessage);
        localStorage.removeItem('token-538');
      });
  };

  if (!config) {
    return null;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        minWidth: '320px',
      }}
    >
      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        autoComplete="off"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
          flexWrap: 'wrap',
        }}
      >
        <CustomInput
          fullWidth
          placeholder={t('authLoginStep.emailPlaceholder')}
          type="email"
          {...register('email', {
            required: t('authLoginStep.emailRequired'),
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: t('authLoginStep.emailInvalid'),
            },
          })}
          error={errors['email']?.message ? true : false}
          helperText={errors['email']?.message}
        />
        <PasswordInput
          fullWidth
          placeholder={t('authLoginStep.passwordPlaceholder')}
          {...register('password', { required: t('authLoginStep.requiredField') })}
          error={errors['password']?.message ? true : false}
          helperText={errors['password']?.message}
        />
        <Typography
          style={{
            textDecoration: 'underline',
            color: config?.primaryColor ? config.primaryColor : '#0052CD',
            fontSize: '14px',
            display: 'inline',
            cursor: 'pointer',
          }}
          onClick={() => navigate('/resetPassword')}
        >
          {t('authLoginStep.forgotPassword')}
        </Typography>
        <CustomButton
          fullWidth
          variant="contained"
          color="primary"
          type="submit"
          style={{
            backgroundColor: config?.primaryColor
              ? config.primaryColor
              : '#0052CD',
          }}
        >
          {t('authLoginStep.submit')}
        </CustomButton>
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: '27px',
          width: '100%',
        }}
      >
        {config?.signonOptions.length > 1 && (
          <Typography
            sx={{ width: '100%', textAlign: 'center', color: '#8C8C8C' }}
          >
            {t('authLoginStep.or')}
          </Typography>
        )}
        {config?.signonOptions.includes('google') && <GoogleButton />}
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
        {config?.signonOptions.includes('metamask') && <MetamaskButton />}
        {/* {config?.signonOptions.includes('facebook') && <FacebookButton />} */}
      </Box>
    </Box>
  );
};

export default LoginStep;
