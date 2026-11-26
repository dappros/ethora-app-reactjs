// Ethora.com platform, copyright: Dappros Ltd (c) 2026, all rights reserved
//
// Trust & Safety, client side (docs/TRUST_AND_SAFETY.md): the presets the
// Server settings page applies to the TS_* keys, the action order used to
// keep App overrides stricter than the install, and small helpers shared by
// the admin pages. The server enforces the same rules; this only shapes the
// forms.
import type {
  ModerationAction,
  ModerationItem,
  ModelUserAge,
  SuspensionContentMode,
  SuspensionNameMode,
  TrustSafetyOverrides,
  TrustSafetyPolicy,
  TsImageAction,
  TsImageLevel,
  TsTextAction,
} from '../models';

export const TS_GROUP = 'trustSafety';
export const TS_TAB = 'safety';

// Strictness, loosest first. Shared by image and text actions.
export const TS_ACTION_ORDER = ['allow', 'flag', 'blur', 'hold', 'hide', 'block'] as const;
export const TS_IMAGE_ACTIONS: TsImageAction[] = ['allow', 'blur', 'hold', 'block'];
export const TS_TEXT_ACTIONS: TsTextAction[] = ['allow', 'flag', 'blur', 'hide'];

export const actionRank = (a?: string | null) => {
  const i = (TS_ACTION_ORDER as readonly string[]).indexOf(String(a || ''));
  return i < 0 ? 0 : i;
};

// ---- Image policy levels (section 12) ----

// Picker order on the Server settings page. `custom` = the nudity action and
// threshold on the NudeNet score; the named levels combine the three image
// signals.
export const TS_IMAGE_LEVELS: TsImageLevel[] = ['off', 'relaxed', 'standard', 'strict', 'custom'];
// Strictness of the named levels, loosest first (an App may only go up).
export const TS_IMAGE_LEVEL_ORDER: TsImageLevel[] = ['off', 'relaxed', 'standard', 'strict'];
export const levelRank = (l?: string | null) => TS_IMAGE_LEVEL_ORDER.indexOf(String(l || '') as TsImageLevel);
export const TS_IMAGE_LEVEL_KEY = 'TS_IMAGE_LEVEL';
// The percent thresholds of the named levels ("Advanced thresholds").
export const TS_IMAGE_LEVEL_THRESHOLD_KEYS = [
  'TS_IMAGE_EXPLICIT_NUDENET',
  'TS_IMAGE_EXPLICIT_FALCONSAI',
  'TS_IMAGE_REVEALING_FLAG',
  'TS_IMAGE_REVEALING_BLUR',
];
// The custom-level fields, shown only while the level is Custom.
export const TS_IMAGE_CUSTOM_KEYS = ['TS_IMAGE_NUDITY_ACTION', 'TS_IMAGE_NUDITY_THRESHOLD'];

// What each level does with explicit and with revealing images (the rule
// table under the picker): translation suffixes of trustSafety.levelRule.*.
export const TS_IMAGE_LEVEL_RULES: Record<Exclude<TsImageLevel, 'custom'>, { explicit: string; revealing: string }> = {
  off: { explicit: 'allow', revealing: 'allow' },
  relaxed: { explicit: 'blurAge', revealing: 'allow' },
  standard: { explicit: 'blurAge', revealing: 'flag' },
  strict: { explicit: 'block', revealing: 'blur' },
};

// The three image signals the moderation service reports (percent on the
// API side; null = the model did not run).
export const TS_IMAGE_SIGNALS = ['nudenet', 'falconsai', 'adamcodd'] as const;
export type TsImageSignal = (typeof TS_IMAGE_SIGNALS)[number];

// Server settings keys whose value is a percentage (1..100).
export const TS_PERCENT_KEYS = [
  ...TS_IMAGE_LEVEL_THRESHOLD_KEYS,
  'TS_IMAGE_NUDITY_THRESHOLD',
  'TS_TEXT_TOXICITY_THRESHOLD',
  'TS_TEXT_SEVERE_THRESHOLD',
  'TS_PHI_THRESHOLD',
];

export type TsPresetName = 'business' | 'education' | 'community' | 'adult';
export const TS_PRESETS: TsPresetName[] = ['business', 'education', 'community', 'adult'];

const BASIC_PII = 'CREDIT_CARD,US_SSN,IBAN_CODE';
const CONTACT_PII = `${BASIC_PII},PHONE_NUMBER,EMAIL_ADDRESS`;

// The contract's preset table, as Server settings values. "allow" rows keep
// the default threshold so applying a preset always gives the same values.
export const TS_PRESET_VALUES: Record<TsPresetName, Record<string, string>> = {
  business: {
    TS_IMAGE_LEVEL: 'strict',
    TS_IMAGE_NUDITY_ACTION: 'block',
    TS_IMAGE_NUDITY_THRESHOLD: '50',
    TS_AGE_GATE: 'true',
    TS_TEXT_TOXICITY_ACTION: 'blur',
    TS_TEXT_TOXICITY_THRESHOLD: '80',
    TS_TEXT_SEVERE_ACTION: 'hide',
    TS_TEXT_SEVERE_THRESHOLD: '70',
    TS_PII_ACTION: 'blur',
    TS_PII_TYPES: CONTACT_PII,
    TS_PHI_ACTION: 'blur',
    TS_PHI_THRESHOLD: '70',
  },
  education: {
    TS_IMAGE_LEVEL: 'strict',
    TS_IMAGE_NUDITY_ACTION: 'block',
    TS_IMAGE_NUDITY_THRESHOLD: '40',
    TS_AGE_GATE: 'true',
    TS_TEXT_TOXICITY_ACTION: 'hide',
    TS_TEXT_TOXICITY_THRESHOLD: '70',
    TS_TEXT_SEVERE_ACTION: 'hide',
    TS_TEXT_SEVERE_THRESHOLD: '60',
    TS_PII_ACTION: 'hide',
    TS_PII_TYPES: `${CONTACT_PII},LOCATION`,
    TS_PHI_ACTION: 'flag',
    TS_PHI_THRESHOLD: '70',
  },
  community: {
    TS_IMAGE_LEVEL: 'standard',
    TS_IMAGE_NUDITY_ACTION: 'blur',
    TS_IMAGE_NUDITY_THRESHOLD: '60',
    TS_AGE_GATE: 'true',
    TS_TEXT_TOXICITY_ACTION: 'blur',
    TS_TEXT_TOXICITY_THRESHOLD: '85',
    TS_TEXT_SEVERE_ACTION: 'hide',
    TS_TEXT_SEVERE_THRESHOLD: '75',
    TS_PII_ACTION: 'flag',
    TS_PII_TYPES: BASIC_PII,
    TS_PHI_ACTION: 'allow',
    TS_PHI_THRESHOLD: '70',
  },
  adult: {
    TS_IMAGE_LEVEL: 'relaxed',
    TS_IMAGE_NUDITY_ACTION: 'allow',
    TS_IMAGE_NUDITY_THRESHOLD: '60',
    TS_AGE_GATE: 'true',
    TS_TEXT_TOXICITY_ACTION: 'flag',
    TS_TEXT_TOXICITY_THRESHOLD: '90',
    TS_TEXT_SEVERE_ACTION: 'blur',
    TS_TEXT_SEVERE_THRESHOLD: '85',
    TS_PII_ACTION: 'flag',
    TS_PII_TYPES: BASIC_PII,
    TS_PHI_ACTION: 'allow',
    TS_PHI_THRESHOLD: '70',
  },
};

// The keys a preset sets (TS_PROFILE records which one was applied).
export const TS_PRESET_KEYS = Object.keys(TS_PRESET_VALUES.business);

const normPii = (v: string) =>
  v
    .split(',')
    .map((x) => x.trim().toUpperCase())
    .filter(Boolean)
    .sort()
    .join(',');

/**
 * The preset whose values all equal `values` (current or drafted), else null.
 * `known` limits the comparison to the keys the server has (an API without
 * TS_IMAGE_LEVEL still matches its presets).
 */
export function matchingPreset(values: Record<string, string | undefined>, known?: (key: string) => boolean): TsPresetName | null {
  const keys = known ? TS_PRESET_KEYS.filter(known) : TS_PRESET_KEYS;
  for (const name of TS_PRESETS) {
    const preset = TS_PRESET_VALUES[name];
    const same = keys.every((k) => {
      const a = String(values[k] ?? '');
      const b = preset[k];
      return k === 'TS_PII_TYPES' ? normPii(a) === normPii(b) : a.trim().toLowerCase() === b.toLowerCase();
    });
    if (same) return name;
  }
  return null;
}

// ---- App overrides ----

export type TsActionKey = 'imageNudityAction' | 'textToxicityAction' | 'textSevereAction' | 'piiAction' | 'phiAction';
export type TsThresholdKey = 'imageNudityThreshold' | 'textToxicityThreshold' | 'textSevereThreshold' | 'phiThreshold';

// The rows of the App's Trust & Safety section, in page order: an action and,
// where the check has one, its threshold.
export const TS_OVERRIDE_ROWS: Array<{ id: string; action: TsActionKey; threshold?: TsThresholdKey; actions: string[] }> = [
  { id: 'nudity', action: 'imageNudityAction', threshold: 'imageNudityThreshold', actions: TS_IMAGE_ACTIONS },
  { id: 'toxicity', action: 'textToxicityAction', threshold: 'textToxicityThreshold', actions: TS_TEXT_ACTIONS },
  { id: 'severe', action: 'textSevereAction', threshold: 'textSevereThreshold', actions: TS_TEXT_ACTIONS },
  { id: 'pii', action: 'piiAction', actions: TS_TEXT_ACTIONS },
  { id: 'phi', action: 'phiAction', threshold: 'phiThreshold', actions: TS_TEXT_ACTIONS },
];

export const TS_OVERRIDE_KEYS: Array<keyof TrustSafetyOverrides> = [
  'imageLevel',
  'imageNudityAction',
  'imageNudityThreshold',
  'textToxicityAction',
  'textToxicityThreshold',
  'textSevereAction',
  'textSevereThreshold',
  'piiAction',
  'phiAction',
  'phiThreshold',
];

// Form state of the overrides: '' = follow the install value.
export type TsOverrideDraft = Record<keyof TrustSafetyOverrides, string>;

export function overridesToDraft(o?: TrustSafetyOverrides | null): TsOverrideDraft {
  const out = {} as TsOverrideDraft;
  for (const k of TS_OVERRIDE_KEYS) {
    const v = o?.[k];
    out[k] = v === null || v === undefined ? '' : String(v);
  }
  return out;
}

// Overrides an older API does not know: sent only when set now or before,
// so saving an App there does not fail on an unknown key.
const NEWER_OVERRIDE_KEYS: Array<keyof TrustSafetyOverrides> = ['imageLevel'];

/**
 * The API body of the overrides (null = follow the install value). `initial`
 * is the draft the form started from.
 */
export function draftToOverrides(d: TsOverrideDraft, initial?: TsOverrideDraft | null): TrustSafetyOverrides {
  const out: Record<string, string | number | null> = {};
  for (const k of TS_OVERRIDE_KEYS) {
    const v = (d[k] || '').trim();
    if (!v && NEWER_OVERRIDE_KEYS.includes(k) && !(initial?.[k] || '').trim()) continue;
    if (!v) out[k] = null;
    else if (k.endsWith('Threshold')) out[k] = Number.parseInt(v, 10);
    else out[k] = v;
  }
  return out as TrustSafetyOverrides;
}

/**
 * Keys of the draft that would loosen the install policy (a looser action or
 * a higher threshold) or are not a whole percentage. Empty when it is valid.
 */
export function invalidOverrides(d: TsOverrideDraft, install?: TrustSafetyPolicy | null): string[] {
  const bad: string[] = [];
  // An image level below a named install level would loosen it; with the
  // install on custom any level only adds rules.
  const lvl = (d.imageLevel || '').trim();
  if (lvl && (levelRank(lvl) < 0 || (install?.imageLevel && levelRank(install.imageLevel) > levelRank(lvl)))) bad.push('imageLevel');
  for (const row of TS_OVERRIDE_ROWS) {
    const a = d[row.action];
    if (a && install && actionRank(a) < actionRank(install[row.action])) bad.push(row.action);
    if (row.threshold) {
      const v = (d[row.threshold] || '').trim();
      if (!v) continue;
      const n = Number(v);
      if (!Number.isInteger(n) || n < 1 || n > 100) bad.push(row.threshold);
      else if (install && n > Number(install[row.threshold])) bad.push(row.threshold);
    }
  }
  return bad;
}

// ---- Age ----

export type AgeState = 'adult' | 'minor' | 'unknown';

export function ageStateOf(age?: ModelUserAge | null): AgeState {
  if (!age || age.isAdult === null || age.isAdult === undefined) return 'unknown';
  return age.isAdult ? 'adult' : 'minor';
}

// ---- Suspension content options ----

export const SUSPENSION_CONTENT_MODES: SuspensionContentMode[] = ['keep', 'hide', 'quarantine', 'delete'];
export const SUSPENSION_NAME_MODES: SuspensionNameMode[] = ['keep', 'suspended'];

// ---- Moderation queue ----

// `custom` = an install rule matched (T&S > Rules); the item keeps the rule's name.
export const MODERATION_CATEGORIES = ['nudity', 'revealing', 'toxicity', 'severe', 'pii', 'phi', 'custom', 'suspension', 'spam', 'violence', 'sexual', 'drugs', 'other'];

/** The name of the rule behind a `custom` item, when the API sends it. */
export function ruleNameOf(item: Pick<ModerationItem, 'category' | 'ruleName' | 'rule' | 'scores'>): string {
  if (item.category !== 'custom') return '';
  const fromScores = item.scores && typeof item.scores.rule === 'string' ? item.scores.rule : '';
  return String(item.ruleName || item.rule?.name || fromScores || '').trim();
}

/**
 * The image signals of a media item, in percent: from its scores, else from
 * the file's moderation record. Null when the item has none (messages, or
 * media checked before the image levels).
 */
export function mediaSignalsOf(item: ModerationItem): Record<TsImageSignal, number | null> | null {
  const fromScores = item.scores || {};
  const fromFile = item.file?.moderation?.signals || null;
  const has = (o: Record<string, unknown> | null) => Boolean(o) && TS_IMAGE_SIGNALS.some((k) => k in (o as object));
  const src = has(fromScores) ? fromScores : has(fromFile) ? fromFile : null;
  if (item.kind !== 'media' || !src) return null;
  const out = {} as Record<TsImageSignal, number | null>;
  for (const k of TS_IMAGE_SIGNALS) {
    const v = (src as Record<string, unknown>)[k];
    out[k] = typeof v === 'number' && Number.isFinite(v) ? Math.round(v) : null;
  }
  return out;
}

const itemIsHidden = (i: ModerationItem) => ['hide', 'hidden', 'hold', 'block', 'delete', 'deleted'].includes(String(i.action || ''));

/**
 * The moderator actions that make sense for an item. Open items can be
 * approved (media held for review) or dismissed, and tightened; resolved
 * items that were hidden or blurred can be restored.
 */
export function moderationActionsFor(item: ModerationItem): ModerationAction[] {
  // A reported room (section 18): resolve (approve) or dismiss; acting on the
  // people involved goes through suspension.
  if (item.kind === 'room') return item.status === 'open' ? ['approve', 'dismiss'] : [];
  if (item.status !== 'open') {
    return item.status === 'removed' || itemIsHidden(item) || item.action === 'blur' ? ['restore'] : [];
  }
  const out: ModerationAction[] = [];
  if (item.kind === 'media' && item.action === 'hold') out.push('approve');
  else out.push('dismiss');
  if (item.kind === 'message' && item.action !== 'blur' && !itemIsHidden(item)) out.push('blur');
  if (!itemIsHidden(item)) out.push('hide');
  if ((item.action === 'blur' || itemIsHidden(item)) && item.action !== 'hold') out.push('restore');
  out.push('delete');
  return out;
}

/** "93%" from a 0..1 or 0..100 score; null when it is not a number. */
export function formatScore(v: unknown): string | null {
  const n = typeof v === 'number' ? v : Number.NaN;
  if (!Number.isFinite(n)) return null;
  const pct = n <= 1 ? Math.round(n * 100) : Math.round(n);
  return `${pct}%`;
}
