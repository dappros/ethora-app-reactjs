import { test } from 'node:test';
import assert from 'node:assert/strict';
import { descriptionOf, labelWords, revealClasses, summarizeSignals } from '../../src/utils/mediaSignals.ts';
import { trustSafety } from '../../src/i18n/translations/trustSafety.ts';

const t = (key) => trustSafety.en[key] ?? key;
const sum = (m) => summarizeSignals(m, t);

test('explicit NudeNet labels in plain words, with the other signals after them', () => {
  assert.deepEqual(
    sum({
      status: 'sensitive',
      category: 'nudity',
      score: 76,
      labels: [
        { label: 'BELLY_EXPOSED', score: 0.41 },
        { label: 'FEMALE_BREAST_EXPOSED', score: 0.764 },
      ],
      signals: { nudenet: 76, falconsai: 92, adamcodd: 99 },
    }),
    ['Likely explicit nudity (exposed breast 76%)', 'Revealing or erotic content 99%', 'Explicit classifier 92%']
  );
});

test('several explicit labels, highest first; a weaker top label is only possible', () => {
  assert.deepEqual(
    sum({
      status: 'held',
      labels: [
        { label: 'BUTTOCKS_EXPOSED', score: 0.62 },
        { label: 'MALE_GENITALIA_EXPOSED', score: 0.81 },
        { label: 'ANUS_EXPOSED', score: 0.1 },
      ],
      signals: { nudenet: 81, falconsai: null, adamcodd: null },
    }),
    ['Likely explicit nudity (exposed male genitals 81%, exposed buttocks 62%)']
  );
  assert.deepEqual(sum({ status: 'clean', labels: [{ label: 'FEMALE_BREAST_EXPOSED', score: 0.42 }] }), [
    'Possible explicit nudity (exposed breast 42%)',
  ]);
});

test('suggestive labels from 50%; revealing alone (AdamCodd); Falconsai alone', () => {
  assert.deepEqual(sum({ status: 'flagged', labels: [{ label: 'FEMALE_BREAST_COVERED', score: 0.7 }], signals: { adamcodd: 91 } }), [
    'Suggestive or partly covered (covered breast 70%)',
    'Revealing or erotic content 91%',
  ]);
  assert.deepEqual(sum({ status: 'clean', labels: [{ label: 'BELLY_EXPOSED', score: 0.45 }], signals: { nudenet: 3, falconsai: 12, adamcodd: 20 } }), [
    'No sensitive signals',
  ]);
  assert.deepEqual(sum({ status: 'clean', signals: { nudenet: 10, falconsai: 64, adamcodd: 5 } }), ['Explicit classifier 64%']);
});

test('older results: the NudeNet score without labels', () => {
  assert.deepEqual(sum({ status: 'sensitive', score: 88, signals: { nudenet: 88, falconsai: null, adamcodd: null } }), [
    'Explicit nudity detector 88%',
  ]);
});

test('nothing to report: low, no check on record, a failed check', () => {
  assert.deepEqual(sum({ status: 'clean', score: 4, labels: [], signals: { nudenet: 4, falconsai: 1, adamcodd: 30 } }), ['No sensitive signals']);
  assert.deepEqual(sum(null), ['No automatic check on record']);
  assert.deepEqual(sum(undefined), ['No automatic check on record']);
  assert.deepEqual(sum({}), ['No automatic check on record']);
  assert.deepEqual(sum({ status: 'error', score: null, labels: [], signals: null }), ['The automatic check failed']);
});

test('another category decided without image signals', () => {
  assert.deepEqual(sum({ status: 'held', category: 'violence', score: 80, labels: [], signals: null }), ['Flagged as Violence 80%']);
});

test('label words: known codes mapped, unknown ones readable', () => {
  assert.equal(labelWords('FEMALE_GENITALIA_EXPOSED', t), 'exposed female genitals');
  assert.equal(labelWords('MALE_BREAST_EXPOSED', t), 'bare male chest');
  assert.equal(labelWords('SOME_NEW_LABEL', t), 'some new label');
  // Percent label scores are tolerated.
  assert.deepEqual(sum({ status: 'sensitive', labels: [{ label: 'ANUS_EXPOSED', score: 77 }] }), ['Likely explicit nudity (exposed anus 77%)']);
});

test('description: trimmed text or null', () => {
  assert.equal(descriptionOf({ description: '  One person on a beach.  ' }), 'One person on a beach.');
  assert.equal(descriptionOf({ description: '   ' }), null);
  assert.equal(descriptionOf(null), null);
});

test('reveal filters: greyscale and blur until shown clearly', () => {
  assert.match(revealClasses('muted'), /grayscale/);
  assert.match(revealClasses('muted'), /blur-2xl/);
  assert.equal(revealClasses('clear'), '');
});

test('the dictionary has every label and line, and no em dashes', () => {
  for (const [k, v] of Object.entries(trustSafety.en)) {
    if (k.startsWith('tsSignals.') || k.startsWith('tsReveal.')) assert.ok(!v.includes('—'), k);
  }
  assert.equal(t('tsSignals.description').replace('{text}', 'x'), 'AI description (may be wrong): x');
});
