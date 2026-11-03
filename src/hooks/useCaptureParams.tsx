import { useEffect } from 'react';
import { env } from '../config/env';
import { inferOnboardingIntent, setOnboardingIntent } from '../utils/onboardingIntent';

const ATTRIBUTION_KEYS = [
  'utm_ref', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term',
  'utm_content', 'utm_id', 'first_page', 'source_page', 'source_site', 'device_type', 'intent',
] as const;

function safePage(value: string): string {
  try {
    const url = new URL(value, window.location.origin);
    return url.pathname.slice(0, 300);
  } catch { return ''; }
}

export const useCaptureParams = () => {
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const intent = inferOnboardingIntent(query);
    if (intent) setOnboardingIntent(intent);

    try {
      let existing: Record<string, string> = {};
      try { existing = JSON.parse(localStorage.getItem('urlParams') || '{}') as Record<string, string>; } catch { /* Reset malformed old attribution. */ }
      const captured: Record<string, string> = { ...existing };
      for (const key of ATTRIBUTION_KEYS) {
        const value = query.get(key);
        if (!value || captured[key]) continue;
        captured[key] = key === 'first_page' || key === 'source_page' ? safePage(value) : value.slice(0, 300);
      }
      const allowed = String(env.VITE_APP_ALLOWED_DOMAINS || '').split(',').map((item) => item.trim());
      if (allowed.includes(window.location.hostname)) {
        if (!captured.utm_ref && document.referrer) {
          try { captured.utm_ref = new URL(document.referrer).hostname; } catch { /* Ignore malformed referrer. */ }
        }
        if (!captured.first_page) captured.first_page = window.location.pathname;
        if (!captured.device_type) captured.device_type = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ? 'mobile' : 'desktop';
      }
      if (Object.keys(captured).length) localStorage.setItem('urlParams', JSON.stringify(captured));
    } catch { /* Attribution must never block registration. */ }
  }, []);
};
