import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  TS_PRESET_VALUES,
  ageStateOf,
  draftToOverrides,
  invalidOverrides,
  matchingPreset,
  mediaSignalsOf,
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

test('presets set the image level; a server without TS_IMAGE_LEVEL still matches them', () => {
  assert.deepEqual(
    Object.fromEntries(Object.entries(TS_PRESET_VALUES).map(([n, v]) => [n, v.TS_IMAGE_LEVEL])),
    { business: 'strict', education: 'strict', community: 'standard', adult: 'relaxed' }
  );
  const { TS_IMAGE_LEVEL: _level, ...olderServer } = TS_PRESET_VALUES.community;
  assert.equal(matchingPreset(olderServer), null);
  assert.equal(matchingPreset(olderServer, (k) => k !== 'TS_IMAGE_LEVEL'), 'community');
  assert.equal(matchingPreset({ ...TS_PRESET_VALUES.community, TS_IMAGE_LEVEL: 'strict' }), null);
});

test('App image level: stricter only, any level over a custom server', () => {
  const d = overridesToDraft({});
  const standard = { ...install, imageLevel: 'standard' };
  assert.deepEqual(invalidOverrides({ ...d, imageLevel: 'strict' }, standard), []);
  assert.deepEqual(invalidOverrides({ ...d, imageLevel: 'standard' }, standard), []);
  assert.deepEqual(invalidOverrides({ ...d, imageLevel: 'relaxed' }, standard), ['imageLevel']);
  assert.deepEqual(invalidOverrides({ ...d, imageLevel: 'off' }, standard), ['imageLevel']);
  assert.deepEqual(invalidOverrides({ ...d, imageLevel: 'custom' }, standard), ['imageLevel']);
  assert.deepEqual(invalidOverrides({ ...d, imageLevel: 'off' }, { ...install, imageLevel: 'custom' }), []);
});

test('App image level: sent when set or cleared, left out otherwise (older APIs)', () => {
  const empty = overridesToDraft({});
  assert.equal('imageLevel' in draftToOverrides(empty, empty), false);
  assert.equal(draftToOverrides({ ...empty, imageLevel: 'strict' }, empty).imageLevel, 'strict');
  const was = overridesToDraft({ imageLevel: 'strict' });
  assert.equal(was.imageLevel, 'strict');
  assert.equal(draftToOverrides({ ...was, imageLevel: '' }, was).imageLevel, null);
});

test('media signals: from the item scores, else the file record; null when not run', () => {
  const media = { _id: '1', appId: 'a', kind: 'media', status: 'open', createdAt: '' };
  assert.deepEqual(mediaSignalsOf({ ...media, scores: { revealing: 93, nudenet: 12, falconsai: null, adamcodd: 93 } }), { nudenet: 12, falconsai: null, adamcodd: 93 });
  assert.deepEqual(
    mediaSignalsOf({ ...media, scores: { nudity: 91 }, file: { moderation: { signals: { nudenet: 91, falconsai: 80, adamcodd: 40 } } } }),
    { nudenet: 91, falconsai: 80, adamcodd: 40 }
  );
  assert.equal(mediaSignalsOf({ ...media, scores: { nudity: 91 } }), null);
  assert.equal(mediaSignalsOf({ ...media, kind: 'message', scores: { nudenet: 1 } }), null);
});

test('flagged media: dismiss, hide or delete; no approve', () => {
  const item = { _id: '1', appId: 'a', kind: 'media', action: 'flag', category: 'revealing', status: 'open', createdAt: '' };
  assert.deepEqual(moderationActionsFor(item), ['dismiss', 'hide', 'delete']);
});
