import type { AxiosError } from 'axios';
import { useEffect, useState } from 'react';
import { httpV2 } from '../http';
import { useTranslation } from '../i18n/useTranslation';
import type { ServerNotice, ServerNoticeResponse } from '../models';
import {
  fill,
  isNoticeShown,
  noticeMessage,
  noticePollDelay,
  NOTICE_UNSUPPORTED_POLL_MS,
  setNoticeVisible,
} from '../utils/serverNotice';
import { isReconnecting, subscribeReconnecting } from '../utils/serverRestart';

const DISMISSED_KEY = 'ethora.serverNotice.dismissed';

function readDismissed(): string[] {
  try {
    const raw = sessionStorage.getItem(DISMISSED_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

function writeDismissed(ids: string[]) {
  try {
    sessionStorage.setItem(DISMISSED_KEY, JSON.stringify(ids.slice(-20)));
  } catch {
    // Storage blocked: the dismissal lasts until the page reloads.
  }
}

// A scheduled restart or update, announced to every signed-in user (mounted
// once, in AppLayout). Polls the public GET /v2/server-notice every 60 s,
// every 10 s while a notice exists, and right after the HTTP retry layer
// reconnects. While shown it stands in for the "Reconnecting" banner.
export function ServerNoticeBanner() {
  const { t } = useTranslation();
  const [notice, setNotice] = useState<ServerNotice | null>(null);
  const [dismissed, setDismissed] = useState<string[]>(readDismissed);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    let stopped = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let inFlight = false;
    let current: ServerNotice | null = null;
    let unsupported = false;
    const schedule = (ms: number) => {
      clearTimeout(timer);
      if (!stopped) timer = setTimeout(poll, ms);
    };
    const poll = async () => {
      if (inFlight || stopped) return;
      inFlight = true;
      try {
        const r = await httpV2.get<ServerNoticeResponse>('/server-notice');
        current = r.data?.notice ?? null;
        unsupported = false;
        if (!stopped) {
          setNotice(current);
          setNow(Date.now());
        }
      } catch (e) {
        // An API without the endpoint; anything else keeps the last answer.
        if ((e as AxiosError).response?.status === 404) {
          unsupported = true;
          current = null;
          if (!stopped) setNotice(null);
        }
      } finally {
        inFlight = false;
        schedule(unsupported ? NOTICE_UNSUPPORTED_POLL_MS : noticePollDelay(current));
      }
    };
    poll();
    // The server is back after a wait: ask again at once.
    let waiting = isReconnecting();
    const unsubscribe = subscribeReconnecting(() => {
      const next = isReconnecting();
      if (waiting && !next) schedule(0);
      waiting = next;
    });
    return () => {
      stopped = true;
      clearTimeout(timer);
      unsubscribe();
    };
  }, []);

  // Tick for the countdown, and to switch the text when startsAt passes.
  useEffect(() => {
    if (!notice) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [notice]);

  const shown = isNoticeShown(notice, now, dismissed);
  useEffect(() => {
    setNoticeVisible(shown);
  }, [shown]);
  useEffect(() => () => setNoticeVisible(false), []);

  if (!shown || !notice) return null;

  const { key, vars } = noticeMessage(notice, now);
  const dismiss = () => {
    const next = [...dismissed.filter((x) => x !== notice.id), notice.id];
    setDismissed(next);
    writeDismissed(next);
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className="mb-2 md:mb-4 rounded-xl px-4 py-2 text-sm flex items-start md:items-center gap-3 bg-blue-50 text-blue-900 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-100 dark:border-blue-800/60"
    >
      <span className="flex-1 min-w-0 tabular-nums">{fill(t(key), vars)}</span>
      <button type="button" onClick={dismiss} className="shrink-0 underline whitespace-nowrap">
        {t('server.notice.dismiss')}
      </button>
    </div>
  );
}
