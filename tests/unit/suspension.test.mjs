import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  isSignupBlockedError,
  isValidSupportContact,
  parseBlockedDomains,
  supportContactHref,
  suspensionFromError,
  suspensionReasonKey,
} from '../../src/utils/suspension.ts';

const refusal = (status, data) => ({ response: { status, data } });

test('a 403 USER_SUSPENDED yields the notice', () => {
  const notice = suspensionFromError(
    refusal(403, {
      code: 'USER_SUSPENDED',
      details: {
        suspension: {
          reasonCode: 'spam',
          message: 'Bye',
          suspendedAt: '2026-11-01T00:00:00Z',
          until: null,
          supportContact: 'help@example.org',
        },
      },
    })
  );
  assert.deepEqual(notice, {
    reasonCode: 'spam',
    message: 'Bye',
    suspendedAt: '2026-11-01T00:00:00Z',
    until: null,
    supportContact: 'help@example.org',
  });
});

test('other refusals are not a suspension', () => {
  assert.equal(suspensionFromError(refusal(403, { code: 'USER_ARCHIVED' })), null);
  assert.equal(suspensionFromError(refusal(401, { code: 'USER_SUSPENDED' })), null);
  assert.equal(suspensionFromError(new Error('network')), null);
  assert.equal(suspensionFromError(null), null);
  // Without details the screen still opens, with the generic text.
  assert.equal(suspensionFromError(refusal(403, { code: 'USER_SUSPENDED' }))?.reasonCode, null);
});

test('sign-up block codes', () => {
  assert.equal(isSignupBlockedError(refusal(403, { code: 'SIGNUP_EMAIL_DOMAIN_BLOCKED' })), true);
  assert.equal(isSignupBlockedError(refusal(403, { code: 'SIGNUP_EMAIL_BLOCKED' })), true);
  assert.equal(isSignupBlockedError(refusal(403, { code: 'REGISTRATION_DISABLED' })), false);
});

test('reason keys fall back to other', () => {
  assert.equal(suspensionReasonKey('child_safety'), 'userSuspension.reason.child_safety');
  assert.equal(suspensionReasonKey('made_up'), 'userSuspension.reason.other');
  assert.equal(suspensionReasonKey(null), 'userSuspension.reason.other');
});

test('support contact links', () => {
  assert.equal(supportContactHref('help@example.org'), 'mailto:help@example.org');
  assert.equal(supportContactHref('https://example.org/help'), 'https://example.org/help');
  assert.equal(supportContactHref('example.org/help'), 'https://example.org/help');
  assert.equal(supportContactHref('javascript:alert(1)'), null);
  assert.equal(supportContactHref(''), null);
});

test('support contact validation', () => {
  assert.equal(isValidSupportContact(''), true);
  assert.equal(isValidSupportContact('help@example.org'), true);
  assert.equal(isValidSupportContact('https://example.org/help'), true);
  assert.equal(isValidSupportContact('http://example.org/help'), false);
  assert.equal(isValidSupportContact('example.org'), false);
});

test('blocked domain patterns', () => {
  const { patterns, invalid } = parseBlockedDomains('*.sch.uk\n  *.K12.*.us \n\n@example.org\nexample.org\nnot a domain\nlocalhost');
  assert.deepEqual(patterns, ['*.sch.uk', '*.k12.*.us', 'example.org']);
  assert.deepEqual(invalid, ['not a domain', 'localhost']);
});
