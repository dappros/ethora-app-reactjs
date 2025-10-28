import { useEffect, useRef } from 'react';

const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY!;

declare global {
  interface Window {
    turnstile?: any;
    onTurnstileOK?: (token: string) => void;
    onTurnstileError?: (err: unknown) => void;
  }
}

export default function TurnstileBridge() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    window.onTurnstileOK = (token: string) => {
      window.location.href =
        'ethoraappreactnative://turnstile?token=' + encodeURIComponent(token);
    };

    window.onTurnstileError = (err: unknown) => {
      window.location.href =
        'ethoraappreactnative://turnstile?error=' +
        encodeURIComponent(String(err));
    };

    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (containerRef.current && window.turnstile) {
        window.turnstile.render(containerRef.current, {
          sitekey: SITE_KEY,
          callback: 'onTurnstileOK',
          'error-callback': 'onTurnstileError',
          action: 'signup',
          theme: 'light',
        });
      }
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
      delete window.onTurnstileOK;
      delete window.onTurnstileError;
    };
  }, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div ref={containerRef} />
    </div>
  );
}
