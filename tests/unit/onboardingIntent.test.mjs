import test from 'node:test';
import assert from 'node:assert/strict';
import { explicitOnboardingIntent, inferOnboardingIntent, normaliseWebsite, suggestAssistantName } from '../../src/utils/onboardingIntent.ts';

const p = (q) => new URLSearchParams(q);

test('explicit intents map to the four goals; calls fold into the SDK goal', () => {
  assert.equal(explicitOnboardingIntent(p('intent=widget')), 'website');
  assert.equal(explicitOnboardingIntent(p('intent=calls')), 'sdk');
  assert.equal(explicitOnboardingIntent(p('intent=chat-sdk')), 'sdk');
  assert.equal(explicitOnboardingIntent(p('intent=messenger')), 'messenger');
  assert.equal(explicitOnboardingIntent(p('intent=self-hosted')), 'selfHost');
  assert.equal(explicitOnboardingIntent(p('source_page=/ai-widget/')), null);
});

test('the entry page only infers a goal', () => {
  assert.equal(inferOnboardingIntent(p('source_page=https://ethora.com/ai-widget/')), 'website');
  assert.equal(inferOnboardingIntent(p('source_page=/get/')), 'selfHost');
  assert.equal(inferOnboardingIntent(p('source_page=/video-calls-sdk/')), 'sdk');
  assert.equal(inferOnboardingIntent(p('source_page=/white-label-messenger/')), 'messenger');
  assert.equal(inferOnboardingIntent(p('')), null);
});

test('website helpers', () => {
  assert.equal(normaliseWebsite('yourbusiness.com'), 'https://yourbusiness.com/');
  assert.equal(normaliseWebsite('ftp://x.com'), null);
  assert.equal(normaliseWebsite('nonsense'), null);
  assert.equal(suggestAssistantName('https://www.yourbusiness.com/about', 'assistant'), 'Yourbusiness assistant');
  assert.equal(suggestAssistantName('https://www.yourbusiness.com/about', '{name} assistant'), 'Yourbusiness assistant');
  assert.equal(suggestAssistantName('yourbusiness.com', 'Asistente de {name}'), 'Asistente de Yourbusiness');
});
