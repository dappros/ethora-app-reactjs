// "Inactive for N days" on the Apps list. The API sends stats.lastActivityAt
// as the ISO start-of-day of the latest day on which the app had any
// activity (or null when it never had any). Days are whole UTC calendar days,
// the same clock the daily stats rows are cut on, so an app that was active
// today reads 0 for every viewer regardless of their time zone.

export type InactivityLevel = 'none' | 'recent' | 'warn' | 'danger';

// Thresholds in days: amber from 30, red from 90.
export const INACTIVITY_WARN_DAYS = 30;
export const INACTIVITY_DANGER_DAYS = 90;

const DAY_MS = 24 * 60 * 60 * 1000;

function utcDayStart(date: Date): number {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

// Whole days since the last activity day. null = no usable date (never active).
// A date in the future (clock skew) counts as today.
export function inactiveDays(
  lastActivityAt: string | null | undefined,
  now: Date = new Date()
): number | null {
  if (!lastActivityAt) return null;
  const last = new Date(lastActivityAt);
  if (Number.isNaN(last.getTime())) return null;
  const days = Math.round((utcDayStart(now) - utcDayStart(last)) / DAY_MS);
  return Math.max(0, days);
}

// Colour bucket: neutral below 30 days (and for apps with no activity yet,
// which are usually just new), amber 30-89, red 90+.
export function inactivityLevel(days: number | null): InactivityLevel {
  if (days === null) return 'none';
  if (days >= INACTIVITY_DANGER_DAYS) return 'danger';
  if (days >= INACTIVITY_WARN_DAYS) return 'warn';
  return 'recent';
}
