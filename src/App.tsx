import { usePushNotifications } from '@ethora/chat-component';
import hexToRgba from 'hex-to-rgba';
import { useEffect, useMemo } from 'react';
import { Outlet } from 'react-router-dom';
import { actionGetConfig } from './actions';
import { Loading } from './components/Loading';
import { buildPushNotificationsConfig } from './config/chatBootstrap';
import { useCaptureParams } from './hooks/useCaptureParams';
import { useTrackUrl } from './hooks/useTrackUrl';
import { withTracking } from './hooks/withTracking';
import { useAppStore } from './store/useAppStore';
import { initFirebase } from './utils/firebase';
import { useHandleRedirectLogin } from './hooks/useHandleRedirectLogin';

export function Fallback() {
  return <p>Performing initial data load</p>;
}

function getBootstrapDomainName(): string | undefined {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const hostedRoot = import.meta.env.VITE_HOSTED_APPS_ROOT_DOMAIN?.trim();

    // On a hosted-apps subdomain (e.g. tenant.chat.ethora.com),
    // always derive from the URL -- the build-time VITE_DOMAIN_NAME
    // is the base app's slug and must not override tenant identity.
    if (hostedRoot && hostname.endsWith('.' + hostedRoot)) {
      const subdomain = hostname.slice(0, -(hostedRoot.length + 1));
      if (subdomain && !subdomain.includes('.')) {
        return subdomain;
      }
    }

    if (!hostname || hostname === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
      return import.meta.env.VITE_DOMAIN_NAME?.trim() || undefined;
    }
  }

  const configuredDomain = import.meta.env.VITE_DOMAIN_NAME?.trim();
  if (configuredDomain) {
    return configuredDomain;
  }

  if (typeof window === 'undefined') {
    return undefined;
  }

  const [subdomain] = window.location.hostname.split('.');
  return subdomain || undefined;
}

function App() {
  const currentApp = useAppStore((s) => s.currentApp);

  useEffect(() => {
    actionGetConfig(getBootstrapDomainName());
  }, []);

  const pushConfig = useMemo(() => buildPushNotificationsConfig(), []);
  usePushNotifications({
    enabled: pushConfig.enabled,
    softAsk: pushConfig.softAsk,
    firebaseConfig: pushConfig.firebaseConfig,
    vapidPublicKey: import.meta.env.VITE_VAPID_PUBLIC_KEY,
  });

  useEffect(() => {
    if (currentApp) {
      initFirebase();
    }
  }, [currentApp]);


  useEffect(() => {
    if (currentApp) {
      const primaryColor = currentApp.primaryColor;
      document.documentElement.style.setProperty(
        '--bg-brand-primary',
        primaryColor
      );
      document.documentElement.style.setProperty(
        '--bg-auth-background',
        hexToRgba(primaryColor, '0.05')
      );
      const res = hexToRgba(primaryColor);
      if (res) {
        const match = res.match(/\d+(\.\d+)?/g);
        if (match) {
          const arr = match.map(Number);
          let [r, g, b] = arr;
          const [a] = arr;
          r = Math.ceil(r * 0.8);
          g = Math.ceil(g * 0.8);
          b = Math.ceil(b * 0.8);
          const newColor = `rgba(${r},${g},${b},${a})`;
          document.documentElement.style.setProperty(
            '--brand-darker',
            newColor
          );
        }
      }
    }
  }, [currentApp]);

  useCaptureParams();
  useTrackUrl();
  useHandleRedirectLogin();

  if (!currentApp) {
    return <Loading></Loading>;
  } else {
    return <Outlet />;
  }
}

export default withTracking(App);
