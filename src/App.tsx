import hexToRgba from 'hex-to-rgba';
import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { actionGetConfig } from './actions';
import { Loading } from './components/Loading';
import { router } from './router';
import { useAppStore } from './store/useAppStore';

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
    }
  }, [currentApp]);

  if (!currentApp) {
    return <Loading></Loading>;
  } else {
    return (
      <RouterProvider
        router={router}
        fallbackElement={<Fallback />}
        future={{
          v7_startTransition: true,
        }}
      />
    );
  }
}

export default App;
