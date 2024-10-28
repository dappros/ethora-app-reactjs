import { Box, Typography } from '@mui/material';
import React from 'react';

import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../../store/useAppStore';
import LoginStep from '../Login/Steps/LoginForm';

interface SignInFormProps {
  isMobile?: boolean;
}

const SignInForm: React.FC<SignInFormProps> = ({ isMobile = false }) => {
  const navigate = useNavigate();

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
        maxHeight: isMobile ? '732px' : '588px',
        minHeight: isMobile ? 'inherit' : '588px',
        height: '100%',
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
            Sign In
          </Typography>
        </Box>
        <LoginStep />
      </Box>
      <Typography align="center" component="span" fontSize={'14px'}>
        Don't have an account?{' '}
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
          Sign Up
        </Typography>
      </Typography>
    </Box>
  );
};

export default SignInForm;
