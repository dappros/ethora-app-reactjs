import { useCallback, useEffect, useState } from 'react';
import { httpGetApp } from '../http';
import { ModelApp } from '../models';
import { useAppStore } from '../store/useAppStore';

/** Loads a widget's server context independently of the Apps screens. */
export function useManagedWidgetApp(appId?: string) {
  const [app, setApp] = useState<ModelApp | null>(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const retry = useCallback(() => setAttempt((value) => value + 1), []);
  useEffect(() => {
    let cancelled = false;
    setApp(null);
    setError(false);
    if (!appId) { setError(true); return; }
    httpGetApp(appId).then(({ data }) => {
      if (cancelled) return;
      if (!data.result?._id) { setError(true); return; }
      const store = useAppStore.getState();
      if (store.apps.some((item) => item._id === data.result._id)) store.doUpdateApp(data.result);
      else store.doSetApp(data.result);
      setApp(data.result);
    }).catch(() => { if (!cancelled) setError(true); });
    return () => { cancelled = true; };
  }, [appId, attempt]);
  const storeApp = useAppStore((state) => state.apps.find((item) => item._id === appId));
  return { app: app ? (storeApp || app) : null, error, retry };
}
