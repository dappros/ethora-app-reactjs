import { useEffect, useState } from 'react';
import { Centrifuge } from 'centrifuge';
import { useAppStore } from '../store/useAppStore';
import { refreshToken } from '../http';

// Use environment variable or default to localhost for development
// Centrifuge v6 requires ws:// or wss:// scheme with full WebSocket path
const VITE_APP_CENTRIFUGE_SERVICE = import.meta.env.VITE_APP_CENTRIFUGE_SERVICE || 
  (import.meta.env.DEV ? 'ws://localhost:8001/connection/websocket' : undefined);

type CounterType =
  | 'counter_chats'
  | 'counter_api_calls'
  | 'counter_aitokens'
  | 'counter_files'
  | 'counter_transactions'
  | 'counter_sessions'
  | 'counter_registered';

  interface CentrifugeData {
    type: CounterType;
    appId: string;
  }

export function useCentrifugeChannel() {
   const currentUser = useAppStore((s) => s.currentUser);

  const [data, setData] = useState<CentrifugeData>();
  const [connected, setConnected] = useState(false);

  const getToken = async () => {
    console.log('[centrifuge] getToken CALLED!');
    const newTokens = await refreshToken();

    return newTokens.wsToken;
  }

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
