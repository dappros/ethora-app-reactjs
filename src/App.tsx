import hexToRgba from 'hex-to-rgba';
import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { actionGetConfig } from './actions';
import { Loading } from './components/Loading';
import { useTrackUrl } from './hooks/useTrackUrl';
import { useAppStore } from './store/useAppStore';
import { withTracking } from "./hooks/withTracking";
import { useCaptureParams } from "./hooks/useCaptureParams";

export function Fallback() {
  return <p>Performing initial data load</p>;
}

function App() {
  const currentApp = useAppStore((s) => s.currentApp);

  useEffect(() => {
    actionGetConfig(import.meta.env.VITE_DOMAIN_NAME);
  }, []);

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
          console.log({ newColor });
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

  if (!currentApp) {
    return <Loading></Loading>;
  } else {
    return <Outlet />;
  }
}

export default withTracking(App);
