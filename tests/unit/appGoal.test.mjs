// App Home's goal: stored choice first, then the API's inferred goal, then
// the website rule for an API that does not send inferredGoal yet.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { appGoal } from '../../src/utils/appGoal.ts';

test('a stored goal wins over the inferred one', () => {
  assert.equal(appGoal({ _id: 'a', onboardingGoal: 'messenger', inferredGoal: 'sdk' }), 'messenger');
});

test('the inferred goal is used when nothing is stored', () => {
  assert.equal(appGoal({ _id: 'a', inferredGoal: 'sdk' }), 'sdk');
  assert.equal(appGoal({ _id: 'a', inferredGoal: 'messenger' }), 'messenger');
  assert.equal(appGoal({ _id: 'a', inferredGoal: 'website' }), 'website');
});

test('without inferredGoal the website rule still applies; nothing to go on asks', () => {
  assert.equal(appGoal({ _id: 'a', aiBot: { status: 'on', siteUrlsV2: [{}] } }), 'website');
  assert.equal(appGoal({ _id: 'a', inferredGoal: null, aiBot: { status: 'on' } }), null);
  assert.equal(appGoal(null), null);
});
