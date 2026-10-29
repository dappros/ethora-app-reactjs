import { useEffect, useState } from 'react';
import { httpGetAgentKnowledge } from '../http';

export function useAgentKnowledgeCount(agentId?: string | null, refreshKey?: unknown): number | null {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    if (!agentId) {
      setCount(null);
      return;
    }
    let cancelled = false;
    httpGetAgentKnowledge(agentId)
      .then((r) => {
        const d = r.data;
        if (cancelled) return;
        setCount(typeof d?.pages === 'number' && typeof d?.docs === 'number' ? d.pages + d.docs : null);
      })
      .catch(() => {
        if (!cancelled) setCount(null);
      });
    return () => {
      cancelled = true;
    };
  }, [agentId, refreshKey]);

  return count;
}
