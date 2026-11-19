// The Apps list's sorting: newest first until the user picks another, and
// the pick is remembered in this browser (per signed-in user, localStorage),
// so leaving the list and coming back by the side menu, an App's back link
// or a reload shows the same order. An address that names a sorting
// (?orderBy=&order=) wins over the remembered one.
import type { OrderByType } from '../models';

export type SortOrder = 'asc' | 'desc';
export interface AppsListSort {
  orderBy: OrderByType;
  order: SortOrder;
}

export const DEFAULT_APPS_SORT: AppsListSort = { orderBy: 'createdAt', order: 'desc' };

export const APPS_SORT_FIELDS: OrderByType[] = [
  'displayName',
  'totalRegistered',
  'totalSessions',
  'totalApiCalls',
  'totalTokens',
  'totalFiles',
  'totalTransactions',
  'createdAt',
  'totalChats',
  'lastActivityAt',
];

const KEY_PREFIX = 'appsListSort:';

const isField = (v: unknown): v is OrderByType => typeof v === 'string' && (APPS_SORT_FIELDS as string[]).includes(v);
const isOrder = (v: unknown): v is SortOrder => v === 'asc' || v === 'desc';

function safeLocal(): Storage | null {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null;
  } catch {
    return null;
  }
}

export function readAppsSort(userId: string | null | undefined, storage: Storage | null = safeLocal()): AppsListSort | null {
  if (!userId || !storage) return null;
  try {
    const parsed = JSON.parse(storage.getItem(`${KEY_PREFIX}${userId}`) || 'null');
    return parsed && isField(parsed.orderBy) && isOrder(parsed.order) ? { orderBy: parsed.orderBy, order: parsed.order } : null;
  } catch {
    return null;
  }
}

export function saveAppsSort(userId: string | null | undefined, sort: AppsListSort, storage: Storage | null = safeLocal()): void {
  if (!userId || !storage || !isField(sort.orderBy) || !isOrder(sort.order)) return;
  try {
    storage.setItem(`${KEY_PREFIX}${userId}`, JSON.stringify({ orderBy: sort.orderBy, order: sort.order }));
  } catch {
    // storage full or blocked: the list still sorts, it just is not remembered
  }
}

/** The sorting to show: the address's when it names a valid one, else the remembered one, else newest first. */
export function resolveAppsSort(params: URLSearchParams, remembered: AppsListSort | null): AppsListSort & { fromUrl: boolean } {
  const orderBy = params.get('orderBy');
  if (isField(orderBy)) {
    const order = params.get('order');
    return { orderBy, order: isOrder(order) ? order : 'desc', fromUrl: true };
  }
  return { ...(remembered || DEFAULT_APPS_SORT), fromUrl: false };
}
