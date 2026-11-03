// Live counters on the Apps list. The API folds increments into one
// `app-stats-updated` event every few seconds, shaped
// { apps: { [appId]: { apiCalls: 12, aitokens: 340 } } }, keyed by appStat field.
import type { ModelApp } from '../models';

type CounterStatKey = Exclude<keyof ModelApp['stats'], 'lastActivityAt'>;

export const APP_STATS_EVENT = 'app-stats-updated';

export type AppStatDeltas = Record<string, Record<string, number>>;

// The appStat fields the cards show. Others (messages, mcpCalls) still count as
// activity for lastActivityAt.
const STAT_KEYS: Record<string, [CounterStatKey, CounterStatKey]> = {
  apiCalls: ['totalApiCalls', 'recentlyApiCalls'],
  aitokens: ['totalTokens', 'recentlyTokens'],
  chats: ['totalChats', 'recentlyChats'],
  files: ['totalFiles', 'recentlyFiles'],
  issuance: ['totalIssuance', 'recentlyIssuance'],
  registered: ['totalRegistered', 'recentlyRegistered'],
  sessions: ['totalSessions', 'recentlySessions'],
  transactions: ['totalTransactions', 'recentlyTransactions'],
};

export function readAppStatDeltas(payload: unknown): AppStatDeltas | null {
  const apps = (payload as { apps?: unknown } | null)?.apps;
  return apps && typeof apps === 'object' ? (apps as AppStatDeltas) : null;
}

export function applyAppStats(
  apps: ModelApp[],
  deltas: AppStatDeltas,
  now: Date = new Date()
): ModelApp[] {
  return apps.map((app) => {
    const appDeltas = deltas[app._id];
    if (!appDeltas) return app;

    // A live counter just ticked, so the app was active today.
    const stats = { ...app.stats, lastActivityAt: now.toISOString() };
    for (const [stat, value] of Object.entries(appDeltas)) {
      const keys = STAT_KEYS[stat];
      if (!keys || !Number.isFinite(value)) continue;
      for (const key of keys) stats[key] = (stats[key] || 0) + value;
    }
    return { ...app, stats };
  });
}
