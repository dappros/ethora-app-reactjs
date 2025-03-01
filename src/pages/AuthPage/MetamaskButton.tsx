import { toast } from 'react-toastify';
import { useAppStore } from '../../store/useAppStore';
import CustomButton from './Button';
import MetamaskIcon from './Icons/socials/metamaskIcon';

function isMobileDevice() {
  return /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

export const MetamaskButton = () => {
  const config = useAppStore((s) => s.currentApp);

  if (!config) return null;

  const onMetamaskClick = () => {
    // result.activate(injected)
    if (isMobileDevice()) {
      // TODO
    } else {
      // @ts-ignore
      if (typeof window.ethereum !== 'undefined') {
        try {
          // @ts-ignore
          const accounts = window.ethereum.request({
            method: 'eth_requestAccounts',
          });
          // window.ethereum.request({method: ""})
          console.log(accounts[0]);
        } catch (e) {
          console.error('error ', e);
        }
      } else {
        toast.info('Install Metamask first!');
      }
    }
  };

  return (
    <CustomButton
      variant="outlined"
      aria-label="metamask"
      onClick={() => onMetamaskClick()}
      style={{
        backgroundColor: config?.primaryColor ? config.primaryColor : '#0052CD',
        borderColor: '#0052CD',
        color: 'white',
      }}
    >
      <MetamaskIcon />
      {config?.signonOptions.length < 8 && 'Continue with Metamask'}
    </CustomButton>
  );
};
