// node --experimental-strip-types --test tests/unit/*.test.mjs   (Node 22.6+)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isServerEvent, readEthoraEvent } from '../../src/lib/ethoraEvents.ts';

const event = (overrides = {}) => ({
  stanza: "<message><ethora-event xmlns='urn:ethora:events:1' type='x'/></message>",
  from: 'admin@xmpp.example.test',
  to: 'app_user@xmpp.example.test/web',
  type: 'headline',
  ...overrides,
});

const parsed = (text = '{"a":1}') => () => ({ type: 'x', text });

test('a headline from a bare JID on the own domain is a server event', () => {
  assert.equal(isServerEvent(event()), true);
});

test('another user cannot pose as the server', () => {
  assert.equal(isServerEvent(event({ from: 'app_other@xmpp.example.test/web' })), false);
});

test('rooms and other domains are not the server', () => {
  assert.equal(isServerEvent(event({ from: 'room@conference.xmpp.example.test' })), false);
  assert.equal(isServerEvent(event({ from: 'admin@elsewhere.test' })), false);
});

test('the bare server domain is not an event sender here', () => {
  assert.equal(isServerEvent(event({ from: 'xmpp.example.test' })), false);
});

test('only headlines qualify', () => {
  assert.equal(isServerEvent(event({ type: 'chat' })), false);
  assert.equal(isServerEvent(event({ type: undefined })), false);
});

test('the event type and JSON payload are read', () => {
  assert.deepEqual(readEthoraEvent(event(), parsed()), { type: 'x', payload: { a: 1 } });
});

test('an event without a payload still arrives', () => {
  assert.deepEqual(readEthoraEvent(event(), parsed('')), { type: 'x', payload: null });
});

test('an untrusted sender never reaches the parser', () => {
  const parse = () => assert.fail('parsed an untrusted stanza');
  assert.equal(readEthoraEvent(event({ from: 'a@xmpp.example.test/web' }), parse), null);
});

test('an ordinary chat message skips the parser', () => {
  const parse = () => assert.fail('parsed a chat message');
  assert.equal(readEthoraEvent(event({ stanza: '<message><body>hi</body></message>' }), parse), null);
});

test('malformed input is dropped, not thrown', () => {
  assert.equal(readEthoraEvent(event(), parsed('{not json')), null);
  assert.equal(readEthoraEvent(event(), () => null), null);
  assert.equal(
    readEthoraEvent(event(), () => {
      throw new Error('bad xml');
    }),
    null
  );
});
