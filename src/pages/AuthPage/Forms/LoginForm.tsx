import { Box, Typography } from '@mui/material';
import React from 'react';

import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../../i18n/useTranslation';
import { useAppStore } from '../../../store/useAppStore';
import LoginStep from '../Login/Steps/LoginForm';

interface SignInFormProps {
  isMobile?: boolean;
}

const SignInForm: React.FC<SignInFormProps> = ({ isMobile = false }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const config = useAppStore((s) => s.currentApp);

  if (!config) {
    return null;
  }

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
        // On mobile the card must hug its content: stretching it to the full
        // column height is what pushed the "Don't have an account?" line to
        // the bottom of the screen (space-between over ~200px of dead space)
        // and left the fields pinned to the top. Desktop keeps the fixed
        // 588px card so the split/branded layouts are unchanged.
        maxHeight: isMobile ? 'none' : '588px',
        minHeight: isMobile ? 'auto' : '588px',
        height: isMobile ? 'auto' : '100%',
        justifyContent: 'space-between',
      }}
    >
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
            sx={{
              fontFamily: 'Varela Round',
              fontWeight: 400,
              fontSize: '24px',
              height: '32px',
              color: '#141414',
              m: 0,
            }}
          >
            {t('authLoginForm.title')}
          </Typography>
        </Box>
        <LoginStep />
      </Box>
      <Typography align="center" component="span" fontSize={'14px'}>
        {t('authLoginForm.noAccount')}{' '}
        <Typography
          style={{
            textDecoration: 'underline',
            color: config?.primaryColor ? config.primaryColor : '#0052CD',
            fontSize: '14px',
            display: 'inline',
            cursor: 'pointer',
            fontWeight: '400px',
          }}
          onClick={() => navigate('/register')}
        >
          {t('authLoginForm.signUp')}
        </Typography>
      </Typography>
    </Box>
  );
};

export default SignInForm;
