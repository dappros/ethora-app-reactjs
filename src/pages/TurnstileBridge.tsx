import { useEffect, useRef } from 'react';

const DEFAULT_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY as string;

declare global {
  interface Window {
    onTurnstileOK?: (token: string) => void;
    onTurnstileError?: (err: unknown) => void;
  }
}

export default function TurnstileBridge() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const scriptLoadedRef = useRef(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const siteKey = urlParams.get('sitekey') || DEFAULT_SITE_KEY;

    if (!siteKey) {
      console.error('No sitekey provided');
      return;
    }

    if (scriptLoadedRef.current) {
      return;
    }

    const existingScript = document.querySelector('script[src*="turnstile"]');
    if (existingScript) {
      scriptLoadedRef.current = true;
      initializeTurnstile(siteKey);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      scriptLoadedRef.current = true;
      initializeTurnstile(siteKey);
    };

    script.onerror = () => {
      console.error('Failed to load Turnstile script');
    };

    document.head.appendChild(script);

    return () => {
    };
  }, []);

  const initializeTurnstile = (siteKey: string) => {
    if (!containerRef.current) {
      console.error('Container not found');
      return;
    }

    if (typeof (window as any).turnstile === 'undefined') {
      console.error('Turnstile not available');
      return;
    }

    try {
      (window as any).turnstile.render(containerRef.current, {
        sitekey: siteKey,
        callback: (token: string) => {
          try {
            window.location.href = 
              'ethoraappreactnative://turnstile?token=' + 
              encodeURIComponent(token);
          } catch (err) {
            console.error('Error redirecting with token:', err);
          }
        },
        'error-callback': (error: string) => {
          try {
            window.location.href = 
              'ethoraappreactnative://turnstile?error=' + 
              encodeURIComponent(String(error));
          } catch (err) {
            console.error('Error redirecting with error:', err);
          }
        },
        action: 'signup',
        theme: 'light',
      });
    } catch (err) {
      console.error('Error initializing Turnstile:', err);
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
      }}
    >
      <div 
        ref={containerRef}
        style={{
          minHeight: '65px',
          minWidth: '300px',
        }}
      />
    </div>
  );
}