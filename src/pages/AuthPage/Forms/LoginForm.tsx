import { Box, Typography } from '@mui/material';
import React, { useState } from 'react';

import { Link } from 'react-router-dom';
import { SuspendedAccountPanel } from '../../../components/SuspendedAccountPanel';
import { useTranslation } from '../../../i18n/useTranslation';
import { ModelSuspensionNotice } from '../../../models';
import { useAppStore } from '../../../store/useAppStore';
import LoginStep, { MfaPending } from '../Login/Steps/LoginForm';
import MfaStep from '../Login/Steps/MfaStep';
import { authCardTitleSx } from '../authLayout';
import SignInCard from './SignInCard';

interface SignInFormProps {
  isMobile?: boolean;
  // Card hugs its content (centered welcome layout).
  hug?: boolean;
}

const SignInForm: React.FC<SignInFormProps> = ({ isMobile = false, hug = false }) => {
  const { t } = useTranslation();

  const config = useAppStore((s) => s.currentApp);
  // Set when the password step came back with an MFA pending token.
  const [mfaPending, setMfaPending] = useState<MfaPending | null>(null);
  // Set when a sign-in answered 403 USER_SUSPENDED: the card is replaced by
  // the blocking "Account suspended" panel until the user goes back.
  const [suspension, setSuspension] = useState<ModelSuspensionNotice | null>(null);

  if (!config) {
    return null;
  }

  if (suspension) {
    return (
      <SuspendedAccountPanel
        notice={suspension}
        onBack={() => {
          setSuspension(null);
          setMfaPending(null);
        }}
      />
    );
  }

  return (
    <SignInCard isMobile={isMobile} hug={hug}>
      <Box sx={{ display: 'flex', gap: '24px', flexDirection: 'column' }}>
        <Box
          sx={{
            position: 'relative',
            width: '100%',
          }}
        >
          <Typography
            variant="h4"
            align="center"
            gutterBottom
            sx={authCardTitleSx}
          >
            {mfaPending ? t('authMfaStep.title') : t('authLoginForm.title')}
          </Typography>
        </Box>
        {mfaPending ? (
          <MfaStep pending={mfaPending} onBack={() => setMfaPending(null)} onSuspended={setSuspension} />
        ) : (
          <LoginStep onMfaRequired={setMfaPending} onSuspended={setSuspension} />
        )}
      </Box>
      {/* No sign-up entry point when the app has closed self-service
          registration. UX only - /register is guarded in the router and the
          endpoints are gated server-side. */}
      {!config.userRegistrationDisabled && (
        <Typography align="center" component="span" fontSize={'14px'}>
          {t('authLoginForm.noAccount')}{' '}
          <Link to="/register" className="font-medium underline underline-offset-2" style={{ color: config?.primaryColor || '#0052CD' }}>
            {t('authLoginForm.signUp')}
          </Link>
        </Typography>
      )}
    </SignInCard>
  );
};

export default SignInForm;
