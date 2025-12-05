import { useEffect } from 'react';

declare global {
  interface Window {
    hbspt?: {
      forms: {
        create: (config: {
          region: string;
          portalId: string;
          formId: string;
          target: string;
        }) => void;
      };
    };
  }
}

export const HubspotForm = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://js.hsforms.net/forms/embed/v2.js';
    script.async = true;
    script.defer = true;

    script.onload = () => {
      if (window.hbspt) {
        window.hbspt.forms.create({
          region: 'na1',
          portalId: '4732608',
          formId: '86cdc2e8-2221-44b0-a926-02bec92c1bed',
          target: '#hubspot-form-wrapper'
        });
      }
    };

    document.body.appendChild(script);
  }, []);

  return <div id="hubspot-form-wrapper"></div>;
};
