import { Box, Typography } from '@mui/material';
import React from 'react';

import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from '../../../i18n/useTranslation';
import { useAppStore } from '../../../store/useAppStore';
import RegisterForm from '../Register/RegisterForm';
import ThirdStep from '../Register/Steps/ThirdStep';

interface SignUpFormProps {
  isMobile?: boolean;
  isSmallDevice?: boolean;
}

const SignUpForm: React.FC<SignUpFormProps> = ({ isMobile = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const config = useAppStore((s) => s.currentApp);
  const { t } = useTranslation();

  // /tempPassword/?email=&tempPassword= is the "choose a permanent password"
  // page (reached from the reset e-mail link, or from the login form after a
  // temporary password was accepted). It shows the set-password step, with
  // its own title, in place of the sign-up form. The old multi-step sign-up
  // used to switch to that step by index; the single-page form that replaced
  // it never did, so this route showed a plain Sign Up form.
  const isTempPassword = location.pathname.includes('tempPassword');

  return (
    <Box
      sx={{
        padding: '16px',
        borderRadius: '24px',
        backgroundColor: 'white',
        boxShadow: isMobile ? 'none' : '0px 4px 35px 0px #00000014',
        p: isMobile ? '0px 16px' : '24px 40px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        minWidth: '300px',
        width: '100%',
        maxWidth: isMobile ? '486px' : '600px',
        // maxHeight: isMobile ? '732px' : '588px',
        // minHeight: isMobile ? 'inherit' : '588px',
        // height: '100%',
        justifyContent: 'space-between',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        <Box
          sx={{
            position: 'relative',
            width: '100%',
          }}
        >
          {!isTempPassword && (
            <Typography
              variant="h4"
              align="center"
              gutterBottom
              sx={{
                fontFamily: 'Varela Round',
                fontWeight: 400,
                fontSize: '24px',
                height: '32px',
                color: '#141414',
                m: 0,
              }}
            >
              {t('authRegisterLayout.title')}
            </Typography>
          )}
        </Box>
        {isTempPassword ? <ThirdStep /> : <RegisterForm />}
      </Box>
      <Typography
        align="center"
        component="span"
        sx={{
          fontSize: '14px',
        }}
      >
        {t('authRegisterLayout.alreadyHaveAccount')}{' '}
        <Typography
          style={{
            textDecoration: 'underline',
            color: config?.primaryColor ? config.primaryColor : '#0052CD',
            display: 'inline',
            fontSize: '14px',
            cursor: 'pointer',
          }}
          onClick={() => navigate('/login')}
        >
          {t('authRegisterLayout.signIn')}
        </Typography>
      </Typography>
    </Box>
  );
};

export default SignUpForm;
