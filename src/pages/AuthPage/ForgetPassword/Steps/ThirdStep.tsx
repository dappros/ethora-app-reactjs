import { Box, TextField, Typography } from '@mui/material';
import { isAxiosError } from 'axios';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import PasswordInput from '../../../../components/input/PasswordInput';
import { httpResetPassword } from '../../../../http';
import { useTranslation } from '../../../../i18n/useTranslation';
import { useAppStore } from '../../../../store/useAppStore';
import CustomButton from '../../Button';

interface Inputs {
  newPassword: string;
  repeatPassword: string;
  mfaCode: string;
}
const ThirdStep: React.FC = () => {
  const config = useAppStore((s) => s.currentApp);
  const [loading, setLoading] = useState(false);
  const [methods, setMethods] = useState<string[] | null>(null);
  const [attemptsLeft, setAttemptsLeft] = useState<number | null>(null);
  const [invalidCode, setInvalidCode] = useState(false);
  const [invalidToken, setInvalidToken] = useState(false);
  const { token } = useParams();
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<Inputs>();

  const navigate = useNavigate();

  const onSubmit = async (data: Inputs) => {
    if (!token) {
      toast.error(t('authForgetPasswordThirdStep.badResetUrl'));
      navigate('/login');
      return;
    }
    setLoading(true);
    try {
      await httpResetPassword(token, data.newPassword, methods ? data.mfaCode.trim() : undefined);
      toast.success(t('authForgetPasswordThirdStep.resetSuccess'));
      navigate('/login');
    } catch (error: unknown) {
      const response = isAxiosError(error) ? error.response : undefined;
      const body = response?.data as { code?: string; error?: string; details?: { methods?: string[]; attemptsLeft?: number } } | undefined;
      if (response?.status === 403 && body?.code === 'MFA_REQUIRED') {
        setMethods(Array.isArray(body.details?.methods) ? body.details.methods : []);
        setInvalidCode(false);
      } else if (body?.code === 'MFA_CODE_INVALID') {
        setInvalidCode(true);
        setAttemptsLeft(typeof body.details?.attemptsLeft === 'number' ? body.details.attemptsLeft : null);
      } else if (body?.code === 'RESET_TOKEN_INVALID') {
        setInvalidToken(true);
      } else {
        toast.error(body?.error || t('authForgetPasswordThirdStep.requestFailed'));
      }
    } finally {
      setLoading(false);
    }
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
            color: 'rgb(var(--c-gray-950))',
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
                value: 6,
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
                value: 6,
                message: t('authForgetPasswordThirdStep.passwordMinLength'),
              },
              validate: (value) => value === getValues('newPassword') || t('authForgetPasswordThirdStep.passwordMismatch'),
            })}
            error={Boolean(errors.repeatPassword)}
            helperText={errors.repeatPassword?.message}
            sx={{ flex: 1, width: '100%' }}
          />
        </Box>
        {methods && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography>
              {methods.includes('totp') && methods.includes('backup')
                ? t('authForgetPasswordThirdStep.mfaEither')
                : methods.includes('backup')
                  ? t('authForgetPasswordThirdStep.mfaBackup')
                  : t('authForgetPasswordThirdStep.mfaAuthenticator')}
            </Typography>
            <TextField
              label={t('authForgetPasswordThirdStep.mfaLabel')}
              autoFocus
              fullWidth
              inputProps={{ autoComplete: 'one-time-code', maxLength: 64 }}
              {...register('mfaCode', { required: t('authMfaStep.codeRequired'), validate: (value) => Boolean(value.trim()) || t('authMfaStep.codeRequired'), onChange: () => setInvalidCode(false) })}
              error={Boolean(errors.mfaCode) || invalidCode}
              helperText={errors.mfaCode?.message || (invalidCode ? t('authForgetPasswordThirdStep.mfaInvalid') : '')}
            />
            {attemptsLeft !== null && (
              <Typography role="status" color="error">
                {t('authForgetPasswordThirdStep.attemptsLeft').replace('{count}', String(attemptsLeft))}
              </Typography>
            )}
          </Box>
        )}
        {invalidToken && (
          <Typography role="alert" color="error">
            {t('authForgetPasswordThirdStep.tokenInvalid')} <Link to="/resetPassword">{t('authForgetPasswordThirdStep.requestNewLink')}</Link>
          </Typography>
        )}
        <CustomButton
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          loading={loading}
          disabled={loading || invalidToken}
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
