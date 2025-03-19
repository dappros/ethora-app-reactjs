import { Box, Typography } from '@mui/material';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { toast } from 'react-toastify';
import { actionAfterLogin } from '../../../../actions';
import CustomInput from '../../../../components/input/Input';
import PasswordInput from '../../../../components/input/PasswordInput';
import { httpLogingWithEmail } from '../../../../http';
import { useAppStore } from '../../../../store/useAppStore';
import { navigateToUserPage } from '../../../../utils/navigateToUserPage';
import CustomButton from '../../Button';
import { GoogleButton } from '../../GoogleButton';
import { MetamaskButton } from '../../MetamaskButton';
import {logLogin} from "../../../../hooks/withTracking.tsx";

type Inputs = {
  email: string;
  password: string;
};

const LoginStep = () => {
  const navigate = useNavigate();
  const config = useAppStore((s) => s.currentApp);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>();

  const onSubmit: SubmitHandler<Inputs> = ({ email, password }) => {
    httpLogingWithEmail(email, password)
      .then(async ({ data }) => {
        await actionAfterLogin(data);

        logLogin("email", data.user._id);

        if (config?.afterLoginPage) {
          navigateToUserPage(navigate, config.afterLoginPage as string);
        }
      })
      .catch((error) => {
        toast.error(error.response.data.error);
      });
  };

  if (!config) {
    return;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        minWidth: '320px',
      }}
    >
      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        autoComplete="off"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
          flexWrap: 'wrap',
        }}
      >
        <CustomInput
          fullWidth
          placeholder="Email"
          type="email"
          {...register('email', {
            required: 'Email is required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Invalid email address',
            },
          })}
          error={errors['email']?.message ? true : false}
          helperText={errors['email']?.message}
        />
        <PasswordInput
          fullWidth
          placeholder="Password"
          {...register('password', { required: 'Required field' })}
          error={errors['password']?.message ? true : false}
          helperText={errors['password']?.message}
        />
        <Typography
          style={{
            textDecoration: 'underline',
            color: config?.primaryColor ? config.primaryColor : '#0052CD',
            fontSize: '14px',
            display: 'inline',
            cursor: 'pointer',
          }}
          onClick={() => navigate('/resetPassword')}
        >
          Forgot password ?
        </Typography>
        <CustomButton
          fullWidth
          variant="contained"
          color="primary"
          type="submit"
          style={{
            backgroundColor: config?.primaryColor
              ? config.primaryColor
              : '#0052CD',
          }}
        >
          Sign In
        </CustomButton>
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: '27px',
          width: '100%',
        }}
      >
        {config?.signonOptions.length > 1 && (
          <Typography
            sx={{ width: '100%', textAlign: 'center', color: '#8C8C8C' }}
          >
            or
          </Typography>
        )}
        {config?.signonOptions.includes('google') && <GoogleButton />}
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
        {config?.signonOptions.includes('metamask') && <MetamaskButton />}
      </Box>
    </Box>
  );
};

export default LoginStep;
