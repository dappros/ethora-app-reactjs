// Maintenance notice (GET /v2/server-notice) and updater job helpers. Kept
// free of imports so the unit tests can load it directly.

export type NoticeKind = 'restart' | 'update' | 'rollback';
export interface NoticeLike {
  id: string;
  kind: NoticeKind;
  startsAt: string;
  expiresAt: string;
  target?: string | null;
}

// Poll every 30 s (a restart "in 1 minute" reaches every session in time),
// every 10 s while a notice exists.
export const NOTICE_POLL_MS = 30_000;
export const NOTICE_ACTIVE_POLL_MS = 10_000;
// An API without the endpoint is asked again rarely (and after a reconnect).
export const NOTICE_UNSUPPORTED_POLL_MS = 10 * 60_000;

export function noticePollDelay(notice: NoticeLike | null | undefined): number {
  return notice ? NOTICE_ACTIVE_POLL_MS : NOTICE_POLL_MS;
}

/** "04:59" for a countdown; "1:00:00" from an hour up; never negative. */
export function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.ceil((Number.isFinite(ms) ? ms : 0) / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

/** True while the notice should be on screen (not expired, not dismissed). */
export function isNoticeShown(notice: NoticeLike | null | undefined, now: number, dismissed: readonly string[] = []): boolean {
  if (!notice || !notice.id) return false;
  if (dismissed.includes(notice.id)) return false;
  const expires = Date.parse(notice.expiresAt);
  return !Number.isFinite(expires) || now < expires;
}

/**
 * The translation key of the banner text and its values: a countdown while
 * startsAt is ahead, "restarting" / "being updated" once it has passed.
 */
export function noticeMessage(notice: NoticeLike, now: number): { key: string; vars: Record<string, string> } {
  const startsAt = Date.parse(notice.startsAt);
  const ahead = Number.isFinite(startsAt) && startsAt > now;
  const isUpdate = notice.kind === 'update' || notice.kind === 'rollback';
  if (!ahead) return { key: isUpdate ? 'server.notice.updating' : 'server.notice.restarting', vars: {} };
  const countdown = formatCountdown(startsAt - now);
  if (!isUpdate) return { key: 'server.notice.restartIn', vars: { countdown } };
  if (notice.target) return { key: 'server.notice.updateIn', vars: { countdown, target: notice.target } };
  return { key: 'server.notice.updateInNoTarget', vars: { countdown } };
}

/** Replace {name} placeholders. */
export function fill(text: string, vars: Record<string, string>): string {
  return text.replace(/\{(\w+)\}/g, (all, name: string) => (name in vars ? vars[name] : all));
}

// ------------------------------------------------------ updater jobs --
export type JobState = 'scheduled' | 'running' | 'succeeded' | 'failed' | 'cancelled';
export interface JobLike {
  state: JobState;
  step?: string | null;
}
const STEP_ORDER = ['bundle', 'configure', 'pull', 'waiting', 'restart', 'check', 'done'];

export function isJobActive(job: JobLike | null | undefined): boolean {
  return Boolean(job) && (job?.state === 'scheduled' || job?.state === 'running');
}

/** The updater cancels while scheduled, or running with a step before restart. */
export function canCancelJob(job: JobLike | null | undefined): boolean {
  if (!job) return false;
  if (job.state === 'scheduled') return true;
  if (job.state !== 'running') return false;
  const at = STEP_ORDER.indexOf(String(job.step || ''));
  return at >= 0 && at < STEP_ORDER.indexOf('restart');
}

// ------------------------------------- one banner at a time --
// The notice banner, when shown, takes the place of the "Reconnecting"
// banner so the two never stack.
let noticeVisible = false;
const listeners = new Set<() => void>();
export function setNoticeVisible(visible: boolean): void {
  if (noticeVisible === visible) return;
  noticeVisible = visible;
  listeners.forEach((l) => l());
}
export function isNoticeVisible(): boolean {
  return noticeVisible;
}
export function subscribeNoticeVisible(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
