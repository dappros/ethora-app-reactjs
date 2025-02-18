import { Box, Typography } from '@mui/material';
import { Dispatch, SetStateAction, useState } from 'react';
import { useForm } from 'react-hook-form';
import CustomInput from '../../../../components/input/Input';
import { httpPostForgotPassword } from '../../../../http';
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

  if (!config) {
    return null;
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>();

  const onSubmit = async ({ email }: Inputs) => {
    setLoading(true);
    httpPostForgotPassword(email)
      .then((res) => {
        console.log(res);
        setStep((prev) => prev + 1);
      })
      .catch((err) => {
        console.log(err);
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
          Please, enter your email, and we will send you a link to reset your
          password.
        </Typography>
        <CustomInput
          fullWidth
          placeholder="Email"
          id="email"
          type="email"
          {...register('email', {
            required: 'Email is required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Invalid email address',
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
          Send Email
        </CustomButton>
      </Box>
    </Box>
  );
};

export default FirstStep;
