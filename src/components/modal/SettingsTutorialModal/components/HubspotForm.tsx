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
    const enabled = String(import.meta.env.VITE_HUBSPOT_ENABLED || '').toLowerCase() === 'true';
    const portalId = String(import.meta.env.VITE_HUBSPOT_PORTAL_ID || '').trim();
    const formId = String(import.meta.env.VITE_HUBSPOT_FORM_ID_TUTORIAL || '').trim();
    const region = String(import.meta.env.VITE_HUBSPOT_REGION || 'na1').trim();

    // Enterprise/self-hosted safety: do not load HubSpot unless explicitly enabled + configured
    if (!enabled || !portalId || !formId) return;

    const script = document.createElement('script');
    script.src = 'https://js.hsforms.net/forms/embed/v2.js';
    script.async = true;
    script.defer = true;

    script.onload = () => {
      if (window.hbspt) {
        window.hbspt.forms.create({
          region,
          portalId,
          formId,
          target: '#hubspot-form-wrapper'
        });
      }
    };

    document.body.appendChild(script);
  }, []);

  return <div id="hubspot-form-wrapper"></div>;
};
