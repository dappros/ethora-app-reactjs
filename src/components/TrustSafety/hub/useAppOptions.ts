// Ethora.com platform, copyright: Dappros Ltd (c) 2026, all rights reserved
import { useMemo } from 'react';
import { useAppStore } from '../../../store/useAppStore';

const NO_EXTRA: Array<{ id?: string | null; name?: string | null }> = [];

/**
 * Apps for a picker: the ones the session knows, plus any id / name seen in
 * the API's rows (a superadmin's list may not hold every App).
 */
export function useAppOptions(extra: Array<{ id?: string | null; name?: string | null }> = NO_EXTRA) {
  const apps = useAppStore((s) => s.apps);
  return useMemo(() => {
    const list = new Map<string, string>();
    for (const a of apps || []) if (a?._id) list.set(a._id, a.displayName || a._id);
    for (const e of extra) if (e.id && !list.has(e.id)) list.set(e.id, e.name || e.id);
    return Array.from(list, ([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name));
  }, [apps, extra]);
}
