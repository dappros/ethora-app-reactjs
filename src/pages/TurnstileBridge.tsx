import { useEffect, useRef } from 'react';
import { useTranslation } from '../i18n/useTranslation';

const TEST_SITE_KEY = import.meta.env.VITE_SITE_KEY as string;

export default function TurnstileBridge() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const siteKey = urlParams.get('sitekey') || TEST_SITE_KEY;

    if (document.querySelector('script[src*="turnstile"]')) {
      renderTurnstile(siteKey);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    script.async = true;
    script.onload = () => {
      renderTurnstile(siteKey);
    };
    script.onerror = () => {
      console.error('Failed to load Turnstile script');
    };

    document.head.appendChild(script);
  }, []);

  const renderTurnstile = (siteKey: string) => {
    if (!containerRef.current || !(window as any).turnstile) {
      console.error('Container or Turnstile not available');
      return;
    }

    try {
      (window as any).turnstile.render(containerRef.current, {
        sitekey: siteKey,
        callback: (token: string) => {
          const redirectUri = new URLSearchParams(window.location.search).get(
            'redirect_uri'
          );
          if (redirectUri) {
            const url = new URL(redirectUri);
            url.searchParams.set('token', token);
            window.location.href = url.toString();
          }
        },
        'error-callback': (error: string) => {
          console.error('Turnstile error:', error);
          const redirectUri = new URLSearchParams(window.location.search).get(
            'redirect_uri'
          );
          if (redirectUri) {
            const url = new URL(redirectUri);
            url.searchParams.set('error', error);
            window.location.href = url.toString();
          }
        },
        theme: 'light',
      });
    } catch (error) {
      console.error('Error rendering Turnstile:', error);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <div
        style={{
          textAlign: 'center',
          padding: '20px',
        }}
      >
        <h2 style={{ marginBottom: '20px', color: '#333' }}>
          {t('turnstileBridge.heading')}
        </h2>
        <div
          ref={containerRef}
          style={{
            minHeight: '65px',
            minWidth: '300px',
            display: 'flex',
            justifyContent: 'center',
          }}
        />
        <p style={{ marginTop: '20px', color: '#666', fontSize: '14px' }}>
          {t('turnstileBridge.subtext')}
        </p>
      </div>
    </div>
  );
}
