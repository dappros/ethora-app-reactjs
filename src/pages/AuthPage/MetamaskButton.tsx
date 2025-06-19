import { Web3Provider } from '@ethersproject/providers';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { actionAfterLogin } from '../../actions';
import CustomInput from '../../components/input/Input';
import { logLogin } from '../../hooks/withTracking';
import { loginSignature, registerSignature } from '../../http';
import { useAppStore } from '../../store/useAppStore';
import { navigateToUserPage } from '../../utils/navigateToUserPage';
import CustomButton from './Button';
import MetamaskIcon from './Icons/socials/metamaskIcon';

declare global {
  interface Window {
    ethereum?: any;
  }
}

type FormData = {
  firstName: string;
  lastName: string;
};

interface MetamaskButtonProps {
  utm: string | null;
}

export const MetamaskButton = ({ utm }: MetamaskButtonProps) => {
  const config = useAppStore((s) => s.currentApp);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [account, setAccount] = useState<string | null>(null);
  const [signer, setSigner] = useState<any>(null);

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  if (!config) return null;

  const actionAfterMetamask = async (data: any) => {
    logLogin('metamask', data.user._id);
    await actionAfterLogin(data);

    toast.success('Successfully logged in with Metamask!');

    if (config?.afterLoginPage) {
      navigateToUserPage(navigate, config.afterLoginPage as string);
    }
  };

  const tryLogin = async () => {
    if (!window.ethereum) {
      toast.info('Install Metamask first!');
      return;
    }

    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new Web3Provider(window.ethereum);
      const signerInstance = provider.getSigner();
      const acc = await signerInstance.getAddress();
      setAccount(acc);
      setSigner(signerInstance);

      const loginMessage = 'Login';
      const loginSig = await signerInstance.signMessage(loginMessage);
      const loginResponse = await loginSignature(acc, loginSig, loginMessage);

      const user = loginResponse.data?.user;
      if (user) {
        await actionAfterMetamask(loginResponse.data);
      } else {
        throw new Error('No user in response');
      }
    } catch (err: any) {
      const errorData = err.response?.data;
      if (
        errorData?.errors?.[0]?.msg === 'no extWalletRecord for walletAddres'
      ) {
        setIsModalOpen(true);
      } else {
        toast.error('Failed to sign with Metamask.');
        console.error(err);
      }
    }
  };

  const onRegister = async (data: FormData) => {
    try {
      const message = 'Register';
      const sig = await signer.signMessage(message);
      const res = await registerSignature(
        account!,
        sig,
        message,
        data.firstName,
        data.lastName,
        utm || ''
      );
      toast.success('Successfully registered with Metamask!');
      setIsModalOpen(false);

      await actionAfterMetamask(res.data);
    } catch (err) {
      toast.error('Registration failed.');
      console.error(err);
    }
  };

  return (
    <>
      <CustomButton
        variant="outlined"
        aria-label="metamask"
        onClick={tryLogin}
        style={{
          backgroundColor: config?.primaryColor || '#0052CD',
          borderColor: '#0052CD',
          color: 'white',
        }}
      >
        <MetamaskIcon />
        {config?.signonOptions.length < 8 && 'Continue with Metamask'}
      </CustomButton>

      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        maxWidth="xs"
        fullWidth
        sx={{ borderRadius: '48px', padding: '40px 40px' }}
      >
        <DialogTitle>Register with Metamask</DialogTitle>
        <form onSubmit={handleSubmit(onRegister)}>
          <DialogContent dividers>
            <CustomInput
              label="First Name"
              fullWidth
              margin="normal"
              {...register('firstName', { required: true })}
              error={!!errors.firstName}
              helperText={errors.firstName && 'First name is required'}
            />
            <CustomInput
              label="Last Name"
              fullWidth
              margin="normal"
              {...register('lastName', { required: true })}
              error={!!errors.lastName}
              helperText={errors.lastName && 'Last name is required'}
            />
          </DialogContent>
          <DialogActions>
            <CustomButton
              onClick={() => setIsModalOpen(false)}
              variant="outlined"
            >
              Cancel
            </CustomButton>
            <CustomButton type="submit" variant="contained" color="primary">
              Register
            </CustomButton>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
};
