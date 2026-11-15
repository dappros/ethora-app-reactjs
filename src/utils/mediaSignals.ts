// Ethora.com platform, copyright: Dappros Ltd (c) 2026, all rights reserved
//
// Reviewer protection (docs/TRUST_AND_SAFETY.md section 14): a plain-language
// summary of the stored moderation signals of a media file, so a reviewer can
// triage it from text before opening it. Built from File.moderation as the
// API returns it on Quarantine case media and Moderation queue items: the
// NudeNet body-part labels (score 0..1), the image signals (percent) and the
// decided category. No model runs here. Pure functions, unit tested in
// tests/unit/mediaSignals.test.mjs.
import type { MediaModeration } from '../models';

type T = (key: string) => string;

// NudeNet labels that count for its explicit score, and the suggestive ones
// (covered parts, a bare belly, a bare male chest). Same sets as the
// moderation service (services/moderation/app/nudity.py).
export const EXPLICIT_LABELS = [
  'FEMALE_GENITALIA_EXPOSED',
  'MALE_GENITALIA_EXPOSED',
  'FEMALE_BREAST_EXPOSED',
  'BUTTOCKS_EXPOSED',
  'ANUS_EXPOSED',
] as const;

export const SUGGESTIVE_LABELS = [
  'FEMALE_GENITALIA_COVERED',
  'FEMALE_BREAST_COVERED',
  'BUTTOCKS_COVERED',
  'ANUS_COVERED',
  'BELLY_EXPOSED',
  'MALE_BREAST_EXPOSED',
] as const;

// A label at or above this (0..1) is "likely"; from POSSIBLE_LABEL up it is
// "possible"; below that it is left out.
export const LIKELY_LABEL = 0.6;
export const POSSIBLE_LABEL = 0.3;
// Suggestive labels are only mentioned from here.
export const SUGGESTIVE_LABEL = 0.5;
// Image signals (percent) are mentioned from here.
export const SIGNAL_MIN = 50;
// At most this many labels per line.
const MAX_LABELS = 3;

const finite = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : null);

// Label scores come as 0..1; tolerate percent.
const labelPct = (score: unknown) => {
  const n = finite(score);
  if (n === null) return 0;
  return Math.round(n <= 1 ? n * 100 : n);
};

/** A NudeNet label code in plain words ("FEMALE_BREAST_EXPOSED" -> "exposed breast"). */
export function labelWords(label: string, t: T): string {
  const key = `tsSignals.label.${label}`;
  const words = t(key);
  if (words !== key) return words;
  return label.toLowerCase().replace(/_/g, ' ');
}

const fill = (s: string, vars: Record<string, string>) =>
  Object.entries(vars).reduce((out, [k, v]) => out.split(`{${k}}`).join(v), s);

function labelList(labels: Array<{ label: string; score: number }>, t: T) {
  return labels
    .slice(0, MAX_LABELS)
    .map((l) => `${labelWords(l.label, t)} ${l.score}%`)
    .join(', ');
}

/**
 * Short plain-language lines about a media file's moderation signals, most
 * serious first, e.g. "Likely explicit nudity (exposed breast 76%)",
 * "Revealing or erotic content 99%", "Explicit classifier 92%"; one line
 * ("No sensitive signals", "No automatic check on record", "The automatic
 * check failed") when there is nothing to report.
 */
export function summarizeSignals(moderation: MediaModeration | null | undefined, t: T): string[] {
  const m = moderation || null;
  const labels = (Array.isArray(m?.labels) ? m.labels : [])
    .filter((l) => l && typeof l.label === 'string' && l.label)
    .map((l) => ({ label: l.label, score: labelPct(l.score) }))
    .sort((a, b) => b.score - a.score);
  const signals = m?.signals || null;
  const nudenet = finite(signals?.nudenet);
  const falconsai = finite(signals?.falconsai);
  const adamcodd = finite(signals?.adamcodd);
  const hasResult =
    Boolean(m?.status) || labels.length > 0 || nudenet !== null || falconsai !== null || adamcodd !== null || finite(m?.score) !== null;
  if (!m || !hasResult) return [t('tsSignals.none')];

  const lines: string[] = [];
  const explicit = labels.filter((l) => (EXPLICIT_LABELS as readonly string[]).includes(l.label) && l.score >= POSSIBLE_LABEL * 100);
  if (explicit.length) {
    const key = explicit[0].score >= LIKELY_LABEL * 100 ? 'tsSignals.explicitLikely' : 'tsSignals.explicitPossible';
    lines.push(fill(t(key), { labels: labelList(explicit, t) }));
  } else if (nudenet !== null && nudenet >= SIGNAL_MIN) {
    // Older results carry the NudeNet score without its labels.
    lines.push(fill(t('tsSignals.nudenet'), { score: String(Math.round(nudenet)) }));
  }
  const suggestive = labels.filter((l) => (SUGGESTIVE_LABELS as readonly string[]).includes(l.label) && l.score >= SUGGESTIVE_LABEL * 100);
  if (suggestive.length) lines.push(fill(t('tsSignals.suggestive'), { labels: labelList(suggestive, t) }));
  if (adamcodd !== null && adamcodd >= SIGNAL_MIN) lines.push(fill(t('tsSignals.revealing'), { score: String(Math.round(adamcodd)) }));
  if (falconsai !== null && falconsai >= SIGNAL_MIN) lines.push(fill(t('tsSignals.falconsai'), { score: String(Math.round(falconsai)) }));

  if (!lines.length) {
    // A category decided without image signals (another kind of check).
    const score = finite(m.score);
    const category = m.category && !['nudity', 'revealing'].includes(m.category) ? m.category : null;
    if (category && score !== null && score >= SIGNAL_MIN) {
      const key = `trustSafetyModeration.category.${category}`;
      const name = t(key) === key ? category : t(key);
      lines.push(fill(t('tsSignals.category'), { category: name, score: String(Math.round(score)) }));
    }
  }
  if (!lines.length) lines.push(m.status === 'error' ? t('tsSignals.error') : t('tsSignals.low'));
  return lines;
}

/** The AI description of a media file, when one was made. */
export function descriptionOf(moderation: MediaModeration | null | undefined): string | null {
  const d = moderation?.description;
  return typeof d === 'string' && d.trim() ? d.trim() : null;
}

// Safer reveal steps of a media tile: hidden (no image, only the summary),
// muted (shown greyscale and heavily blurred), clear (full colour).
export type RevealStep = 'hidden' | 'muted' | 'clear';

/** CSS filter classes for a reveal step. */
export function revealClasses(step: RevealStep): string {
  return step === 'clear' ? '' : 'grayscale blur-2xl scale-110';
}
