import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  BULK_MAX,
  EMPTY_RULE_DRAFT,
  bulkPurgeConfirmed,
  bulkPurgePhrase,
  canLiftSuspension,
  capSelection,
  draftToRuleBody,
  hubListQuery,
  hubTabFromParams,
  hubTabPath,
  legacyEvidenceRedirect,
  nextListParams,
  normalizeRuleTest,
  pageSelectionState,
  patternErrorsFromDetails,
  quarantineCasePath,
  quarantineListPath,
  ruleToDraft,
  splitPatterns,
  strictestRuleAction,
  summarizeBulkResults,
  togglePage,
  toggleSelected,
  validateRuleDraft,
} from '../../src/utils/tsHub.ts';

const draft = (patch) => ({ ...EMPTY_RULE_DRAFT, name: 'Spam', patternsText: 'scam', ...patch });

test('hub tab from the URL, unknown values fall back to Overview', () => {
  assert.equal(hubTabFromParams(new URLSearchParams('tab=rules')), 'rules');
  assert.equal(hubTabFromParams(new URLSearchParams('tab=evidence')), 'overview');
  assert.equal(hubTabFromParams(new URLSearchParams('')), 'overview');
  assert.equal(hubTabPath('overview'), '/app/admin/trust-safety');
  assert.equal(hubTabPath('quarantine', { status: 'held', appId: '' }), '/app/admin/trust-safety?tab=quarantine&status=held');
});

test('quarantine paths keep the list filters and the tab', () => {
  assert.equal(quarantineListPath(), '/app/admin/trust-safety?tab=quarantine');
  assert.equal(quarantineListPath('?reason=deleted&tab=rules'), '/app/admin/trust-safety?tab=quarantine&reason=deleted');
  assert.equal(
    quarantineCasePath('suspension:u1:2026-11-15T10:00', 'tab=quarantine&offset=25'),
    '/app/admin/trust-safety/quarantine/suspension%3Au1%3A2026-11-15T10%3A00?tab=quarantine&offset=25'
  );
});

test('old evidence URLs redirect to the Quarantine tab and its case view', () => {
  assert.equal(legacyEvidenceRedirect(undefined, '?status=held'), '/app/admin/trust-safety?tab=quarantine&status=held');
  assert.equal(legacyEvidenceRedirect('deleted:r:1', '?q=x'), '/app/admin/trust-safety/quarantine/deleted%3Ar%3A1?tab=quarantine&q=x');
  assert.equal(legacyEvidenceRedirect('c1', ''), '/app/admin/trust-safety/quarantine/c1?tab=quarantine');
});

test('page selection state and toggles', () => {
  const page = ['a', 'b', 'c'];
  assert.equal(pageSelectionState(new Set(), page), 'none');
  assert.equal(pageSelectionState(new Set(['a']), page), 'some');
  assert.equal(pageSelectionState(new Set(['a', 'b', 'c', 'z']), page), 'all');
  assert.equal(pageSelectionState(new Set(['a']), []), 'none');

  // The header box selects the page, keeping rows of other pages.
  const selected = togglePage(new Set(['z', 'a']), page);
  assert.deepEqual([...selected].sort(), ['a', 'b', 'c', 'z']);
  // ...and clears only the page when all of it is selected.
  assert.deepEqual([...togglePage(selected, page)], ['z']);

  assert.deepEqual([...toggleSelected(new Set(['a']), 'b')], ['a', 'b']);
  assert.deepEqual([...toggleSelected(new Set(['a', 'b']), 'a')], ['b']);
});

test('selection is capped at the bulk limit without duplicates', () => {
  const ids = Array.from({ length: 250 }, (_, i) => `c${i}`);
  assert.equal(BULK_MAX, 200);
  assert.equal(capSelection(ids).length, 200);
  assert.equal(capSelection(ids)[199], 'c199');
  assert.deepEqual(capSelection(['a', 'a', '', 'b']), ['a', 'b']);
  assert.deepEqual(capSelection(['a', 'b', 'c'], 2), ['a', 'b']);
});

test('bulk purge confirmation needs "PURGE <n>"', () => {
  assert.equal(bulkPurgePhrase(12), 'PURGE 12');
  assert.equal(bulkPurgeConfirmed('PURGE 12', 12), true);
  assert.equal(bulkPurgeConfirmed('  purge   12 ', 12), true);
  assert.equal(bulkPurgeConfirmed('PURGE 11', 12), false);
  assert.equal(bulkPurgeConfirmed('PURGE', 12), false);
  assert.equal(bulkPurgeConfirmed('DELETE', 12), false);
  assert.equal(bulkPurgeConfirmed('PURGE 0', 0), false);
});

test('bulk results are summarised by failure code', () => {
  const s = summarizeBulkResults([
    { caseId: 'a', ok: true },
    { caseId: 'b', ok: false, code: 'ON_HOLD' },
    { caseId: 'c', ok: false, code: 'ON_HOLD' },
    { caseId: 'd', ok: false },
  ]);
  assert.equal(s.succeeded, 1);
  assert.equal(s.failed, 3);
  assert.deepEqual(s.byCode, [
    { code: 'ON_HOLD', caseIds: ['b', 'c'] },
    { code: 'unknown', caseIds: ['d'] },
  ]);
});

test('patterns: one per line, blank lines dropped, line numbers kept', () => {
  assert.deepEqual(splitPatterns(' scam \n\n free crypto\r\n'), { patterns: ['scam', 'free crypto'], lines: [1, 3] });
});

test('rule form validation', () => {
  assert.equal(validateRuleDraft(draft()).ok, true);
  assert.equal(validateRuleDraft(draft({ name: '  ' })).name, 'required');
  assert.equal(validateRuleDraft(draft({ name: 'x'.repeat(101) })).name, 'tooLong');
  assert.equal(validateRuleDraft(draft({ patternsText: '\n \n' })).patterns, 'required');
  assert.equal(validateRuleDraft(draft({ patternsText: Array.from({ length: 501 }, (_, i) => `w${i}`).join('\n') })).patterns, 'tooMany');
  assert.equal(validateRuleDraft(draft({ allApps: false, appIds: [] })).apps, 'required');
  assert.equal(validateRuleDraft(draft({ allApps: false, appIds: ['app1'] })).ok, true);

  // Per pattern: too long, duplicate (case-insensitive unless case sensitive).
  const words = validateRuleDraft(draft({ patternsText: `scam\nSCAM\n${'y'.repeat(201)}` }));
  assert.equal(words.ok, false);
  assert.deepEqual(words.patternProblems, { 1: 'duplicate', 2: 'tooLong' });
  assert.deepEqual(validateRuleDraft(draft({ patternsText: 'scam\nSCAM', caseSensitive: true })).patternProblems, {});

  // Regexes: compiled with the u flag; nested repeats refused.
  const re = validateRuleDraft(draft({ kind: 'regex', patternsText: '\\bwire\\s+transfer\\b\n(unclosed\n(a+)+$\n(\\w*)*x\n(a|b)+' }));
  assert.deepEqual(re.patternProblems, { 1: 'invalidRegex', 2: 'unsafeRegex', 3: 'unsafeRegex' });
  // \p{L} needs the u flag.
  assert.equal(validateRuleDraft(draft({ kind: 'regex', patternsText: '\\p{L}+bad' })).ok, true);
});

test('rule draft to API body and back', () => {
  const body = draftToRuleBody(draft({ name: ' Spam ', patternsText: 'a\n\nb', allApps: false, appIds: ['x', 'x', 'y'], action: 'hide' }));
  assert.deepEqual(body, {
    name: 'Spam',
    enabled: true,
    kind: 'words',
    patterns: ['a', 'b'],
    wholeWords: true,
    caseSensitive: false,
    action: 'hide',
    appIds: ['x', 'y'],
  });
  // Whole words applies to word lists only; All apps sends an empty list.
  const regex = draftToRuleBody(draft({ kind: 'regex', wholeWords: true, allApps: true, appIds: ['x'] }));
  assert.equal(regex.wholeWords, false);
  assert.deepEqual(regex.appIds, []);

  const back = ruleToDraft({ _id: '1', name: 'N', enabled: false, kind: 'regex', patterns: ['a', 'b'], action: 'blur', appIds: ['x'] });
  assert.equal(back.patternsText, 'a\nb');
  assert.equal(back.allApps, false);
  assert.equal(back.enabled, false);
  assert.equal(ruleToDraft({ _id: '2', name: 'M', enabled: true, kind: 'words', patterns: [], action: 'odd', appIds: [] }).action, 'flag');
});

test('server errors per pattern from the API details', () => {
  assert.deepEqual(patternErrorsFromDetails({ patterns: [{ index: 2, error: 'unsafe regex' }] }), { 2: 'unsafe regex' });
  assert.deepEqual(patternErrorsFromDetails({ 'patterns.1': 'invalid', 'patterns[3]': { message: 'too long' }, name: 'x' }), {
    1: 'invalid',
    3: 'too long',
  });
  assert.deepEqual(patternErrorsFromDetails([{ path: ['patterns', 0], message: 'bad' }, { path: ['name'], message: 'n' }]), { 0: 'bad' });
  assert.deepEqual(patternErrorsFromDetails(null), {});
  assert.deepEqual(patternErrorsFromDetails('oops'), {});
});

test('rule test results', () => {
  const r = normalizeRuleTest({ matches: [{ ruleId: 'r1', name: 'Spam', action: 'flag', matched: ['scam'] }, { draft: true, action: 'hide' }] });
  assert.equal(r.matches.length, 2);
  assert.equal(r.matches[1].id, 'draft');
  assert.equal(r.action, 'hide');
  assert.equal(normalizeRuleTest({ rules: [{ _id: 'a', name: 'A', action: 'blur' }], action: 'blur' }).matches[0].id, 'a');
  assert.deepEqual(normalizeRuleTest({}), { matches: [], action: null });
  assert.equal(strictestRuleAction(['flag', null, 'blur']), 'blur');
  assert.equal(strictestRuleAction([]), null);
});

test('hub list queries and URL updates', () => {
  assert.equal(hubListQuery({ status: 'open', kind: '', appId: ' a1 ' }, 25), 'status=open&appId=a1&limit=25&offset=25');
  const next = nextListParams(new URLSearchParams('tab=moderation&offset=50&kind=media'), 'moderation', { status: 'open' }, { status: 'open' });
  assert.equal(next.toString(), 'tab=moderation&kind=media');
  assert.equal(nextListParams(new URLSearchParams(''), 'suspended', { offset: 25 }).toString(), 'tab=suspended&offset=25');
});

test('lifting a suspension follows access levels', () => {
  const sa = 4;
  assert.equal(canLiftSuspension('me', sa, { _id: 'u', role: 'admin', suspension: { suspendedByRole: 'superadmin' } }), true);
  assert.equal(canLiftSuspension('me', sa, { _id: 'me' }), false);
  assert.equal(canLiftSuspension('me', sa, { _id: 'u', isSuperAdmin: { read: true } }), false);
  // An owner (3) cannot lift what a superadmin set, nor suspend an owner.
  assert.equal(canLiftSuspension('me', 3, { _id: 'u', suspension: { suspendedByRole: 'superadmin' } }), false);
  assert.equal(canLiftSuspension('me', 3, { _id: 'u', role: 'owner' }), false);
  assert.equal(canLiftSuspension('me', 3, { _id: 'u', suspension: { suspendedByRole: 'admin' } }), true);
});
