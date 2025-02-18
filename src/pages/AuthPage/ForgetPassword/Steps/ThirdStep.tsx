import { Box, Typography } from '@mui/material';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import PasswordInput from '../../../../components/input/PasswordInput';
import { httpResetPassword } from '../../../../http';
import { useAppStore } from '../../../../store/useAppStore';
import CustomButton from '../../Button';

interface ThirdStepProps {}

interface Inputs {
  newPassword: string;
  repeatPassword: string;
}
const ThirdStep: React.FC<ThirdStepProps> = ({}) => {
  const config = useAppStore((s) => s.currentApp);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>();

  const navigate = useNavigate();

  const getTokenFromUrl = (): string | null => {
    const url = window.location.href;
    const match = url.match(/resetPassword\/([a-f0-9]{24})/);
    return match ? match[1] : null;
  };

  const onSubmit = (data: Inputs) => {
    setLoading(true);
    const token = getTokenFromUrl();
    if (!token) {
      toast.error('Bad reset url. Try reset again');
      setLoading(false);
      navigate('/login');
      return;
    }
    httpResetPassword(token, data.newPassword)
      .then(() => {
        toast.success('Password was successfully reset');
        navigate('/login');
      })
      .catch((error) => {
        if (
          error.response &&
          error.response.status === 400 &&
          error.response.data.errors
        ) {
          const errors = [];

          for (const e of error.response.data.errors) {
            if (e.msg) {
              errors.push(e.msg);
            }
          }
          // @ts-ignore
          toast.error('error', errors.join(', '));
        }
        toast.error('error', error.response.data.error);
      })
      .finally(() => {
        setLoading(false);
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
            fontSize: '24px',
            fontWeight: 400,
            color: '#141414',
          }}
        >
          Set your new password
        </Typography>
        <Box
          sx={{
            display: 'flex',
            minWidth: '328px',
            gap: 3,
            flex: 1,
            flexDirection: 'column',
          }}
        >
          <PasswordInput
            placeholder="Enter New Password"
            {...register('newPassword', {
              required: 'Password is required',
              minLength: {
                value: 4,
                message: 'Password must be at least 4 characters',
              },
            })}
            error={Boolean(errors.newPassword)}
            helperText={errors.newPassword?.message}
            sx={{ flex: 1, width: '100%' }}
          />
          <PasswordInput
            placeholder="Repeat New Password"
            {...register('repeatPassword', {
              required: 'Password is required',
              minLength: {
                value: 4,
                message: 'Password must be at least 4 characters',
              },
            })}
            error={Boolean(errors.repeatPassword)}
            helperText={errors.repeatPassword?.message}
            sx={{ flex: 1, width: '100%' }}
          />
        </Box>
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
          Reset password
        </CustomButton>
      </Box>
    </Box>
  );
};

export default ThirdStep;
