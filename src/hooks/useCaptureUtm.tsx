import { useEffect } from 'react';
import {useLocation} from "react-router-dom";

export const useCaptureUtm = () => {
  const location = useLocation();
  const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    let hasUtm = false;

    console.log('params:', params);

    UTM_KEYS.forEach((key: string) => {
      const value = params.get(key);
      if (value) {
        hasUtm = true;
        localStorage.setItem(key, value);
        console.log(`Captured UTM: ${key} = ${value}`);
      }
    });

    if (hasUtm) {
      console.log('✅ UTM captured');
    }
  }, [location.search]);
}
