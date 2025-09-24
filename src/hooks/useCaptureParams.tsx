import { useEffect } from 'react';

interface Params {
  utm_ref?: string;
  first_page?: string;
  device_type?: string;
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

    if (Object.keys(params).length > 0) {
      localStorage.setItem('urlParams', JSON.stringify(params));
      localStorage.setItem('hasCapturedParams', 'true');
    }
  }, []);
};
