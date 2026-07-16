import { Box, Typography } from '@mui/material';
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { httpPostForgotPassword } from '../../../../http';
import { useTranslation } from '../../../../i18n/useTranslation';
import { useAppStore } from '../../../../store/useAppStore';
import CustomButton from '../../Button';

interface SecondStepProps {
  setStep: Dispatch<SetStateAction<number>>;
}

const SecondStep: React.FC<SecondStepProps> = ({ setStep }) => {
  const queryParams = new URLSearchParams(location.search);
  const email = queryParams.get('email');
  const config = useAppStore((s) => s.currentApp);
  const { t } = useTranslation();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timer, setTimer] = useState(60);

  const navigate = useNavigate();

  useEffect(() => {
    if (!email || email === '') {
      navigate('/resetPassword', { replace: true });
      setStep(0);
    }
  }, [email, navigate, setStep]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isSubmitting && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsSubmitting(false);
    }

    return () => clearInterval(interval);
  }, [isSubmitting, timer]);

  if (!email) {
    return null;
  }

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setTimer(60);

    httpPostForgotPassword(email)
      .then(() => {})
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        setIsSubmitting(false);
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
      <Typography
        sx={{
          textAlign: 'left',
          fontSize: '24px',
          fontWeight: 400,
          color: '#141414',
        }}
      >
        {t('authForgetPasswordSecondStep.title')}
      </Typography>
      <Typography
        sx={{
          textAlign: 'left',
          fontSize: '16px',
          fontWeight: 400,
          color: '#8C8C8C',
        }}
      >
        {t('authForgetPasswordSecondStep.sentEmailPrefix')}{' '}
        {email ? email : t('authForgetPasswordSecondStep.yourEmailFallback')}
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
          {t('authForgetPasswordSecondStep.instructionClickLink')}
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
          {t('authForgetPasswordSecondStep.instructionCheckSpam')}
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
          {t('authForgetPasswordSecondStep.stillCantFind')}
        </Typography>
        <CustomButton
          fullWidth
          aria-label="custom"
          onClick={handleSubmit}
          disabled={isSubmitting}
          style={{
            backgroundColor: config?.primaryColor
              ? config.primaryColor
              : '#0052CD',
            color: isSubmitting ? '#e6e1e1' : 'white',
          }}
        >
          {isSubmitting
            ? `${t('authForgetPasswordSecondStep.resendIn')} ${timer}s`
            : t('authForgetPasswordSecondStep.resendEmail')}
        </CustomButton>
      </Box>
    </Box>
  );
};

export default SecondStep;
