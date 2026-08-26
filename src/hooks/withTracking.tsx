import Clarity from '@microsoft/clarity';
import { ComponentType, useEffect, useState } from 'react';
import { phCapture } from '../posthog.ts';
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
  gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  gtagScript.async = true;
  document.head.appendChild(gtagScript);

  const inlineScript = document.createElement('script');
  inlineScript.innerHTML = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${measurementId}', { debug_mode: true });
  `;
  document.head.appendChild(inlineScript);
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
    const GA_ID = import.meta.env.VITE_GA_ID;

    useEffect(() => {
      if (!allowedDomains.includes(currentDomain)) {
        console.warn(`Tracking is disabled on ${currentDomain}`);
        return;
      }

      if (isInitialized) return;

      initializeGA4(GA_ID);
      initializeClarity(import.meta.env.VITE_CLARITY_ID);

      setIsInitialized(true);

      return () => {};
    }, [GA_ID, allowedDomains, config, currentDomain, isInitialized]);

    return <Component {...props} logLogin={logLogin} logLogout={logLogout} />;
  };
}

const toPosthogMethod = (method: string) =>
  method === 'metamask' ? 'wallet' : method;

export const logLogin = (method: string, userId?: string) => {
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'login', {
      method: method,
      user_id: userId,
    });
  }
  phCapture('login_completed', { method: toPosthogMethod(method) });
  return { method, userId };
};

export const logSignup = (method: string, userId?: string, email?: string) => {
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'signup_complete', {
      event_category: 'conversion',
      method: method,
      user_id: userId,
      email_domain: email ? email.split('@')[1] || '' : '',
    });
    // Also fire the standard GA4 sign_up event
    window.gtag('event', 'sign_up', {
      method: method,
    });
  }
  phCapture('signup_completed', { method: toPosthogMethod(method) });
  return { method, userId };
};

export const logLogout = () => {};
