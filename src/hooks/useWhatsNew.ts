import { useCallback, useEffect, useState } from 'react';
import { LATEST_VERSION } from '../whatsNew/releases';

// localStorage backs the "seen" state. When the stored version is older than
// LATEST_VERSION (or absent), the user gets the unseen indicator until they
// open the What's new view, which calls markSeen.
//
// Cross-tab sync: the `storage` event fires in OTHER tabs when localStorage
// changes, so a user opening What's new in tab A clears the dot in tab B
// without a refresh.

const STORAGE_KEY = 'ethora_whats_new_seen_version';

function readSeen(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? '';
  } catch {
    // Private mode / disabled storage: pretend nothing's been seen. The
    // dot stays on but the page still loads normally.
    return '';
  }
}

export function useWhatsNew() {
  const [seenVersion, setSeenVersion] = useState<string>(readSeen);

  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === STORAGE_KEY) {
        setSeenVersion(e.newValue ?? '');
      }
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const markSeen = useCallback(() => {
    if (!LATEST_VERSION) return;
    try {
      localStorage.setItem(STORAGE_KEY, LATEST_VERSION);
    } catch {
      // ignore write failures; UI still updates via the local setState
    }
    setSeenVersion(LATEST_VERSION);
  }, []);

  const hasUnseen = !!LATEST_VERSION && seenVersion !== LATEST_VERSION;

  return { latestVersion: LATEST_VERSION, seenVersion, hasUnseen, markSeen };
}
