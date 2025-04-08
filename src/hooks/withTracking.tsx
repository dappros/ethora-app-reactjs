import Clarity from '@microsoft/clarity';
import { getAnalytics, logEvent } from 'firebase/analytics';
import type { FirebaseApp } from 'firebase/app';
import { initializeApp } from 'firebase/app';
import { ComponentType, useEffect, useState } from 'react';
import { useAppStore } from '../store/useAppStore.ts';

interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dataLayer: any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    gtag: (...args: any[]) => void;
  }
}

let firebaseApp: FirebaseApp | null = null;
let analytics: ReturnType<typeof getAnalytics> | null = null;
let sessionStartTime: number | null = null;

const logSessionDuration = () => {
  if (analytics && sessionStartTime) {
    const sessionDuration = (Date.now() - sessionStartTime) / 1000;
    if (sessionDuration >= 2) {
      logEvent(analytics, 'session_duration', { duration: sessionDuration });
    } else {
      console.warn('Session too short (<2s), ignoring.');
    }
  }
};

export const initializeGA4 = (measurementId: string) => {
  if (!measurementId) {
    console.warn('Missing GA4 Measurement ID');
    return;
  }

  const script = document.createElement('script');
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  script.async = true;
  document.head.appendChild(script);

  script.onload = () => {
    window.dataLayer = window.dataLayer || [];

    if (!window.gtag) {
      window.gtag = function (...args) {
        window.dataLayer.push(args);
      };
    }

    window.gtag('js', new Date());
    window.gtag('config', measurementId);

    console.log('GA');
  };
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

  console.log('GTM');
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

      if (!config) {
        console.warn('Firebase config is not available yet');
        return;
      }

      if (isInitialized) return;

      const firebaseConfig: FirebaseConfig = {
        apiKey: config.apiKey,
        authDomain: config.authDomain,
        projectId: config.projectId,
        storageBucket: config.storageBucket,
        messagingSenderId: config.messagingSenderId,
        appId: config.appId,
        measurementId: config.measurementId,
      };

      if (!firebaseApp) {
        firebaseApp = initializeApp(firebaseConfig);
        analytics = getAnalytics(firebaseApp);
        logEvent(analytics, 'session_start');
      }

      try {
        Clarity.init(import.meta.env.VITE_CLARITY_ID);
      } catch (error) {
        console.error('Microsoft Clarity failed to start', error);
      }

      // Google GA and GTM
      initializeGTM(GTM_ID);
      initializeGA4(GA_ID);

      sessionStartTime = Date.now();

      const handleClick = (event: MouseEvent) => {
        let target = event.target as HTMLElement;

        while (
          target &&
          target !== document.body &&
          !target.tagName.match(/^(button|a)$/i) &&
          !target.dataset.track
        ) {
          target = target.parentElement as HTMLElement;
        }

        if (
          target &&
          (target.tagName === 'BUTTON' ||
            target.tagName === 'A' ||
            target.dataset.track)
        ) {
          const elementName = target.tagName.toLowerCase();
          const text = target.textContent?.trim().substring(0, 50) || 'N/A';

          if (analytics) {
            logEvent(analytics, 'click', { element: elementName, text });
          } else {
            console.warn('Click ignored: No valid element found.');
          }
        }
      };

      document.addEventListener('click', (event) => {
        handleClick(event);
      });

      const handleBeforeUnload = () => {
        logSessionDuration();
      };

      const handleVisibilityChange = () => {
        if (document.visibilityState === 'hidden') {
          logSessionDuration();
        }
      };

      const handleUnload = () => {
        logSessionDuration();
      };

      window.addEventListener('beforeunload', handleBeforeUnload);
      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('unload', handleUnload);

      setIsInitialized(true);

      return () => {
        document.removeEventListener('click', handleClick);
        window.removeEventListener('beforeunload', () => {
          handleBeforeUnload();
        });
        logSessionDuration();
      };
    }, [GA_ID, GTM_ID, allowedDomains, config, currentDomain, isInitialized]);

    return <Component {...props} logLogin={logLogin} logLogout={logLogout} />;
  };
}

export const logLogin = (method: string, userId?: string) => {
  if (analytics) {
    logEvent(analytics, 'login', { method, userId });
  }

  if (sessionStartTime) {
    const sessionDuration = (Date.now() - sessionStartTime) / 1000;
    if (sessionDuration < 2) {
      console.warn('Session too short (<2s), ignoring.');
    } else {
      if (analytics) {
        logEvent(analytics, 'session_duration', { duration: sessionDuration });
      }
    }
  }

  logSessionDuration();
  sessionStartTime = Date.now();
};

export const logLogout = () => {
  logSessionDuration();

  if (analytics) {
    logEvent(analytics, 'session_end');
  }
  sessionStartTime = null;
};
