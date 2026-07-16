import { Box, Typography } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { actionAfterLogin } from '../../../../actions';
import PasswordInput from '../../../../components/input/PasswordInput';
import { Loading } from '../../../../components/Loading';
import { logSignup } from '../../../../hooks/withTracking';
import { httpLoginWithEmail, setPermanentPassword } from '../../../../http';
import { useTranslation } from '../../../../i18n/useTranslation';
import { useAppStore } from '../../../../store/useAppStore';
import { navigateToUserPage } from '../../../../utils/navigateToUserPage';
import CustomButton from '../../Button';
import SkeletonLoader from '../../SkeletonLoader';

const ROOT_DOMAIN = String(import.meta.env.VITE_ROOT_DOMAIN || '').trim();
function setEthoraUserCookie(value: string) {
  const domainPart =
    ROOT_DOMAIN && ROOT_DOMAIN !== 'localhost' ? `; domain=.${ROOT_DOMAIN}` : '';
  document.cookie = `ethora_user=${value}; path=/${domainPart}; secure; samesite=lax; max-age=604800`;
}

interface Inputs {
  newPassword: string;
  repeatPassword: string;
}

const ThirdStep = () => {
  const [userData, setUserData] = useState({
    email: '',
    tempPassword: '',
  });
  const queryParams = new URLSearchParams(window.location.search);
  const tempPassword = queryParams.get('tempPassword') || '';
  const [loading, setLoading] = useState(false);
  // const [setMaskPassword] = useState<string>('');

  const newPasswordRef = useRef<HTMLInputElement | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<Inputs>();

  const navigate = useNavigate();
  const config = useAppStore((state) => state.currentApp);
  const { t } = useTranslation();

  const newPassword = watch('newPassword');
  const repeatPassword = watch('repeatPassword');

  const [isDisabled, setIsDisabled] = useState(true);

  useEffect(() => {
    if (newPassword === '' || repeatPassword === '') {
      setIsDisabled(true);
    } else if (newPassword !== repeatPassword) {
      setIsDisabled(true);
    } else {
      setIsDisabled(false);
    }
  }, [newPassword, repeatPassword]);

  if (!config) {
    return null;
  }

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const email = queryParams.get('email') || '';
    const tempPassword = queryParams.get('tempPassword') || '';

    if (!tempPassword || tempPassword === '') {
      navigate('/register', { replace: true });
    }

    setUserData({ email, tempPassword });
  }, []);

  useEffect(() => {
    if (typeof userData.tempPassword !== 'string') return;
    if (!userData.tempPassword) return;
    if (userData.tempPassword.length <= 6) return;

    // setMaskPassword(
    //   '*'.repeat(userData.tempPassword.length - 6) +
    //     userData.tempPassword.slice(-6)
    // );
  }, [userData.tempPassword]);

  useEffect(() => {
    if (newPasswordRef.current) {
      newPasswordRef.current.focus();
    }
  }, []);

  const onSubmit = async ({ newPassword, repeatPassword }: Inputs) => {
    const email = queryParams.get('email') || '';

    if (newPassword !== repeatPassword) {
      toast.error(t('authRegisterThirdStep.passwordMismatch'));
      return;
    }
    setLoading(true);
    setPermanentPassword(tempPassword, newPassword)
      .then(() => {
        toast.success(t('authRegisterThirdStep.success'));
        // navigate('/login');

        httpLoginWithEmail(email, newPassword)
          .then(async ({ data }) => {
            setEthoraUserCookie('1');

            await actionAfterLogin(data);

            logSignup('email', data.user._id, data.user?.email);
            if (config?.afterLoginPage) {
              navigateToUserPage(navigate, config.afterLoginPage as string);
            }
          })
          .catch((error) => {
            toast.error(error.response.data.error);
            localStorage.removeItem('token-538');
          });
      })
      .catch(() => {
        toast.error(t('authRegisterThirdStep.error'));
      })
      .finally(() => setLoading(false));
  };

  return (
    <SkeletonLoader loading={false}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
        }}
      >
        <Box
          component="form"
          noValidate
          autoComplete="off"
          onSubmit={handleSubmit(onSubmit)}
          sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}
        >
          <Typography
            sx={{
              textAlign: 'left',
              fontSize: '24px',
              fontWeight: 400,
              color: '#141414',
            }}
          >
            {t('authRegisterThirdStep.title')}
          </Typography>
          <Box
            sx={{
              display: 'flex',
              minWidth: '328px',
              gap: 3,
              flex: 1,
              flexDirection: 'column',
            }}
          >
            {/* <Box
              className="select-none"
              onContextMenu={(e) => e.preventDefault()}
              onCopy={(e) => e.preventDefault()}
            >
              <Box className="text-gray-500 pb-2">{maskPassword}</Box>
              <Box className="text-gray-500 text-xs text-right">
                You can find the temporary password in the verification email.
              </Box>
            </Box> */}
            {/* <PasswordInput
              inputRef={newPasswordRef}
              placeholder={'Enter temporary password'}
              sx={{ flex: 1, width: '100%' }}
              helperText={
                'You can find the temporary password in the verification email.'
              }
              value={maskPassword}
              disabled
              isDisabledPassword
            /> */}
            <PasswordInput
              type="password"
              placeholder={t('authRegisterThirdStep.enterPasswordPlaceholder')}
              sx={{ flex: 1, width: '100%' }}
              {...register('newPassword', { required: t('authRegisterThirdStep.requiredField') })}
              error={!!errors.newPassword}
              helperText={errors.newPassword?.message}
            />
            <PasswordInput
              type="password"
              placeholder={t('authRegisterThirdStep.repeatPasswordPlaceholder')}
              sx={{ flex: 1, width: '100%' }}
              {...register('repeatPassword', { required: t('authRegisterThirdStep.requiredField') })}
              error={!!errors.repeatPassword}
              helperText={errors.repeatPassword?.message}
            />
          </Box>
          <CustomButton
            disabled={isDisabled}
            fullWidth
            variant="contained"
            color="primary"
            type="submit"
            style={{
              backgroundColor: isDisabled
                ? 'rgb(18 141 202 / 69%)'
                : config?.primaryColor
                  ? config.primaryColor
                  : '#0052CD',
              color: '#ffffff',
              cursor: isDisabled ? 'no-drop' : 'pointer',
            }}
          >
            {t('authRegisterThirdStep.submit')}
          </CustomButton>
        </Box>
      </Box>
      {loading && <Loading />}
    </SkeletonLoader>
  );
};

export default ThirdStep;
