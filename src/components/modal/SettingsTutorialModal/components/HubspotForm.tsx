import { useEffect } from 'react';
import { useAppStore } from '../../../../store/useAppStore';

declare global {
  interface Window {
    hbspt?: {
      forms: {
        create: (config: {
          region: string;
          portalId: string;
          formId: string;
          target: string;
          onFormReady?: (form: unknown) => void;
        }) => void;
      };
    };
  }
}

export const HubspotForm = () => {
  const currentUser = useAppStore((s) => s.currentUser);

  useEffect(() => {
    const enabled = String(import.meta.env.VITE_HUBSPOT_ENABLED || '').toLowerCase() === 'true';
    const portalId = String(import.meta.env.VITE_HUBSPOT_PORTAL_ID || '').trim();
    const formId = String(import.meta.env.VITE_HUBSPOT_FORM_ID_TUTORIAL || '').trim();
    const region = String(import.meta.env.VITE_HUBSPOT_REGION || 'na1').trim();

    // Enterprise/self-hosted safety: do not load HubSpot unless explicitly enabled + configured
    if (!enabled || !portalId || !formId) return;

    const firstName = currentUser?.firstName || '';
    const lastName = currentUser?.lastName || '';
    const email = currentUser?.email || '';

    const script = document.createElement('script');
    script.src = 'https://js.hsforms.net/forms/embed/v2.js';
    script.async = true;
    script.defer = true;

    script.onload = () => {
      if (!window.hbspt) return;
      window.hbspt.forms.create({
        region,
        portalId,
        formId,
        target: '#hubspot-form-wrapper',
        // Prefill standard contact fields from the logged-in user so the
        // demo form isn't asking them to re-enter what we already know.
        // HubSpot v2 embed passes the form as a jQuery-wrapped element;
        // the DOM-fallback path covers newer vanilla-JS embeds.
        onFormReady: (form: unknown) => {
          // HubSpot v2 embed passes a jQuery-wrapped form here; newer
          // vanilla-JS embeds pass a plain DOM element. Try the jQuery
          // path first, fall back to the DOM path.
          type JQueryLike = {
            find: (sel: string) => {
              length: number;
              val: (v: string) => { change: () => void };
            };
          };
          type IndexableForm = { 0?: Element };
          const formAsJQuery = form as Partial<JQueryLike> | null;
          const formAsIndexed = form as IndexableForm | null;

          const setViaJQuery = (name: string, value: string): boolean => {
            if (!value || typeof formAsJQuery?.find !== 'function') return false;
            const input = formAsJQuery.find(`input[name="${name}"]`);
            if (!input || !input.length) return false;
            input.val(value).change();
            return true;
          };

          const setViaDom = (name: string, value: string): void => {
            if (!value) return;
            const root: Element | null =
              form instanceof Element
                ? form
                : formAsIndexed?.[0] instanceof Element
                  ? formAsIndexed[0]
                  : document.querySelector('#hubspot-form-wrapper form');
            const input = root?.querySelector(
              `input[name="${name}"]`
            ) as HTMLInputElement | null;
            if (!input) return;
            input.value = value;
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
          };

          const set = (name: string, value: string): void => {
            if (!setViaJQuery(name, value)) setViaDom(name, value);
          };
          set('firstname', firstName);
          set('lastname', lastName);
          set('email', email);
        },
      });
    };

    document.body.appendChild(script);
    // Deps intentionally empty: re-running this effect would inject a second
    // <script> tag and call forms.create twice, duplicating the embed.
    // currentUser values are captured once at mount, which is fine because
    // login/logout while the demo form is open is not a real flow.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div id="hubspot-form-wrapper"></div>;
};
