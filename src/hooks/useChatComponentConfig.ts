import { useCallback, useEffect, useRef, useState } from 'react';
import { httpGetPublicChatComponentConfig } from '../http';
import { ChatConfigRecord, sameChatConfig } from '../lib/chatComponentConfig';
import {
  knownChatComponentConfigVersion,
  noteChatComponentConfigVersion,
  subscribeChatComponentConfigSaved,
} from '../lib/chatComponentConfigSync';

// A page that has been in the background this long asks again when it comes
// back: it may have missed the push (offline, asleep), and an SDK that does not
// send the update callback never gets one at all. The public read is cached for
// 30 s on the server side, so this is cheap.
const REVALIDATE_AFTER_MS = 60_000;

interface Result {
  /** The App's saved config; null until the first read settles (it settles on failure too). */
  record: ChatConfigRecord | null;
  /**
   * Read it again. Pass the announced version to step around the 30 s cache.
   * Stable between renders, safe to hand to the chat as a callback.
   */
  refresh: (version?: string) => void;
}

/**
 * The chat component config the operator saved for an App, kept current:
 * read once for the App, then again when the SDK says it changed, when this
 * browser saved a change (another tab, the admin editor), and when the page
 * returns to the foreground after a while. A re-read that changes nothing
 * keeps the same object, so the chat config is not rebuilt for nothing. A
 * failed first read settles to an empty record (the chat keeps its defaults),
 * a failed re-read keeps what is shown.
 */
export function useChatComponentConfig(appId: string | undefined): Result {
  const [record, setRecord] = useState<ChatConfigRecord | null>(null);
  const appIdRef = useRef<string | undefined>(appId);
  const seq = useRef(0);
  const lastReadAt = useRef(0);
  const shownVersion = useRef<string | null>(null);

  const load = useCallback((version?: string, initial = false) => {
    const id = appIdRef.current;
    if (!id) return;
    if (!initial && version && version === shownVersion.current) return;
    const mine = ++seq.current;
    lastReadAt.current = Date.now();
    httpGetPublicChatComponentConfig(id, version ?? knownChatComponentConfigVersion(id))
      .then((resp) => {
        if (mine !== seq.current || appIdRef.current !== id) return;
        const next = resp.data?.config || {};
        const got = resp.data?.version;
        noteChatComponentConfigVersion(id, got);
        shownVersion.current = got ?? null;
        setRecord((prev) => (prev && sameChatConfig(prev, next) ? prev : next));
      })
      .catch(() => {
        if (mine !== seq.current || appIdRef.current !== id) return;
        // first read: start with defaults; later reads: keep what is shown
        setRecord((prev) => prev ?? {});
      });
  }, []);

  useEffect(() => {
    appIdRef.current = appId;
    shownVersion.current = null;
    seq.current += 1;
    setRecord(null);
    if (!appId) return;
    load(undefined, true);
    const unsubscribe = subscribeChatComponentConfigSaved((event) => {
      if (event.appId === appIdRef.current) load(event.version);
    });
    const onVisible = () => {
      if (document.visibilityState !== 'visible') return;
      if (Date.now() - lastReadAt.current < REVALIDATE_AFTER_MS) return;
      load(`r${Date.now()}`);
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      unsubscribe();
      document.removeEventListener('visibilitychange', onVisible);
      seq.current += 1;
    };
  }, [appId, load]);

  const refresh = useCallback((version?: string) => load(version), [load]);
  return { record, refresh };
}
