import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { toBaseLanguage } from '../constants/languageOptionsConstants';
import { translations } from '../i18n/translations';

// While the server restarts (Server settings > Restart, an update) the API
// answers 503 with code SERVER_RESTARTING, the proxy 503 with code
// SERVER_UNAVAILABLE, and in between there can be a 502 / 504 or a dropped
// connection. Reads (GET / HEAD / OPTIONS) are retried after Retry-After
// (5 s by default, at most 15 s) for up to 90 s. A write is retried only on
// the two explicit codes, which say the server did not process it; on a bare
// 502 / 504 / network error it may have, so it is rejected with a plain
// "the server is restarting" message instead.
export const RESTART_CODES = ['SERVER_RESTARTING', 'SERVER_UNAVAILABLE'];
const BUDGET_MS = 90_000;
const DEFAULT_DELAY_MS = 5_000;
const MAX_DELAY_MS = 15_000;
const SAFE_METHODS = ['get', 'head', 'options'];

type RetryConfig = InternalAxiosRequestConfig & { _restartRetryStartedAt?: number };

// ------------------------------------------------- reconnecting state --
let waiting = 0;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
export function subscribeReconnecting(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
export function isReconnecting(): boolean {
  return waiting > 0;
}

function translate(key: string): string {
  const store = typeof window !== 'undefined' ? (window as unknown as { useAppStore?: { getState: () => { uiLanguage?: string } } }).useAppStore : undefined;
  const language = toBaseLanguage(store?.getState()?.uiLanguage || 'en');
  return translations[language]?.[key] ?? translations.en[key] ?? key;
}

/** True for an error that comes from a server restart or update window. */
export function isServerRestartError(error: unknown): boolean {
  const e = error as AxiosError<{ code?: string }>;
  if (!e || !e.isAxiosError) return false;
  if (e.code === 'ERR_CANCELED') return false;
  const status = e.response?.status;
  if (!e.response) return true; // network error / connection refused / timeout
  if (status === 503 && RESTART_CODES.includes(String(e.response.data?.code || ''))) return true;
  return status === 502 || status === 504;
}

function retryDelayMs(error: AxiosError): number {
  const raw = error.response?.headers?.['retry-after'];
  const seconds = Number.parseInt(String(raw ?? ''), 10);
  const ms = Number.isFinite(seconds) && seconds > 0 ? seconds * 1000 : DEFAULT_DELAY_MS;
  return Math.min(ms, MAX_DELAY_MS);
}

function explicitCode(error: AxiosError<{ code?: string }>): boolean {
  return error.response?.status === 503 && RESTART_CODES.includes(String(error.response.data?.code || ''));
}

export function attachRestartRetry(client: AxiosInstance): void {
  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError<{ code?: string }>) => {
      if (!isServerRestartError(error) || !error.config) return Promise.reject(error);
      const config = error.config as RetryConfig;
      const method = String(config.method || 'get').toLowerCase();
      const canRetry = SAFE_METHODS.includes(method) || explicitCode(error);
      const startedAt = config._restartRetryStartedAt ?? Date.now();
      const delay = retryDelayMs(error);
      if (!canRetry || Date.now() + delay - startedAt > BUDGET_MS) {
        error.message = translate('server.restarting');
        return Promise.reject(error);
      }
      config._restartRetryStartedAt = startedAt;
      waiting += 1;
      emit();
      try {
        await new Promise((r) => setTimeout(r, delay));
        return await client(config);
      } finally {
        waiting -= 1;
        emit();
      }
    }
  );
}
