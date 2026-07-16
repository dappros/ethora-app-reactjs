import { Box, Typography } from '@mui/material';
import { Dispatch, SetStateAction, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';
import CustomInput from '../../../../components/input/Input';
import { httpPostForgotPassword } from '../../../../http';
import { useTranslation } from '../../../../i18n/useTranslation';
import { useAppStore } from '../../../../store/useAppStore';
import CustomButton from '../../Button';

interface Inputs {
  email: string;
}

interface FirstStepProps {
  setStep: Dispatch<SetStateAction<number>>;
}

const FirstStep = ({ setStep }: FirstStepProps) => {
  const config = useAppStore((s) => s.currentApp);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>();

  if (!config) {
    return null;
  }

  const onSubmit = async ({ email }: Inputs) => {
    setLoading(true);
    httpPostForgotPassword(email)
      .then(() => {
        searchParams.set('email', email);
        setSearchParams(searchParams);
        setStep((prev) => prev + 1);
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
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
            fontSize: '16px',
            fontWeight: 400,
            color: '#8C8C8C',
          }}
        >
          {t('authForgetPasswordFirstStep.description')}
        </Typography>
        <CustomInput
          fullWidth
          placeholder={t('authForgetPasswordFirstStep.emailPlaceholder')}
          id="email"
          type="email"
          {...register('email', {
            required: t('authForgetPasswordFirstStep.emailRequired'),
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: t('authForgetPasswordFirstStep.emailInvalid'),
            },
          })}
          error={Boolean(errors.email)}
          helperText={errors.email?.message}
        />
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
          {t('authForgetPasswordFirstStep.submit')}
        </CustomButton>
      </Box>
    </Box>
  );
};

export default FirstStep;
