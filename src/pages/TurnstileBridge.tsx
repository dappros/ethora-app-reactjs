import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';

const DEFAULT_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY as string;

declare global {
  interface Window {
    onTurnstileOK?: (token: string) => void;
    onTurnstileError?: (err: unknown) => void;
  }
}

export default function TurnstileBridge() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [searchParams] = useSearchParams();
  
  const siteKey = searchParams.get('sitekey') || DEFAULT_SITE_KEY;

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ts = (window as any).turnstile as
        | {
            render: (
              el: HTMLElement,
              opts: {
                sitekey: string;
                callback?: (token: string) => void;
                'error-callback'?: (error: string) => void;
                action?: string;
                theme?: 'light' | 'dark' | 'auto';
              }
            ) => void;
          }
        | undefined;

      if (containerRef.current && ts) {
        ts.render(containerRef.current, {
          sitekey: siteKey,
          callback: (token: string) => {
            window.location.href =
              'ethoraappreactnative://turnstile?token=' +
              encodeURIComponent(token);
          },
          'error-callback': (error: string) => {
            window.location.href =
              'ethoraappreactnative://turnstile?error=' +
              encodeURIComponent(String(error));
          },
          action: 'signup',
          theme: 'light',
        });
      }
    };

    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
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
