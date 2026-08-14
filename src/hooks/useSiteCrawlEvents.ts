import { useEffect, useRef } from 'react';
import { useCentrifugeChannel } from './useCentrifuge';

// Live crawl/reindex events, published by the backend to the actor who started
// the job (see services/centrifugo.publishToUser on the API side).
//
// A crawl is asynchronous: the POST answers as soon as the job is queued, and
// pages are stored in batches as the crawler finds them. These events are what
// turn that into something visible - without them the only way to see a crawl
// progress is to keep pressing reload.
//
// Events carry the rows they stored, so a subscriber can render a crawl as it
// happens without polling or refetching. They are still not the system of
// record: a Centrifugo publish is unacknowledged and unreplayable, so a client
// that was reloading or briefly offline misses one silently. Merge what arrives,
// and reconcile against the Web Index list plus
// GET /v2/apps/{appId}/sources/site-crawl-jobs/{jobId} - never assume the stream
// was complete.
export type SiteCrawlEventType =
  | 'site_crawl_progress'
  | 'site_crawl_completed'
  | 'site_crawl_failed';

// One Web Index row as the event carries it - the same shape the list endpoint
// returns, minus the markdown. This is what lets a subscriber update its table
// from the event instead of re-reading the list every time a batch lands.
export interface SiteCrawlEventRow {
  id: string;
  url: string;
  originUrl?: string;
  mdByteSize?: number;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface SiteCrawlEvent {
  type: SiteCrawlEventType;
  appId: string;
  jobId: string;
  // 'crawl' for a new URL, 'reindex' for refreshing a row already indexed.
  kind: 'crawl' | 'reindex';
  url: string;
  status: string;
  // Rows stored by the batch this event reports.
  rows?: SiteCrawlEventRow[];
  // More rows landed than the payload carries: the receiver's copy of the list
  // is incomplete and has to be re-read.
  rowsTruncated?: boolean;
  // Whole-job totals, not this batch: what to render in a progress line.
  savedPages: number;
  totalBytes: number;
  truncated: boolean;
  truncatedReason: string | null;
  error?: string | null;
}

function isSiteCrawlEvent(data: unknown): data is SiteCrawlEvent {
  const type = (data as { type?: unknown })?.type;
  return typeof type === 'string' && type.startsWith('site_crawl_');
}

interface Options {
  // Events for other apps are dropped. Omit to accept every app's events.
  appId?: string;
  onEvent: (event: SiteCrawlEvent) => void;
}

export function useSiteCrawlEvents({ appId, onEvent }: Options) {
  const { data, connected } = useCentrifugeChannel();
  // Kept in a ref so a caller can pass an inline arrow function without every
  // render re-running the effect and replaying the last event it still holds.
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;
  // useCentrifugeChannel exposes only the most recent publication, so the same
  // object stays in `data` until the next one arrives. Without this guard a
  // re-render for any other reason would deliver it a second time.
  const lastSeen = useRef<unknown>(null);

  useEffect(() => {
    if (!data || data === lastSeen.current) return;
    lastSeen.current = data;
    if (!isSiteCrawlEvent(data)) return;
    if (appId && data.appId !== appId) return;
    onEventRef.current(data);
  }, [data, appId]);

  return { connected };
}
