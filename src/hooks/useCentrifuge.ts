import { useEffect, useState } from 'react';
import { Centrifuge } from 'centrifuge';
import { useAppStore } from '../store/useAppStore';
import { httpTokens, refreshOnce } from '../http';

const WS_TOKEN_MIN_INTERVAL_MS = 30_000;
let lastWsTokenRefresh = 0;

// Use environment variable or default to localhost for development
// Centrifuge v6 requires ws:// or wss:// scheme with full WebSocket path
const VITE_APP_CENTRIFUGE_SERVICE = import.meta.env.VITE_APP_CENTRIFUGE_SERVICE || 
  (import.meta.env.DEV ? 'ws://localhost:8001/connection/websocket' : undefined);

// The personal channel carries more than the stat counters it started with -
// site-crawl progress rides on it too - so the payload is typed as the envelope
// every publication shares. Consumers discriminate on `type` and narrow to
// their own shape (see useCentrifugeAppUpdater, useSiteCrawlEvents).
export interface CentrifugePayload {
  type: string;
  appId: string;
  [key: string]: unknown;
}

export function useCentrifugeChannel() {
   const currentUser = useAppStore((s) => s.currentUser);

  const [data, setData] = useState<CentrifugePayload>();
  const [connected, setConnected] = useState(false);

  const getToken = async () => {
    // Reuse the existing wsToken if we refreshed recently. This caps how often
    // a reconnect loop can hit /users/login/refresh, regardless of how many
    // times Centrifuge retries.
    const now = Date.now();
    if (httpTokens.wsToken && now - lastWsTokenRefresh < WS_TOKEN_MIN_INTERVAL_MS) {
      return httpTokens.wsToken;
    }
    await refreshOnce();
    lastWsTokenRefresh = Date.now();
    return httpTokens.wsToken;
  };

  useEffect(() => {
    // Skip Centrifuge if endpoint is not configured
    if (!VITE_APP_CENTRIFUGE_SERVICE) {
      console.warn('[centrifuge] VITE_APP_CENTRIFUGE_SERVICE is not configured. Centrifuge features will be disabled.');
      return;
    }

    // Skip if user is not logged in (no wsToken)
    if (!currentUser?.wsToken) {
      return;
    }

    const token = currentUser.wsToken;
    
    try {
      const centrifuge = new Centrifuge(VITE_APP_CENTRIFUGE_SERVICE, {
        token,
        getToken: getToken,
      });

      centrifuge.on('publication', (ctx) => {
        setData(ctx.data);
      });

      centrifuge.on('connected', () => {
        console.log('[centrifuge] connected');
        setConnected(true);
      });

      centrifuge.on('error', (ctx) => {
        console.warn('[centrifuge] error:', ctx);
        setConnected(false);
      });

      centrifuge.connect();

      return () => {
        centrifuge.disconnect();
      };
    } catch (error) {
      console.error('[centrifuge] Failed to initialize:', error);
    }
  }, [currentUser]);

  return { data, connected };
}
