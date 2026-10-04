import type { PostHog } from 'posthog-js';

import { env } from './config/env';
const POSTHOG_KEY = env.VITE_POSTHOG_KEY;
const POSTHOG_HOST =
  env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com';

export const posthogEnabled = Boolean(POSTHOG_KEY);

// posthog-js is ~265 KB of the main bundle and nothing on the first paint
// depends on it, so it is loaded in its own chunk once the page is idle (or
// as soon as the first event is captured, whichever comes first). Calls made
// before the client is ready are queued and replayed in order, so callers
// keep using the synchronous ph* helpers below.
let client: PostHog | null = null;
let loading: Promise<PostHog | null> | null = null;
const pending: Array<(ph: PostHog) => void> = [];

function loadClient(): Promise<PostHog | null> {
  if (!posthogEnabled) return Promise.resolve(null);
  if (!loading) {
    loading = import('posthog-js')
      .then(({ default: posthog }) => {
        posthog.init(POSTHOG_KEY, {
          api_host: POSTHOG_HOST,
          defaults: '2026-05-30',
          person_profiles: 'identified_only',
          cross_subdomain_cookie: true,
        });
        client = posthog;
        pending.splice(0).forEach((fn) => fn(posthog));
        return posthog;
      })
      .catch((err) => {
        console.warn('[posthog] failed to load analytics', err);
        pending.length = 0;
        return null;
      });
  }
  return loading;
}

function withClient(fn: (ph: PostHog) => void) {
  if (!posthogEnabled) return;
  if (client) {
    fn(client);
    return;
  }
  pending.push(fn);
  void loadClient();
}

if (posthogEnabled && typeof window !== 'undefined') {
  const start = () => void loadClient();
  if (typeof window.requestIdleCallback === 'function') {
    window.requestIdleCallback(start, { timeout: 5000 });
  } else {
    window.setTimeout(start, 2000);
  }
}

export function phCapture(
  event: string,
  properties?: Record<string, unknown>
) {
  withClient((ph) => ph.capture(event, properties));
}

export function phIdentify(
  distinctId: string,
  properties?: Record<string, unknown>
) {
  withClient((ph) => ph.identify(distinctId, properties));
}

export function phReset() {
  withClient((ph) => ph.reset());
}
