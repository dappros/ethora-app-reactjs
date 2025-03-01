import { Box, Typography } from '@mui/material';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { httpResendLink } from '../../../../http';
import { useAppStore } from '../../../../store/useAppStore';
import CustomButton from '../../Button';
import SkeletonLoader from '../../SkeletonLoader';

const SecondStep = () => {
  const queryParams = new URLSearchParams(location.search);
  const email = queryParams.get('email');
  const navigate = useNavigate();
  const config = useAppStore((s) => s.currentApp);

  if (!config) {
    return null;
  }

  useEffect(() => {
    if (!email || email === '') {
      navigate('/register');
    }
  }, []);

  const handleResend = () => {
    httpResendLink(email as string)
      .then(() => {
        toast.success('Email has been resent');
      })
      .catch((_) => {
        toast.error('An error occured');
      });
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
        <Typography
          sx={{
            textAlign: 'left',
            fontSize: '24px',
            fontWeight: 400,
            color: '#141414',
          }}
        >
          Confirm your email address
        </Typography>
        <Typography
          sx={{
            textAlign: 'left',
            fontSize: '16px',
            fontWeight: 400,
            color: '#8C8C8C',
          }}
        >
          We`ve sent an email to {email ? email : 'your email'}
        </Typography>
        <Box component="ul" sx={{ paddingLeft: '20px', margin: 0 }}>
          <Typography
            component="li"
            sx={{
              textAlign: 'left',
              fontSize: '16px',
              fontWeight: 400,
              color: '#141414',
              marginBottom: '8px',
            }}
          >
            Just click on the link in the email to continue the registration
            process.
          </Typography>
          <Typography
            component="li"
            sx={{
              textAlign: 'left',
              fontSize: '16px',
              fontWeight: 400,
              color: '#141414',
            }}
          >
            If you don’t see it, check your spam folder.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Typography
            sx={{
              textAlign: 'center',
              fontSize: '14px',
              fontWeight: 400,
              color: '#8C8C8C',
              width: '100%',
            }}
          >
            Still can`t find the email?
          </Typography>
          <CustomButton
            fullWidth
            aria-label="custom"
            onClick={handleResend}
            style={{
              backgroundColor: config?.primaryColor
                ? config.primaryColor
                : '#0052CD',
            }}
          >
            Resend Email
          </CustomButton>
        </Box>
      </Box>
    </SkeletonLoader>
  );
};

export default SecondStep;
