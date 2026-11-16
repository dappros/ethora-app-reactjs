import { useEffect } from 'react';

import { env } from '../config/env';
interface Params {
  utm_ref?: string;
  first_page?: string;
  device_type?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
}

// Campaign tags sent with the sign-up (RegisterForm reads `urlParams`). Added
// after the referrer / first_page fallback below is decided, so that fallback
// behaves exactly as before whether a link carries them or not.
const CAMPAIGN_KEYS = ['utm_source', 'utm_medium', 'utm_campaign'] as const;

export const useCaptureParams = () => {
  useEffect(() => {
    const hasCapturedParams = localStorage.getItem('hasCapturedParams');
    if (hasCapturedParams) return;

    const urlParams = new URLSearchParams(window.location.search);
    const params: Params = {};

    const utmRef = urlParams.get('utm_ref');
    if (utmRef) {
      params.utm_ref = utmRef;
    }

    const firstPage = urlParams.get('first_page');
    if (firstPage) {
      try {
        params.first_page = decodeURIComponent(firstPage);
      } catch {
        params.first_page = firstPage;
      }
    }

    const deviceType = urlParams.get('device_type');
    if (deviceType) {
      params.device_type = deviceType;
    }

    const isAllowedDomain = (() => {
      const allowed =
        env.VITE_APP_ALLOWED_DOMAINS?.split(',') || [];
      const current = window.location.hostname;
      return allowed.includes(current);
    })();

    const isEmpty = Object.keys(params).length === 0;

    if (isAllowedDomain && isEmpty) {
      const utm_ref = document.referrer;
      const fallbackFirstPage = window.location.pathname;
      const ua = navigator.userAgent;

      const isMobile =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          ua
        );
      const fallbackDeviceType = isMobile ? 'mobile' : 'desktop';

      if (utm_ref) {
        params.utm_ref = utm_ref;
      }

      if (fallbackFirstPage) {
        params.first_page = fallbackFirstPage;
      }

      params.device_type = fallbackDeviceType;
    }

    for (const key of CAMPAIGN_KEYS) {
      const value = urlParams.get(key);
      if (value) params[key] = value.slice(0, 200);
    }

    if (Object.keys(params).length > 0) {
      localStorage.setItem('urlParams', JSON.stringify(params));
      localStorage.setItem('hasCapturedParams', 'true');
    }
  }, []);
};
