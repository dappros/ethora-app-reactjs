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

// Server settings keys whose value is a percentage (1..100).
export const TS_PERCENT_KEYS = [
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

/** The preset whose values all equal `values` (current or drafted), else null. */
export function matchingPreset(values: Record<string, string | undefined>): TsPresetName | null {
  for (const name of TS_PRESETS) {
    const preset = TS_PRESET_VALUES[name];
    const same = TS_PRESET_KEYS.every((k) => {
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

/** The API body of the overrides (null = follow the install value). */
export function draftToOverrides(d: TsOverrideDraft): TrustSafetyOverrides {
  const out: Record<string, string | number | null> = {};
  for (const k of TS_OVERRIDE_KEYS) {
    const v = (d[k] || '').trim();
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

export const MODERATION_CATEGORIES = ['nudity', 'toxicity', 'severe', 'pii', 'phi', 'suspension'];

const itemIsHidden = (i: ModerationItem) => ['hide', 'hidden', 'hold', 'block', 'delete', 'deleted'].includes(String(i.action || ''));

/**
 * The moderator actions that make sense for an item. Open items can be
 * approved (media held for review) or dismissed, and tightened; resolved
 * items that were hidden or blurred can be restored.
 */
export function moderationActionsFor(item: ModerationItem): ModerationAction[] {
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
