import { Box, Typography } from '@mui/material';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import PasswordInput from '../../../../components/input/PasswordInput';
import { httpResetPassword } from '../../../../http';
import { useTranslation } from '../../../../i18n/useTranslation';
import { useAppStore } from '../../../../store/useAppStore';
import CustomButton from '../../Button';

interface ThirdStepProps {}

interface Inputs {
  newPassword: string;
  repeatPassword: string;
}
const ThirdStep: React.FC<ThirdStepProps> = ({}) => {
  const config = useAppStore((s) => s.currentApp);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>();

  const navigate = useNavigate();

  const getTokenFromUrl = (): string | null => {
    const url = window.location.href;
    const match = url.match(/resetPassword\/([a-f0-9]{24})/);
    return match ? match[1] : null;
  };

  const onSubmit = (data: Inputs) => {
    setLoading(true);
    const token = getTokenFromUrl();
    if (!token) {
      toast.error(t('authForgetPasswordThirdStep.badResetUrl'));
      setLoading(false);
      navigate('/login');
      return;
    }
    httpResetPassword(token, data.newPassword)
      .then(() => {
        toast.success(t('authForgetPasswordThirdStep.resetSuccess'));
        navigate('/login');
      })
      .catch((error) => {
        if (
          error.response &&
          error.response.status === 400 &&
          error.response.data.errors
        ) {
          const errors = [];

          for (const e of error.response.data.errors) {
            if (e.msg) {
              errors.push(e.msg);
            }
          }
          // @ts-ignore
          toast.error(t('authForgetPasswordThirdStep.error'), errors.join(', '));
        }
        toast.error(t('authForgetPasswordThirdStep.error'), error.response.data.error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
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
        sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}
        onSubmit={handleSubmit(onSubmit)}
      >
        <Typography
          sx={{
            textAlign: 'left',
            fontSize: '24px',
            fontWeight: 400,
            color: '#141414',
          }}
        >
          {t('authForgetPasswordThirdStep.title')}
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
          <PasswordInput
            placeholder={t('authForgetPasswordThirdStep.newPasswordPlaceholder')}
            {...register('newPassword', {
              required: t('authForgetPasswordThirdStep.passwordRequired'),
              minLength: {
                value: 4,
                message: t('authForgetPasswordThirdStep.passwordMinLength'),
              },
            })}
            error={Boolean(errors.newPassword)}
            helperText={errors.newPassword?.message}
            sx={{ flex: 1, width: '100%' }}
          />
          <PasswordInput
            placeholder={t('authForgetPasswordThirdStep.repeatPasswordPlaceholder')}
            {...register('repeatPassword', {
              required: t('authForgetPasswordThirdStep.passwordRequired'),
              minLength: {
                value: 4,
                message: t('authForgetPasswordThirdStep.passwordMinLength'),
              },
            })}
            error={Boolean(errors.repeatPassword)}
            helperText={errors.repeatPassword?.message}
            sx={{ flex: 1, width: '100%' }}
          />
        </Box>
        <CustomButton
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          loading={loading}
          disabled={loading}
          style={{
            backgroundColor: config?.primaryColor
              ? config.primaryColor
              : '#0052CD',
          }}
        >
          {t('authForgetPasswordThirdStep.submit')}
        </CustomButton>
      </Box>
    </Box>
  );
};

export default ThirdStep;
