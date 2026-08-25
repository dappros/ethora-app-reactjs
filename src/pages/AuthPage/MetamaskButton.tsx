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
import { logLogin, logSignup } from '../../hooks/withTracking';
import { loginSignature, registerSignature } from '../../http';
import { useAppStore } from '../../store/useAppStore';
import { navigateToUserPage } from '../../utils/navigateToUserPage';
import { useTranslation } from '../../i18n/useTranslation';
import CustomButton from './Button';
import MetamaskIcon from './Icons/socials/metamaskIcon';

const ROOT_DOMAIN = String(import.meta.env.VITE_ROOT_DOMAIN || '').trim();
function setEthoraUserCookie(value: string) {
  const domainPart =
    ROOT_DOMAIN && ROOT_DOMAIN !== 'localhost' ? `; domain=.${ROOT_DOMAIN}` : '';
  document.cookie = `ethora_user=${value}; path=/${domainPart}; secure; samesite=lax; max-age=604800`;
}

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
  utm?: string | null;
}

export const MetamaskButton = ({ utm }: MetamaskButtonProps) => {
  const config = useAppStore((s) => s.currentApp);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [account, setAccount] = useState<string | null>(null);
  const [signer, setSigner] = useState<any>(null);

  const navigate = useNavigate();
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  if (!config) return null;

  const actionAfterMetamask = async (data: any) => {
    logLogin('metamask', data.user._id);
    await actionAfterLogin(data);

    toast.success(t('authMetamaskButton.loginSuccess'));

    setEthoraUserCookie('accregred');

    if (config?.afterLoginPage) {
      navigateToUserPage(navigate, config.afterLoginPage as string);
    }
  };

  const tryLogin = async () => {
    if (!window.ethereum) {
      toast.info(t('authMetamaskButton.installFirst'));
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
        // Unknown wallet. Normally this opens the "tell us your name" dialog
        // and registers; with registration closed there is nothing to open -
        // POST /users would answer 403 REGISTRATION_DISABLED anyway.
        if (config?.userRegistrationDisabled) {
          toast.error(t('authRegistrationClosed.walletNoAccount'));
          return;
        }
        setIsModalOpen(true);
      } else {
        toast.error(t('authMetamaskButton.loginFailed'));
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
      toast.success(t('authMetamaskButton.registerSuccess'));
      logSignup('metamask', res.data?.user?._id);
      setIsModalOpen(false);

      await actionAfterMetamask(res.data);
    } catch (err) {
      toast.error(t('authMetamaskButton.registrationFailed'));
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
        {config?.signonOptions.length < 8 &&
          t('authMetamaskButton.continueLabel')}
      </CustomButton>

      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        maxWidth="xs"
        fullWidth
        sx={{ borderRadius: '48px', padding: '40px 40px' }}
      >
        <DialogTitle>{t('authMetamaskButton.dialogTitle')}</DialogTitle>
        <form onSubmit={handleSubmit(onRegister)}>
          <DialogContent dividers>
            <CustomInput
              label={t('authMetamaskButton.firstNameLabel')}
              fullWidth
              margin="normal"
              {...register('firstName', { required: true })}
              error={!!errors.firstName}
              helperText={
                errors.firstName && t('authMetamaskButton.firstNameRequired')
              }
            />
            <CustomInput
              label={t('authMetamaskButton.lastNameLabel')}
              fullWidth
              margin="normal"
              {...register('lastName', { required: true })}
              error={!!errors.lastName}
              helperText={
                errors.lastName && t('authMetamaskButton.lastNameRequired')
              }
            />
          </DialogContent>
          <DialogActions>
            <CustomButton
              onClick={() => setIsModalOpen(false)}
              variant="outlined"
            >
              {t('authMetamaskButton.cancel')}
            </CustomButton>
            <CustomButton type="submit" variant="contained" color="primary">
              {t('authMetamaskButton.register')}
            </CustomButton>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
};
