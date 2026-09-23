// Ethora.com platform, copyright: Dappros Ltd (c) 2026, all rights reserved
//
// Second login step for accounts with MFA enabled. The password step got a
// short-lived pending token instead of a session; this exchanges it, with a
// 6-digit authenticator code or a backup code, for the real session and then
// finishes exactly like a single-step login.
import { Box, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import CustomInput from '../../../../components/input/Input';
import { httpVerifyMfaLogin } from '../../../../http.ts';
import { useTranslation } from '../../../../i18n/useTranslation';
import { useAppStore } from '../../../../store/useAppStore';
import { apiError } from '../../../../utils/apiError';
import { finishLogin, MfaPending } from '../../../../utils/finishLogin';
import CustomButton from '../../Button';

type Inputs = { code: string };

interface Props {
  pending: MfaPending;
  onBack: () => void;
}

export default function MfaStep({ pending, onBack }: Props) {
  const navigate = useNavigate();
  const config = useAppStore((s) => s.currentApp);
  const { t } = useTranslation();
  const [busy, setBusy] = useState(false);
  const [useBackup, setUseBackup] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(pending.expiresIn);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setFocus,
  } = useForm<Inputs>();

  useEffect(() => {
    setFocus('code');
  }, [setFocus]);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  const expired = secondsLeft <= 0;

  const onSubmit: SubmitHandler<Inputs> = async ({ code }) => {
    if (expired) return;
    setBusy(true);
    try {
      const { data } = await httpVerifyMfaLogin(pending.mfaToken, code.trim());
      const outcome = await finishLogin(data, navigate, config);
      if (outcome === 'mfa-enrolment-required') {
        toast.info(t('authMfaStep.enrolmentRequiredToast'));
      }
    } catch (error: unknown) {
      const { code, message } = apiError(error, t('authLoginStep.loginFailed'));
      if (code === 'MFA_TOKEN_INVALID') {
        setSecondsLeft(0);
        toast.error(t('authMfaStep.expired'));
      } else if (code === 'MFA_CODE_INVALID') {
        toast.error(t('authMfaStep.invalidCode'));
      } else {
        toast.error(message);
      }
    } finally {
      setBusy(false);
    }
  };

  const primary = config?.primaryColor ? config.primaryColor : '#0052CD';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '24px', minWidth: '320px' }}>
      <Typography sx={{ fontSize: '14px', color: 'rgb(var(--c-gray-950))' }}>
        {useBackup ? t('authMfaStep.backupIntro') : t('authMfaStep.intro')}
      </Typography>
      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        autoComplete="off"
        sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}
      >
        <CustomInput
          fullWidth
          placeholder={useBackup ? t('authMfaStep.backupPlaceholder') : t('authMfaStep.codePlaceholder')}
          inputProps={{
            inputMode: useBackup ? 'text' : 'numeric',
            autoComplete: 'one-time-code',
            maxLength: useBackup ? 12 : 6,
          }}
          {...register('code', {
            required: t('authMfaStep.codeRequired'),
            validate: (v) =>
              useBackup
                ? v.replace(/[^A-Za-z0-9]/g, '').length === 10 || t('authMfaStep.backupInvalidFormat')
                : /^\d{6}$/.test(v.replace(/\s/g, '')) || t('authMfaStep.codeInvalidFormat'),
          })}
          error={Boolean(errors.code)}
          helperText={errors.code?.message}
        />
        <Typography
          style={{ textDecoration: 'underline', color: primary, fontSize: '14px', display: 'inline', cursor: 'pointer' }}
          onClick={() => setUseBackup((v) => !v)}
        >
          {useBackup ? t('authMfaStep.useAuthenticator') : t('authMfaStep.useBackup')}
        </Typography>
        <CustomButton
          fullWidth
          variant="contained"
          color="primary"
          type="submit"
          disabled={busy || expired}
          loading={busy}
          style={{ backgroundColor: primary }}
        >
          {t('authMfaStep.submit')}
        </CustomButton>
        <Typography sx={{ fontSize: '12px', color: 'rgb(var(--c-gray-500))', textAlign: 'center' }}>
          {expired
            ? t('authMfaStep.expired')
            : t('authMfaStep.expiresIn').replace('{seconds}', String(secondsLeft))}
        </Typography>
        <Typography
          style={{ textDecoration: 'underline', color: primary, fontSize: '14px', textAlign: 'center', cursor: 'pointer' }}
          onClick={onBack}
        >
          {t('authMfaStep.back')}
        </Typography>
      </Box>
    </Box>
  );
}
