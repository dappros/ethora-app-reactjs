import { useEffect, useRef } from 'react';

const TEST_SITE_KEY = import.meta.env.VITE_SITE_KEY as string;

export default function TurnstileBridge() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const siteKey = urlParams.get('sitekey') || TEST_SITE_KEY;
    
    console.log('Turnstile sitekey:', siteKey);

    if (document.querySelector('script[src*="turnstile"]')) {
      renderTurnstile(siteKey);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    script.async = true;
    script.onload = () => {
      console.log('Turnstile script loaded');
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
      console.log('Rendering Turnstile with sitekey:', siteKey);
      
      (window as any).turnstile.render(containerRef.current, {
        sitekey: siteKey,
        callback: (token: string) => {
          console.log('Turnstile success, token:', token);
          window.location.href = `ethoraappreactnative://turnstile?token=${encodeURIComponent(token)}`;
        },
        'error-callback': (error: string) => {
          console.error('Turnstile error:', error);
          window.location.href = `ethoraappreactnative://turnstile?error=${encodeURIComponent(error)}`;
        },
        theme: 'light',
      });
    } catch (error) {
      console.error('Error rendering Turnstile:', error);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f5f5f5',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        textAlign: 'center',
        padding: '20px'
      }}>
        <h2 style={{ marginBottom: '20px', color: '#333' }}>
          Подтвердите, что вы не робот
        </h2>
        <div ref={containerRef} style={{
          minHeight: '65px',
          minWidth: '300px',
          display: 'flex',
          justifyContent: 'center'
        }} />
        <p style={{ marginTop: '20px', color: '#666', fontSize: '14px' }}>
          Завершите проверку для продолжения
        </p>
      </div>
    </div>
  );
}