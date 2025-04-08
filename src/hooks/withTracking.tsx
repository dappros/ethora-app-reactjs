import Clarity from '@microsoft/clarity';
import { ComponentType, useEffect, useState } from 'react';
import { useAppStore } from '../store/useAppStore.ts';

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dataLayer: any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    gtag: (...args: any[]) => void;
  }
}

export const initializeGA4 = (measurementId: string) => {
  if (!measurementId) {
    console.warn('Missing GA4 Measurement ID');
    return;
  }

  const gtagScript = document.createElement('script');
  gtagScript.src = 'https://www.googletagmanager.com/gtag/js?id=G-M8SFB5QEGX';
  gtagScript.async = true;
  document.head.appendChild(gtagScript);

  const inlineScript = document.createElement('script');
  inlineScript.innerHTML = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-M8SFB5QEGX', { debug_mode: true });
  `;
  document.head.appendChild(inlineScript);
};

export const initializeGTM = (gtmId: string) => {
  if (!gtmId) {
    console.warn('Missing GTM container ID');
    return;
  }

  const gtmScript = document.createElement('script');
  gtmScript.type = 'text/javascript';
  gtmScript.textContent = `
    (function(w,d,s,l,i){
      w[l]=w[l]||[];
      w[l].push({'gtm.start': new Date().getTime(),event:'gtm.js'});
      var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),
          dl=l!='dataLayer'?'&l='+l:'';
      j.async=true;
      j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
      f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','${gtmId}');
  `;
  document.head.appendChild(gtmScript);

  const gtmNoscript = document.createElement('noscript');
  gtmNoscript.innerHTML = `
    <iframe src="https://www.googletagmanager.com/ns.html?id=${gtmId}"
    height="0" width="0" style="display:none;visibility:hidden"></iframe>
  `;
  document.body.appendChild(gtmNoscript);
};

export const initializeClarity = (clarityId: string) => {
  try {
    Clarity.init(clarityId);
  } catch (error) {
    console.error('Microsoft Clarity failed to start', error);
  }
};

export function withTracking<T>(Component: ComponentType<T>) {
  return function TrackedComponent(props: T) {
    const [isInitialized, setIsInitialized] = useState(false);
    const config = useAppStore(
      (state) => state.currentApp?.firebaseConfigParsed
    );
    const allowedDomains =
      import.meta.env.VITE_APP_ALLOWED_DOMAINS?.split(',') || [];
    const currentDomain = window.location.hostname;
    const GTM_ID = import.meta.env.VITE_GTM_ID;
    const GA_ID = import.meta.env.VITE_GA_ID;

    useEffect(() => {
      if (!allowedDomains.includes(currentDomain)) {
        console.warn(`Tracking is disabled on ${currentDomain}`);
        return;
      }

      if (isInitialized) return;

      // Google GA and GTM
      initializeGTM(GTM_ID);
      initializeGA4(GA_ID);
      initializeClarity(import.meta.env.VITE_CLARITY_ID);

      setIsInitialized(true);

      return () => {};
    }, [GA_ID, GTM_ID, allowedDomains, config, currentDomain, isInitialized]);

    return <Component {...props} logLogin={logLogin} logLogout={logLogout} />;
  };
}

export const logLogin = (method: string, userId?: string) => {
  return { method, userId };
};

export const logLogout = () => {};
