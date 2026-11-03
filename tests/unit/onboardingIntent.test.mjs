import { test } from 'node:test';
import assert from 'node:assert/strict';
import { inferOnboardingIntent } from '../../src/utils/onboardingIntent.ts';

test('explicit intent takes priority over a landing page', () => {
  assert.equal(inferOnboardingIntent(new URLSearchParams('intent=chat-sdk&source_page=/ai-sdk/embeddable-ai-agent-script/')), 'chat');
  assert.equal(inferOnboardingIntent(new URLSearchParams('intent=self-hosted')), 'selfHost');
  assert.equal(inferOnboardingIntent(new URLSearchParams('intent=widget')), 'website');
  assert.equal(inferOnboardingIntent(new URLSearchParams('intent=ai')), 'website');
  assert.equal(inferOnboardingIntent(new URLSearchParams('intent=video')), 'calls');
});

test('known landing paths suggest a goal without guessing from campaigns', () => {
  assert.equal(inferOnboardingIntent(new URLSearchParams('first_page=https://ethora.com/chat-sdk/self-hosted-chat-server-aws/')), 'selfHost');
  assert.equal(inferOnboardingIntent(new URLSearchParams('source_page=/ai-sdk/embeddable-ai-agent-script/')), 'website');
  assert.equal(inferOnboardingIntent(new URLSearchParams('source_page=/ai-sdk/')), 'website');
  assert.equal(inferOnboardingIntent(new URLSearchParams('utm_term=ai+widget')), null);
});
