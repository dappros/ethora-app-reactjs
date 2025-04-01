import { useEffect } from 'react';

interface Params {
  [key: string]: string;
}

export const useCaptureParams = (paramNames: string[] = []) => {
  useEffect(() => {
    const hasCapturedParams = localStorage.getItem('hasCapturedParams');
    if (hasCapturedParams) {
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const params: Params = {};

    const paramsToCapture = paramNames.length > 0 ? paramNames : Array.from(urlParams.keys());

    paramsToCapture.forEach(param => {
      const value = urlParams.get(param);
      if (value) {
        params[param] = value;
      }
    });

    if (Object.keys(params).length > 0) {
      localStorage.setItem('urlParams', JSON.stringify(params));
      localStorage.setItem('hasCapturedParams', 'true');
    }
  }, []);
}; 