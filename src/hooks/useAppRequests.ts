import { useEffect, useState } from 'react';
import { FlowSubmission, httpListBotInstances, httpListFlowSubmissions } from '../http';

const PER_AGENT_LIMIT = 50;

export interface AppRequest extends FlowSubmission {
  agentId: string;
}

// Completed flow submissions ("requests": bookings, contact forms) of the
// App's assistants, limited to this App's rooms. Read through each agent's
// own submissions endpoint, so who may see them is exactly what the agent's
// Flows panel allows: an agent the viewer may not read is skipped.
export function useAppRequests(appId?: string) {
  const [items, setItems] = useState<AppRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [skipped, setSkipped] = useState(0);
  const [capped, setCapped] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!appId) return;
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const { data } = await httpListBotInstances({ appId });
        const agentIds = [...new Set(((data?.items || []) as { agentId?: string }[]).map((b) => b.agentId).filter(Boolean) as string[])];
        const results = await Promise.allSettled(agentIds.map((id) => httpListFlowSubmissions(id, { limit: PER_AGENT_LIMIT })));
        if (cancelled) return;
        let denied = 0;
        let hitCap = false;
        const all: AppRequest[] = [];
        results.forEach((r, i) => {
          if (r.status !== 'fulfilled') {
            denied += 1;
            return;
          }
          const list = r.value.data?.items || [];
          if ((r.value.data?.total || 0) > list.length) hitCap = true;
          for (const s of list) if (String(s.room || '').startsWith(`${appId}_`)) all.push({ ...s, agentId: agentIds[i] });
        });
        all.sort((a, b) => String(b.completedAt || '').localeCompare(String(a.completedAt || '')));
        setItems(all);
        setSkipped(denied);
        setCapped(hitCap);
      } catch {
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [appId, reloadKey]);

  return { items, loading, skipped, capped, reload: () => setReloadKey((k) => k + 1) };
}
