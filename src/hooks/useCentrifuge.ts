import { useEffect, useState } from 'react';
import { Centrifuge } from 'centrifuge';
import { refreshToken } from '../http';
import { useAppStore } from '../store/useAppStore';

function getDefaultCentrifugeEndpoint() {
  if (typeof window === 'undefined') {
    return '';
  }

  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.host}/connection/websocket`;
}

const VITE_APP_CENTRIFUGE_SERVICE =
  import.meta.env.VITE_APP_CENTRIFUGE_SERVICE || getDefaultCentrifugeEndpoint();

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
    if (!VITE_APP_CENTRIFUGE_SERVICE) {
      setConnected(false);
      return;
    }

    const token = currentUser?.wsToken;
    
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

    centrifuge.connect();

    return () => {
      centrifuge.disconnect();
    };
  }, [currentUser]);

  return { data, connected };
}
