import posthog from 'posthog-js';

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY;
const POSTHOG_HOST =
  import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com';

export const posthogEnabled = Boolean(POSTHOG_KEY);

if (posthogEnabled) {
  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    defaults: '2026-05-30',
    person_profiles: 'identified_only',
    cross_subdomain_cookie: true,
  });
}

export function phCapture(
  event: string,
  properties?: Record<string, unknown>
) {
  if (posthogEnabled) posthog.capture(event, properties);
}

export function phIdentify(
  distinctId: string,
  properties?: Record<string, unknown>
) {
  if (posthogEnabled) posthog.identify(distinctId, properties);
}

export function phReset() {
  if (posthogEnabled) posthog.reset();
}

export default posthog;
