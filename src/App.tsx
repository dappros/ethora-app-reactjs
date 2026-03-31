import hexToRgba from 'hex-to-rgba';
import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { actionGetConfig } from './actions';
import { Loading } from './components/Loading';
import { useCaptureParams } from './hooks/useCaptureParams';
import { useTrackUrl } from './hooks/useTrackUrl';
import { withTracking } from './hooks/withTracking';
import { useAppStore } from './store/useAppStore';
import { initFirebase } from './utils/firebase';
import { useHandleRedirectLogin } from './hooks/useHandleRedirectLogin';

export function Fallback() {
  return <p>Performing initial data load</p>;
}

function resolveRuntimeDomainName() {
  const configuredDomain = String(import.meta.env.VITE_DOMAIN_NAME || '').trim();
  const webDomain = String(import.meta.env.VITE_WEB_DOMAIN || '').trim().toLowerCase();
  const hostedAppsRoot = String(
    import.meta.env.VITE_HOSTED_APPS_ROOT_DOMAIN ||
      import.meta.env.VITE_ROOT_DOMAIN ||
      ''
  )
    .trim()
    .toLowerCase();

  if (typeof window === 'undefined') {
    return configuredDomain;
  }

  const hostname = window.location.hostname.toLowerCase();
  if (!hostname || hostname === 'localhost') {
    return configuredDomain;
  }

  if (webDomain && hostname === webDomain) {
    return configuredDomain;
  }

  if (
    hostedAppsRoot &&
    hostname.endsWith(`.${hostedAppsRoot}`) &&
    hostname !== hostedAppsRoot
  ) {
    const subdomain = hostname.slice(0, -(`.${hostedAppsRoot}`).length);
    if (subdomain && !subdomain.includes('.')) {
      return subdomain;
    }
  }

  return configuredDomain;
}

function App() {
  const currentApp = useAppStore((s) => s.currentApp);

  useEffect(() => {
    actionGetConfig(resolveRuntimeDomainName());
  }, []);

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
