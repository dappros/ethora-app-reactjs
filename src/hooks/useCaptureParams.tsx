import { useEffect } from 'react';

interface Params {
  utm_ref?: string;
  first_page?: string;
  device_type?: string;
  fallback_referrer?: string;
  fallback_device_type?: string;
  fallback_first_page?: string;
}

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

    // 🔍 Если UTM не пришли, пробуем определить источник, первую страницу и устройство
    const isAllowedDomain = (() => {
      const allowed =
        import.meta.env.VITE_APP_ALLOWED_DOMAINS?.split(',') || [];
      const current = window.location.hostname;
      return allowed.includes(current);
    })();

    const isEmpty = Object.keys(params).length === 0;

    if (isAllowedDomain && isEmpty) {
      const referrer = document.referrer;
      const fallbackFirstPage = window.location.pathname;
      const ua = navigator.userAgent;

      const isMobile =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          ua
        );
      const fallbackDeviceType = isMobile ? 'mobile' : 'desktop';

      if (referrer) {
        params.fallback_referrer = referrer;
      }

      if (fallbackFirstPage) {
        params.fallback_first_page = fallbackFirstPage;
      }

      params.fallback_device_type = fallbackDeviceType;
    }

    if (Object.keys(params).length > 0) {
      localStorage.setItem('urlParams', JSON.stringify(params));
      localStorage.setItem('hasCapturedParams', 'true');
    }
  }, []);
};
