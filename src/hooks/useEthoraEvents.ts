import { useEffect, useRef } from 'react';
import { useXmppClient } from '@ethora/chat-component';
import { EthoraEvent, subscribeEthoraEvents } from '../lib/ethoraEvents';

// The chat component's client.status is a plain field, so nothing re-renders
// when it changes and it has to be read on a timer.
const XMPP_STATUS_CHECK_MS = 3000;

// Each event is delivered directly to the callback, so several arriving in the
// same tick are all seen. Kept in a ref so a caller can pass an inline arrow
// function without resubscribing on every render.
export function useEthoraEvents(onEvent: (event: EthoraEvent) => void) {
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  useEffect(() => subscribeEthoraEvents((event) => onEventRef.current(event)), []);
}

// Calls back when the XMPP session comes (back) online. Events sent while it
// was down are gone, so this is the moment to re-read from the API.
export function useXmppReconnected(onReconnected: () => void) {
  const { client } = useXmppClient();
  const onReconnectedRef = useRef(onReconnected);
  onReconnectedRef.current = onReconnected;

  useEffect(() => {
    if (!client) return;
    let wasOnline = client.status === 'online';
    const timer = window.setInterval(() => {
      const online = client.status === 'online';
      if (online && !wasOnline) onReconnectedRef.current();
      wasOnline = online;
    }, XMPP_STATUS_CHECK_MS);
    return () => window.clearInterval(timer);
  }, [client]);
}
