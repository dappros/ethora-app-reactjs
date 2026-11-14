import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  TS_PRESET_VALUES,
  ageStateOf,
  draftToOverrides,
  invalidOverrides,
  matchingPreset,
  moderationActionsFor,
  overridesToDraft,
} from '../../src/utils/trustSafety.ts';

const install = {
  enabled: true,
  imageNudityAction: 'blur',
  imageNudityThreshold: 60,
  ageGate: true,
  textToxicityAction: 'blur',
  textToxicityThreshold: 80,
  textSevereAction: 'hide',
  textSevereThreshold: 70,
  piiAction: 'flag',
  phiAction: 'allow',
  phiThreshold: 70,
};

test('each preset matches itself and only itself', () => {
  for (const [name, values] of Object.entries(TS_PRESET_VALUES)) {
    assert.equal(matchingPreset(values), name);
  }
  assert.equal(matchingPreset({ ...TS_PRESET_VALUES.business, TS_PHI_THRESHOLD: '71' }), null);
});

test('PII types match regardless of order, case and spaces', () => {
  const values = { ...TS_PRESET_VALUES.education, TS_PII_TYPES: 'location, email_address,PHONE_NUMBER,IBAN_CODE,US_SSN,CREDIT_CARD' };
  assert.equal(matchingPreset(values), 'education');
});

test('overrides: empty follows the server, numbers parse, round trip', () => {
  const draft = overridesToDraft({ imageNudityAction: 'block', imageNudityThreshold: 40, piiAction: null });
  assert.equal(draft.imageNudityAction, 'block');
  assert.equal(draft.imageNudityThreshold, '40');
  assert.equal(draft.piiAction, '');
  const body = draftToOverrides(draft);
  assert.equal(body.imageNudityThreshold, 40);
  assert.equal(body.piiAction, null);
  assert.equal(body.textSevereAction, null);
});

test('overrides looser than the server are invalid', () => {
  const d = overridesToDraft({});
  assert.deepEqual(invalidOverrides(d, install), []);
  assert.deepEqual(invalidOverrides({ ...d, imageNudityAction: 'allow' }, install), ['imageNudityAction']);
  assert.deepEqual(invalidOverrides({ ...d, textSevereAction: 'blur' }, install), ['textSevereAction']);
  assert.deepEqual(invalidOverrides({ ...d, textToxicityThreshold: '81' }, install), ['textToxicityThreshold']);
  assert.deepEqual(invalidOverrides({ ...d, textToxicityThreshold: '80', phiAction: 'hide' }, install), []);
  assert.deepEqual(invalidOverrides({ ...d, phiThreshold: '0' }, install), ['phiThreshold']);
  // Without the server values only the range is checked.
  assert.deepEqual(invalidOverrides({ ...d, imageNudityAction: 'allow', phiThreshold: '99' }, null), []);
});

test('age state', () => {
  assert.equal(ageStateOf(null), 'unknown');
  assert.equal(ageStateOf({ birthYear: null, isAdult: null }), 'unknown');
  assert.equal(ageStateOf({ birthYear: 1990, isAdult: true }), 'adult');
  assert.equal(ageStateOf({ birthYear: 2012, isAdult: false }), 'minor');
});

test('moderation actions per item', () => {
  const base = { _id: '1', appId: 'a', createdAt: '' };
  assert.deepEqual(moderationActionsFor({ ...base, kind: 'message', status: 'open', action: 'flag' }), ['dismiss', 'blur', 'hide', 'delete']);
  assert.deepEqual(moderationActionsFor({ ...base, kind: 'message', status: 'open', action: 'hide' }), ['dismiss', 'restore', 'delete']);
  assert.deepEqual(moderationActionsFor({ ...base, kind: 'media', status: 'open', action: 'hold' }), ['approve', 'delete']);
  assert.deepEqual(moderationActionsFor({ ...base, kind: 'media', status: 'open', action: 'blur' }), ['dismiss', 'hide', 'restore', 'delete']);
  assert.deepEqual(moderationActionsFor({ ...base, kind: 'message', status: 'removed', action: 'hide' }), ['restore']);
  assert.deepEqual(moderationActionsFor({ ...base, kind: 'message', status: 'dismissed', action: 'flag' }), []);
});
