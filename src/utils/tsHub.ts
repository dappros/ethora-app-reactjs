// Ethora.com platform, copyright: Dappros Ltd (c) 2026, all rights reserved
//
// T&S hub (docs/TRUST_AND_SAFETY.md section 13), client side: the tabs and
// their URLs, the row selection of the Quarantine list and its bulk
// confirmation, the rule form (validation, API body, server errors per
// pattern, test results) and the filters of the cross-App lists. Pure
// functions, unit tested in tests/unit/tsHub.test.mjs.
import type { TsRule, TsRuleAction, TsRuleKind, TsRuleTestMatch } from '../models';

// ---- Tabs and paths ----

export const TS_HUB_TABS = ['overview', 'quarantine', 'moderation', 'suspended', 'rules', 'domains', 'settings'] as const;
export type TsHubTab = (typeof TS_HUB_TABS)[number];

export const TS_HUB_PATH = '/app/admin/trust-safety';

/** The tab named in the URL (?tab=), Overview when missing or unknown. */
export function hubTabFromParams(params: URLSearchParams): TsHubTab {
  const v = params.get('tab') || '';
  return (TS_HUB_TABS as readonly string[]).includes(v) ? (v as TsHubTab) : 'overview';
}

/** Path of a hub tab with extra query parameters (empty values left out). */
export function hubTabPath(tab: TsHubTab, extra: Record<string, string | number | undefined | null> = {}): string {
  const params = new URLSearchParams();
  if (tab !== 'overview') params.set('tab', tab);
  for (const [k, v] of Object.entries(extra)) {
    if (v !== undefined && v !== null && String(v) !== '') params.set(k, String(v));
  }
  const qs = params.toString();
  return `${TS_HUB_PATH}${qs ? `?${qs}` : ''}`;
}

/** The query of the Quarantine list with tab=quarantine first. */
function quarantineSearch(listSearch?: string | null): string {
  const params = new URLSearchParams(String(listSearch || '').replace(/^\?/, ''));
  params.delete('tab');
  const rest = params.toString();
  return `tab=quarantine${rest ? `&${rest}` : ''}`;
}

/** The Quarantine list, keeping its filters (the case view's Back link). */
export function quarantineListPath(listSearch?: string | null): string {
  return `${TS_HUB_PATH}?${quarantineSearch(listSearch)}`;
}

/** A case of the Quarantine tab; the list's filters ride along for Back. */
export function quarantineCasePath(caseId: string, listSearch?: string | null): string {
  return `${TS_HUB_PATH}/quarantine/${encodeURIComponent(caseId)}?${quarantineSearch(listSearch)}`;
}

/**
 * Where an old /app/admin/evidence URL goes now: the list to the Quarantine
 * tab (its filters kept), a case to the case view.
 */
export function legacyEvidenceRedirect(caseId: string | undefined, search: string): string {
  return caseId ? quarantineCasePath(caseId, search) : quarantineListPath(search);
}

// ---- Bulk selection (Quarantine) ----

// POST /v2/admin/evidence/cases/bulk-action takes 1..200 case ids.
export const BULK_MAX = 200;

export type PageSelection = 'none' | 'some' | 'all';

/** Whether none, some or all of the selectable rows of the page are selected. */
export function pageSelectionState(selected: ReadonlySet<string>, pageIds: readonly string[]): PageSelection {
  if (!pageIds.length) return 'none';
  const n = pageIds.filter((id) => selected.has(id)).length;
  if (n === 0) return 'none';
  return n === pageIds.length ? 'all' : 'some';
}

/** The selection with one id switched. */
export function toggleSelected(selected: ReadonlySet<string>, id: string): Set<string> {
  const next = new Set(selected);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  return next;
}

/**
 * The header checkbox: selects every row of the page, or clears the page
 * when all of it is selected already. Rows of other pages stay as they are.
 */
export function togglePage(selected: ReadonlySet<string>, pageIds: readonly string[]): Set<string> {
  const next = new Set(selected);
  if (pageSelectionState(selected, pageIds) === 'all') for (const id of pageIds) next.delete(id);
  else for (const id of pageIds) next.add(id);
  return next;
}

/** At most BULK_MAX ids, in order, without duplicates. */
export function capSelection(ids: readonly string[], max = BULK_MAX): string[] {
  const out: string[] = [];
  for (const id of ids) {
    if (!id || out.includes(id)) continue;
    out.push(id);
    if (out.length >= max) break;
  }
  return out;
}

/** The phrase a bulk purge asks for: "PURGE 12". */
export const bulkPurgePhrase = (count: number) => `PURGE ${count}`;

/** True when the typed text is the phrase (spaces around it ignored, any case). */
export function bulkPurgeConfirmed(input: string, count: number): boolean {
  if (!(count > 0)) return false;
  return input.trim().replace(/\s+/g, ' ').toUpperCase() === bulkPurgePhrase(count);
}

export interface BulkResultRow {
  caseId: string;
  ok: boolean;
  code?: string | null;
  error?: string | null;
}

/** Succeeded count and the failures grouped by code (no code = "unknown"). */
export function summarizeBulkResults(results: readonly BulkResultRow[]): {
  succeeded: number;
  failed: number;
  byCode: Array<{ code: string; caseIds: string[] }>;
} {
  let succeeded = 0;
  const groups = new Map<string, string[]>();
  for (const r of results) {
    if (r.ok) {
      succeeded += 1;
      continue;
    }
    const code = String(r.code || 'unknown');
    groups.set(code, [...(groups.get(code) || []), r.caseId]);
  }
  const byCode = Array.from(groups, ([code, caseIds]) => ({ code, caseIds }));
  return { succeeded, failed: results.length - succeeded, byCode };
}

// ---- Rules ----

export const TS_RULE_KINDS: TsRuleKind[] = ['words', 'regex'];
export const TS_RULE_ACTIONS: TsRuleAction[] = ['flag', 'blur', 'hide'];
export const RULE_LIMITS = { rules: 200, patterns: 500, patternLength: 200, nameLength: 100 } as const;

export interface RuleDraft {
  name: string;
  kind: TsRuleKind;
  patternsText: string;
  wholeWords: boolean;
  caseSensitive: boolean;
  action: TsRuleAction;
  allApps: boolean;
  appIds: string[];
  enabled: boolean;
}

export const EMPTY_RULE_DRAFT: RuleDraft = {
  name: '',
  kind: 'words',
  patternsText: '',
  wholeWords: true,
  caseSensitive: false,
  action: 'flag',
  allApps: true,
  appIds: [],
  enabled: true,
};

export function ruleToDraft(rule: TsRule): RuleDraft {
  const appIds = Array.isArray(rule.appIds) ? rule.appIds.filter(Boolean) : [];
  return {
    name: rule.name || '',
    kind: rule.kind === 'regex' ? 'regex' : 'words',
    patternsText: (rule.patterns || []).join('\n'),
    wholeWords: rule.wholeWords !== false,
    caseSensitive: Boolean(rule.caseSensitive),
    action: (TS_RULE_ACTIONS as string[]).includes(rule.action) ? rule.action : 'flag',
    allApps: appIds.length === 0,
    appIds,
    enabled: rule.enabled !== false,
  };
}

/**
 * The patterns of the textarea, one per line: trimmed, blank lines dropped.
 * `lines` maps each pattern to its line number (1-based) for the errors.
 * Duplicates are kept here and reported by the validation.
 */
export function splitPatterns(text: string): { patterns: string[]; lines: number[] } {
  const patterns: string[] = [];
  const lines: number[] = [];
  String(text || '')
    .split(/\r?\n/)
    .forEach((raw, i) => {
      const v = raw.trim();
      if (!v) return;
      patterns.push(v);
      lines.push(i + 1);
    });
  return { patterns, lines };
}

// Nested quantifiers like (a+)+ or (\w*)* backtrack catastrophically; the
// server refuses them. A quick look here saves a round trip; the server's
// check is the one that counts.
const NESTED_QUANTIFIER = /\((?:[^()\\]|\\.)*[+*}]\)(?:[+*]|\{\d)/;

export type PatternProblem = 'tooLong' | 'invalidRegex' | 'unsafeRegex' | 'duplicate';

export interface RuleValidation {
  ok: boolean;
  name?: 'required' | 'tooLong';
  patterns?: 'required' | 'tooMany';
  apps?: 'required';
  // Problems by pattern index (the order of splitPatterns).
  patternProblems: Record<number, PatternProblem>;
}

/** Client-side checks of the rule form; the server repeats them. */
export function validateRuleDraft(d: RuleDraft): RuleValidation {
  const out: RuleValidation = { ok: true, patternProblems: {} };
  const name = d.name.trim();
  if (!name) out.name = 'required';
  else if (name.length > RULE_LIMITS.nameLength) out.name = 'tooLong';
  const { patterns } = splitPatterns(d.patternsText);
  if (!patterns.length) out.patterns = 'required';
  else if (patterns.length > RULE_LIMITS.patterns) out.patterns = 'tooMany';
  const seen = new Set<string>();
  patterns.forEach((p, i) => {
    // Word lists compare without case unless case sensitive; regexes as typed.
    const key = d.caseSensitive || d.kind === 'regex' ? p : p.toLowerCase();
    if (p.length > RULE_LIMITS.patternLength) out.patternProblems[i] = 'tooLong';
    else if (seen.has(key)) out.patternProblems[i] = 'duplicate';
    else if (d.kind === 'regex') {
      try {
        new RegExp(p, d.caseSensitive ? 'u' : 'iu');
        if (NESTED_QUANTIFIER.test(p)) out.patternProblems[i] = 'unsafeRegex';
      } catch {
        out.patternProblems[i] = 'invalidRegex';
      }
    }
    seen.add(key);
  });
  if (!d.allApps && !d.appIds.length) out.apps = 'required';
  out.ok = !out.name && !out.patterns && !out.apps && Object.keys(out.patternProblems).length === 0;
  return out;
}

export interface RuleBody {
  name: string;
  enabled: boolean;
  kind: TsRuleKind;
  patterns: string[];
  wholeWords: boolean;
  caseSensitive: boolean;
  action: TsRuleAction;
  appIds: string[];
}

/** The API body of POST / PUT /v2/admin/trust-safety/rules. */
export function draftToRuleBody(d: RuleDraft): RuleBody {
  return {
    name: d.name.trim(),
    enabled: d.enabled,
    kind: d.kind,
    patterns: splitPatterns(d.patternsText).patterns,
    // Whole words applies to word lists only.
    wholeWords: d.kind === 'words' ? d.wholeWords : false,
    caseSensitive: d.caseSensitive,
    action: d.action,
    appIds: d.allApps ? [] : Array.from(new Set(d.appIds.filter(Boolean))),
  };
}

type Details = unknown;

const indexOfPath = (path: unknown): number | null => {
  if (Array.isArray(path)) {
    if (path[0] !== 'patterns') return null;
    const n = Number(path[1]);
    return Number.isInteger(n) && n >= 0 ? n : null;
  }
  const m = /^patterns(?:\[(\d+)\]|\.(\d+))$/.exec(String(path || ''));
  return m ? Number(m[1] ?? m[2]) : null;
};

/**
 * Server validation errors per pattern index, from the `details` of a 400.
 * Accepts the shapes the API may use: `{ patterns: [{ index, error }] }`,
 * `{ "patterns.3": "..." }` / `{ "patterns[3]": "..." }`, or a Joi-style
 * list `[{ path: ['patterns', 3], message }]`.
 */
export function patternErrorsFromDetails(details: Details): Record<number, string> {
  const out: Record<number, string> = {};
  const put = (i: number | null, msg: unknown) => {
    if (i === null || out[i] !== undefined) return;
    const text = String(msg ?? '').trim();
    if (text) out[i] = text;
  };
  if (Array.isArray(details)) {
    for (const d of details as Array<Record<string, unknown>>) put(indexOfPath(d?.path), d?.message ?? d?.error);
    return out;
  }
  if (!details || typeof details !== 'object') return out;
  const obj = details as Record<string, unknown>;
  if (Array.isArray(obj.patterns)) {
    for (const p of obj.patterns as Array<Record<string, unknown>>) {
      const n = Number(p?.index);
      put(Number.isInteger(n) && n >= 0 ? n : null, p?.error ?? p?.message ?? p?.reason ?? p?.code);
    }
  }
  for (const [k, v] of Object.entries(obj)) {
    const i = indexOfPath(k);
    if (i !== null) put(i, typeof v === 'object' && v ? (v as Record<string, unknown>).message ?? (v as Record<string, unknown>).error : v);
  }
  return out;
}

export interface RuleTestResult {
  matches: Array<{ id: string; name: string; action: TsRuleAction | string; matched: string[]; draft: boolean }>;
  action: TsRuleAction | string | null;
}

const ACTION_RANK: Record<string, number> = { flag: 1, blur: 2, hide: 3 };

/** The strictest of the actions (hide > blur > flag), else null. */
export function strictestRuleAction(actions: ReadonlyArray<string | null | undefined>): string | null {
  let best: string | null = null;
  for (const a of actions) {
    if (!a) continue;
    if (!best || (ACTION_RANK[a] || 0) > (ACTION_RANK[best] || 0)) best = a;
  }
  return best;
}

/**
 * The answer of POST /rules/test as the panel shows it: the matching rules
 * (`matches`, or `rules` on another API version) and the resulting action
 * (the API's, else the strictest of the matches).
 */
export function normalizeRuleTest(data: unknown): RuleTestResult {
  const d = (data && typeof data === 'object' ? data : {}) as Record<string, unknown>;
  const raw = (Array.isArray(d.matches) ? d.matches : Array.isArray(d.rules) ? d.rules : []) as TsRuleTestMatch[];
  const matches = raw
    .filter((m) => m && typeof m === 'object')
    .map((m) => ({
      id: String(m.ruleId || m._id || m.id || (m.draft ? 'draft' : '')),
      name: String(m.name || ''),
      action: String(m.action || ''),
      matched: (Array.isArray(m.matched) ? m.matched : Array.isArray(m.terms) ? m.terms : []).map(String),
      draft: Boolean(m.draft),
    }));
  const fromApi = typeof d.action === 'string' && d.action ? d.action : null;
  return { matches, action: fromApi || strictestRuleAction(matches.map((m) => m.action)) };
}

// ---- Cross-App lists ----

export const TS_HUB_PAGE_SIZE = 25;

/** Query string of a hub list: empty values left out, limit and offset always set. */
export function hubListQuery(filters: Record<string, string | number | undefined | null>, offset: number, limit = TS_HUB_PAGE_SIZE): string {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(filters)) {
    const s = v === undefined || v === null ? '' : String(v).trim();
    if (s) params.set(k, s);
  }
  params.set('limit', String(limit));
  params.set('offset', String(Math.max(0, offset)));
  return params.toString();
}

/** A whole, non-negative offset from the URL. */
export function offsetFromParams(params: URLSearchParams): number {
  const n = Number.parseInt(params.get('offset') || '', 10);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

/** Users page of an App with its Suspended view. */
export const appSuspendedUsersPath = (appId: string) =>
  `/app/admin/apps/${encodeURIComponent(appId)}/users?lifecycle=suspended`;

// ---- Suspended users ----

// Access levels (member < admin < owner < superadmin), as the Users page
// uses them: a suspension can be lifted only by someone above the account's
// own level and at or above the level that set it. The server enforces the
// same rules; this only hides an Unsuspend the server would refuse.
export const ACCESS_RANK: Record<string, number> = { member: 1, admin: 2, owner: 3, superadmin: 4 };

export interface LiftTarget {
  _id: string;
  role?: string | null;
  isSuperAdmin?: { read?: boolean; write?: boolean } | null;
  suspension?: { suspendedByRole?: string | null } | null;
}

export function canLiftSuspension(myId: string | undefined, myLevel: number, u: LiftTarget): boolean {
  if (!u?._id || u._id === myId) return false;
  const level = u.isSuperAdmin?.read || u.isSuperAdmin?.write ? ACCESS_RANK.superadmin : ACCESS_RANK[u.role || 'member'] || 1;
  if (level >= myLevel) return false;
  return (ACCESS_RANK[u.suspension?.suspendedByRole || ''] || 0) <= myLevel;
}

/**
 * The URL parameters of a hub list after a filter or page change: the tab
 * set, the page back to the first one unless `patch` sets `offset`, and
 * empty values, offset 0 and values equal to their default left out.
 */
export function nextListParams(
  current: URLSearchParams,
  tab: TsHubTab,
  patch: Record<string, string | number>,
  defaults: Record<string, string> = {}
): URLSearchParams {
  const next = new URLSearchParams(current);
  next.set('tab', tab);
  const merged: Record<string, string | number> = { offset: 0, ...patch };
  for (const [k, raw] of Object.entries(merged)) {
    const v = String(raw).trim();
    if (!v || (k === 'offset' && v === '0') || defaults[k] === v) next.delete(k);
    else next.set(k, v);
  }
  return next;
}
