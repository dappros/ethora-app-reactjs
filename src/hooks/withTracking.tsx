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
      console.log(`session duration logged: ${sessionDuration}s`);
    } else {
      console.warn('Session too short (<2s), ignoring.');
    }
  }
};

// <script async src="https://www.googletagmanager.com/gtag/js?id=G-M8SFB5QEGX"></script>
// <script>
//   window.dataLayer = window.dataLayer || [];
//   function gtag(){dataLayer.push(arguments);}
//   gtag('js', new Date());
//
//   gtag('config', 'G-M8SFB5QEGX');
// </script>

const initializeGoogleAnalytics = () => {
  const GTM_ID = import.meta.env.VITE_GTM_ID;
  const GA_ID = import.meta.env.VITE_GA_ID;

  const gtmScript = document.createElement('script');
  gtmScript.type = 'text/javascript';
  gtmScript.textContent = `
    (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer', ${GTM_ID});
  `;
  document.head.appendChild(gtmScript);

  const gaScript = document.createElement('script');
  gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  gaScript.async = true;
  document.head.appendChild(gaScript);

  const inlineScript = document.createElement('script');
  inlineScript.textContent = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', ${GA_ID});
  `;
  document.head.appendChild(inlineScript);

  const gtmNoscript = document.createElement('noscript');
  gtmNoscript.innerHTML = `
    <iframe src="https://www.googletagmanager.com/ns.html?id=${GTM_ID}"
    height="0" width="0" style="display:none;visibility:hidden"></iframe>
  `;
  document.body.insertBefore(gtmNoscript, document.body.firstChild);
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
        console.log('session_start');
        logEvent(analytics, 'session_start');
      }

      try {
        Clarity.init(import.meta.env.VITE_CLARITY_ID);
        console.log('Microsoft Clarity started');
      } catch (error) {
        console.error('Microsoft Clarity failed to start', error);
      }

      initializeGoogleAnalytics();

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

          console.log(`Click tracked: ${elementName} - ${text}`);

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
        console.log('beforeunload');
        logSessionDuration();
      };

      const handleVisibilityChange = () => {
        if (document.visibilityState === 'hidden') {
          console.log('visibilitychange detected!');
          logSessionDuration();
        }
      };

      const handleUnload = () => {
        console.log('unload event triggered!');
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
    }, [config, isInitialized]);

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
      console.log(`Session duration logged: ${sessionDuration}s`);
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
