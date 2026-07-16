import { Box, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';

import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from '../../../i18n/useTranslation';
import { useAppStore } from '../../../store/useAppStore';
import BackButton from '../BackButton';
import FirstStep from '../ForgetPassword/Steps/FirstStep';
import SecondStep from '../ForgetPassword/Steps/SecondStep';
import ThirdStep from '../ForgetPassword/Steps/ThirdStep';
import CustomStepper from '../Stepper';

interface ForgetPasswordFormProps {
  isMobile: boolean;
}

const ForgetPasswordForm: React.FC<ForgetPasswordFormProps> = ({
  isMobile,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const config = useAppStore((s) => s.currentApp);
  const navigate = useNavigate();
  const { token } = useParams();
  const { t } = useTranslation();

  const steps = [
    <FirstStep setStep={setActiveStep} />,
    <SecondStep setStep={setActiveStep} />,
    <ThirdStep />,
  ];

  const StepComponent: React.FC<{ step: number }> = ({ step }) => {
    return (
      steps[step] || <div>{t('authForgetPasswordForm.stepNotFound')}</div>
    );
  };

  const handleBackButtonClick = () => {
    setActiveStep((prev) => prev - 1);
    navigate('/resetPassword', { replace: true });
  };

  useEffect(() => {
    if (token) {
      setActiveStep(2);
    }
  }, [token]);

  if (!config) {
    return null;
  }

  return (
    <Box
      sx={{
        justifyContent: 'space-between',
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
        maxHeight: isMobile ? '732px' : '588px',
        minHeight: isMobile ? 'inherit' : '588px',
        height: '100%',
        maxWidth: isMobile ? '486px' : '600px',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          gap: '16px',
        }}
      >
        <Box
          sx={{
            position: 'relative',
            width: '100%',
          }}
        >
          {activeStep > 0 && <BackButton onPress={handleBackButtonClick} />}
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
            {t('authForgetPasswordForm.title')}
          </Typography>
        </Box>
        <CustomStepper
          step={activeStep}
          color={config?.primaryColor ? config.primaryColor : '#0052CD'}
        />
        <StepComponent step={activeStep} />
      </Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
          }}
          onClick={() => navigate('/login')}
        >
          <KeyboardBackspaceIcon
            sx={{
              color: config?.primaryColor ? config.primaryColor : '#0052CD',
            }}
          />
          <Typography
            style={{
              color: config?.primaryColor ? config.primaryColor : '#0052CD',
              display: 'inline',
              fontSize: '16px',
              lineHeight: '24px',
            }}
          >
            {t('authForgetPasswordForm.backToSignIn')}
          </Typography>
        </Box>
        <Typography
          align="center"
          component="span"
          sx={{
            fontSize: '14px',
          }}
        >
          {t('authForgetPasswordForm.noAccount')}{' '}
          <Typography
            style={{
              textDecoration: 'underline',
              color: config?.primaryColor ? config.primaryColor : '#0052CD',
              display: 'inline',
              fontSize: '14px',
              cursor: 'pointer',
            }}
            onClick={() => navigate('signUp')}
          >
            {t('authForgetPasswordForm.signUp')}
          </Typography>
        </Typography>
      </Box>
    </Box>
  );
};

export default ForgetPasswordForm;
