import { useEffect, useState } from 'react';
import { Centrifuge } from 'centrifuge';
import { useAppStore } from '../store/useAppStore';import { refreshToken } from '../http';

const VITE_APP_CENTRIFUGE_SERVICE = import.meta.env.VITE_APP_CENTRIFUGE_SERVICE;

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
