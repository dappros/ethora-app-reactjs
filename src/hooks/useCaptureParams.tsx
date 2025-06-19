import { useEffect } from 'react';

interface Params {
  [key: string]: string;
}

const searchEngines: { [key: string]: string } = {
  'google.': 'Google',
  'bing.': 'Bing',
  'yahoo.': 'Yahoo',
  'duckduckgo.': 'DuckDuckGo',
  'yandex.': 'Yandex',
  'baidu.': 'Baidu',
};

export const useCaptureParams = (paramNames: string[] = []) => {
  useEffect(() => {
    const hasCapturedParams = localStorage.getItem('hasCapturedParams');
    if (hasCapturedParams) {
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const params: Params = {};

    const paramsToCapture =
      paramNames.length > 0 ? paramNames : Array.from(urlParams.keys());

    paramsToCapture.forEach((param) => {
      const value = urlParams.get(param);
      if (value) {
        params[param] = value;
      }
    });

    if (Object.keys(params).length === 0 && document.referrer) {
      const referrer = document.referrer;
      const searchEngine = Object.entries(searchEngines).find(([key]) =>
        referrer.includes(key)
      );
      if (searchEngine) {
        params['utm_ref'] = searchEngine[1];
      }
    }

    if (Object.keys(params).length > 0) {
      localStorage.setItem('urlParams', JSON.stringify(params));
      localStorage.setItem('hasCapturedParams', 'true');
    }
  }, []);
};
