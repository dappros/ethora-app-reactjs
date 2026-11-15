// Ethora.com platform, copyright: Dappros Ltd (c) 2026, all rights reserved
//
// Evidence review (docs/TRUST_AND_SAFETY.md section 11), client side: the
// filter values of the case list and their URL / API query form, the
// retention badge, and small formatting helpers shared by the list and the
// case view. Pure functions, unit tested in tests/unit/evidence.test.mjs.
import type {
  EvidenceCase,
  EvidenceMode,
  EvidencePerson,
  EvidenceReason,
  EvidenceReportTarget,
  EvidenceStatusFilter,
} from '../models';

export const EVIDENCE_REASONS: EvidenceReason[] = ['deleted', 'auto', 'moderator', 'suspension'];
export const EVIDENCE_MODES: EvidenceMode[] = ['hide', 'quarantine'];
export const EVIDENCE_STATUSES: EvidenceStatusFilter[] = ['active', 'held', 'expiring'];
export const EVIDENCE_REPORT_TARGETS: EvidenceReportTarget[] = ['ncmec', 'law_enforcement', 'hr', 'internal', 'other'];

export const EVIDENCE_PAGE_SIZE = 25;
// The badge turns to a warning colour from this many days left.
export const EVIDENCE_SOON_DAYS = 7;
// The API accepts 1..3650 days for extend and release_hold.
export const EVIDENCE_MAX_DAYS = 3650;

const DAY_MS = 24 * 60 * 60 * 1000;

type Translate = (key: string) => string;

// ---- Filters ----

export interface EvidenceFilters {
  reason: EvidenceReason | '';
  mode: EvidenceMode | '';
  status: EvidenceStatusFilter | '';
  appId: string;
  userId: string;
  q: string;
  offset: number;
}

export const EMPTY_EVIDENCE_FILTERS: EvidenceFilters = {
  reason: '',
  mode: '',
  status: '',
  appId: '',
  userId: '',
  q: '',
  offset: 0,
};

const oneOf = <T extends string>(list: readonly T[], v: string | null): T | '' =>
  v && (list as readonly string[]).includes(v) ? (v as T) : '';

/** The list filters from the page URL; unknown values are dropped. */
export function evidenceFiltersFromParams(params: URLSearchParams): EvidenceFilters {
  const offset = Number.parseInt(params.get('offset') || '', 10);
  return {
    reason: oneOf(EVIDENCE_REASONS, params.get('reason')),
    mode: oneOf(EVIDENCE_MODES, params.get('mode')),
    status: oneOf(EVIDENCE_STATUSES, params.get('status')),
    appId: (params.get('appId') || '').trim(),
    userId: (params.get('userId') || '').trim(),
    q: params.get('q') || '',
    offset: Number.isFinite(offset) && offset > 0 ? offset : 0,
  };
}

/** The filters as URL parameters: empty values and offset 0 left out. */
export function evidenceFiltersToParams(f: EvidenceFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (f.reason) params.set('reason', f.reason);
  if (f.mode) params.set('mode', f.mode);
  if (f.status) params.set('status', f.status);
  if (f.appId.trim()) params.set('appId', f.appId.trim());
  if (f.userId.trim()) params.set('userId', f.userId.trim());
  if (f.q.trim()) params.set('q', f.q.trim());
  if (f.offset > 0) params.set('offset', String(f.offset));
  return params;
}

/** Query string of GET /v2/admin/evidence/cases (always with limit and offset). */
export function evidenceQueryString(f: EvidenceFilters, limit = EVIDENCE_PAGE_SIZE): string {
  const params = evidenceFiltersToParams({ ...f, offset: 0 });
  params.set('limit', String(limit));
  params.set('offset', String(Math.max(0, f.offset)));
  return params.toString();
}

// ---- Retention ----

export type RetentionState =
  | { kind: 'purged' }
  | { kind: 'hold' }
  | { kind: 'none' }
  | { kind: 'expired' }
  | { kind: 'expires'; days: number; soon: boolean };

/** Where the case stands: purged, on hold, expiring in N days, expired, or kept with no date. */
export function retentionState(
  c: Pick<EvidenceCase, 'purgedAt' | 'hold' | 'expiresAt'>,
  now: number = Date.now()
): RetentionState {
  if (c.purgedAt) return { kind: 'purged' };
  if (c.hold) return { kind: 'hold' };
  if (!c.expiresAt) return { kind: 'none' };
  const at = Date.parse(c.expiresAt);
  if (!Number.isFinite(at)) return { kind: 'none' };
  const ms = at - now;
  if (ms <= 0) return { kind: 'expired' };
  const days = Math.ceil(ms / DAY_MS);
  return { kind: 'expires', days, soon: days <= EVIDENCE_SOON_DAYS };
}

/** The badge text: "Expires in N days", "On hold", "Purged", ... */
export function retentionText(state: RetentionState, t: Translate): string {
  switch (state.kind) {
    case 'purged':
      return t('evidence.retention.purged');
    case 'hold':
      return t('evidence.retention.hold');
    case 'none':
      return t('evidence.retention.none');
    case 'expired':
      return t('evidence.retention.expired');
    case 'expires':
      return state.days === 1
        ? t('evidence.retention.expiresOne')
        : t('evidence.retention.expires').replace('{days}', String(state.days));
  }
}

// ---- Actions ----

/** A whole number of days 1..3650 from a text field, else null. */
export function parseDays(input: string | number | null | undefined): number | null {
  const s = String(input ?? '').trim();
  if (!/^\d+$/.test(s)) return null;
  const n = Number(s);
  return n >= 1 && n <= EVIDENCE_MAX_DAYS ? n : null;
}

/** Purge confirmation: the case reason (any case) or the word DELETE. */
export function purgeConfirmed(input: string, reason: string): boolean {
  const v = input.trim();
  if (!v) return false;
  return v === 'DELETE' || (Boolean(reason) && v.toLowerCase() === reason.toLowerCase());
}

/** The retention setting that applies to a case when its hold is released. */
export function retentionSettingKey(reason: string): string {
  return reason === 'deleted' ? 'TS_DELETED_CONTENT_RETENTION_DAYS' : 'TS_EVIDENCE_RETENTION_DAYS';
}

// ---- Formatting ----

export function personName(p?: string | EvidencePerson | null): string {
  if (!p) return '';
  if (typeof p === 'string') return p;
  const name = `${p.firstName || ''} ${p.lastName || ''}`.trim();
  return name || p.email || p._id || '';
}

export function caseCounts(c: Pick<EvidenceCase, 'counts' | 'messages' | 'media'>): { messages: number; media: number } {
  return {
    messages: c.counts?.messages ?? c.messages?.length ?? 0,
    media: c.counts?.media ?? c.media?.length ?? 0,
  };
}

/** Room title, else the room JID's local part. */
export function caseRoomLabel(c: Pick<EvidenceCase, 'roomTitle' | 'room'>): string {
  if (c.roomTitle) return c.roomTitle;
  return c.room ? c.room.split('@')[0] : '';
}

export function formatBytes(n?: number | null): string {
  if (typeof n !== 'number' || !Number.isFinite(n) || n < 0) return '';
  if (n < 1024) return `${n} B`;
  const units = ['KB', 'MB', 'GB', 'TB'];
  let v = n / 1024;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i += 1;
  }
  return `${v < 10 ? v.toFixed(1) : Math.round(v)} ${units[i]}`;
}

export type MediaKind = 'image' | 'video' | 'audio' | 'other';

export function mediaKind(mimetype?: string | null): MediaKind {
  const m = String(mimetype || '').toLowerCase();
  if (m.startsWith('image/')) return 'image';
  if (m.startsWith('video/')) return 'video';
  if (m.startsWith('audio/')) return 'audio';
  return 'other';
}

/**
 * File name of a downloaded export: the server's Content-Disposition name
 * when there is one, else evidence-<case id>.zip with unsafe characters
 * replaced.
 */
export function exportFilename(caseId: string, contentDisposition?: string | null): string {
  const cd = contentDisposition || '';
  const star = /filename\*\s*=\s*(?:UTF-8'')?([^;]+)/i.exec(cd);
  if (star) {
    try {
      const v = decodeURIComponent(star[1].trim().replace(/^"|"$/g, ''));
      if (v) return v;
    } catch {
      // fall through to the plain name
    }
  }
  const plain = /filename\s*=\s*"?([^";]+)"?/i.exec(cd);
  if (plain && plain[1].trim()) return plain[1].trim();
  const safe = caseId.replace(/[^A-Za-z0-9._-]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 120);
  return `evidence-${safe || 'case'}.zip`;
}
