// node --experimental-strip-types --test tests/unit/*.test.mjs   (Node 22.6+)
import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  announceChatComponentConfigSaved,
  knownChatComponentConfigVersion,
  noteChatComponentConfigVersion,
  resetChatComponentConfigSync,
  subscribeChatComponentConfigSaved,
} from '../../src/lib/chatComponentConfigSync.ts';
import { sameChatConfig, withConfigUpdatedHandler, applyChatComponentConfig } from '../../src/lib/chatComponentConfig.ts';

afterEach(() => resetChatComponentConfigSync());

const APP = '646cc8dc96d4a4dc8f7b2f2d';
const tick = (ms = 30) => new Promise((r) => setTimeout(r, ms));

test('remembers the newest version per app and ignores junk', () => {
  assert.equal(knownChatComponentConfigVersion(APP), undefined);
  noteChatComponentConfigVersion(APP, '1790000000100');
  noteChatComponentConfigVersion(APP, '1790000000050');
  assert.equal(knownChatComponentConfigVersion(APP), '1790000000100');
  noteChatComponentConfigVersion(APP, '1790000000200');
  assert.equal(knownChatComponentConfigVersion(APP), '1790000000200');
  noteChatComponentConfigVersion(APP, 'x y;');
  noteChatComponentConfigVersion(APP, '');
  noteChatComponentConfigVersion(APP, undefined);
  noteChatComponentConfigVersion('', '5');
  assert.equal(knownChatComponentConfigVersion(APP), '1790000000200');
  assert.equal(knownChatComponentConfigVersion('other'), undefined);
});

test('a save is announced to listeners of this tab and noted', () => {
  const seen = [];
  const off = subscribeChatComponentConfigSaved((e) => seen.push(e));
  announceChatComponentConfigSaved({ appId: APP, version: '77' });
  assert.deepEqual(seen, [{ appId: APP, version: '77' }]);
  assert.equal(knownChatComponentConfigVersion(APP), '77');
  off();
  announceChatComponentConfigSaved({ appId: APP, version: '78' });
  assert.equal(seen.length, 1);
});

test('a malformed announcement is dropped', () => {
  const seen = [];
  subscribeChatComponentConfigSaved((e) => seen.push(e));
  announceChatComponentConfigSaved({ appId: '', version: '1' });
  announceChatComponentConfigSaved({ appId: APP, version: 'bad version' });
  announceChatComponentConfigSaved({ appId: APP });
  announceChatComponentConfigSaved(null);
  assert.deepEqual(seen, []);
});

test('a throwing listener does not stop the others', () => {
  const seen = [];
  subscribeChatComponentConfigSaved(() => {
    throw new Error('boom');
  });
  subscribeChatComponentConfigSaved((e) => seen.push(e.version));
  announceChatComponentConfigSaved({ appId: APP, version: '9' });
  assert.deepEqual(seen, ['9']);
});

test('another tab of the browser reaches the listeners through the channel, once, and is not echoed', async (t) => {
  if (typeof BroadcastChannel === 'undefined') return t.skip('no BroadcastChannel');
  const seen = [];
  subscribeChatComponentConfigSaved((e) => seen.push(e));
  const otherTab = new BroadcastChannel('ethora-chat-component-config');
  const echoes = [];
  otherTab.onmessage = (m) => echoes.push(m.data);
  try {
    otherTab.postMessage({ appId: APP, version: '55' });
    otherTab.postMessage({ appId: APP, version: 'not valid!' });
    otherTab.postMessage('nonsense');
    await tick();
    assert.deepEqual(seen, [{ appId: APP, version: '55' }]);
    assert.equal(knownChatComponentConfigVersion(APP), '55');
    // receiving does not re-broadcast
    assert.deepEqual(echoes, []);
    // our own announcement reaches the other tab
    announceChatComponentConfigSaved({ appId: APP, version: '56' });
    await tick();
    assert.deepEqual(echoes, [{ appId: APP, version: '56' }]);
  } finally {
    otherTab.close();
  }
});

test('sameChatConfig compares flat records', () => {
  assert.equal(sameChatConfig({ a: '1', b: true }, { b: true, a: '1' }), true);
  assert.equal(sameChatConfig({ a: '1' }, { a: '2' }), false);
  assert.equal(sameChatConfig({ a: '1' }, {}), false);
  assert.equal(sameChatConfig({}, {}), true);
});

test('withConfigUpdatedHandler adds the handler and keeps the host handlers', () => {
  const onMessageSent = () => {};
  const base = { appId: 'a', eventHandlers: { onMessageSent } };
  const calls = [];
  const out = withConfigUpdatedHandler(base, (e) => calls.push(e));
  assert.equal(out.eventHandlers.onMessageSent, onMessageSent);
  out.eventHandlers.onChatComponentConfigUpdated({ appId: 'a', version: '2' });
  assert.deepEqual(calls, [{ appId: 'a', version: '2' }]);
  assert.equal(base.eventHandlers.onChatComponentConfigUpdated, undefined);
  assert.equal(out.appId, 'a');
  const bare = withConfigUpdatedHandler({ appId: 'b' }, () => {});
  assert.equal(typeof bare.eventHandlers.onChatComponentConfigUpdated, 'function');
});

test('the saved record is laid over the chat config without losing siblings', () => {
  const base = { colors: { primary: '#111111', secondary: '#222222' }, disableMedia: false };
  const out = applyChatComponentConfig(base, { 'colors.primary': '#0052cd', disableMedia: true });
  assert.deepEqual(out.colors, { primary: '#0052cd', secondary: '#222222' });
  assert.equal(out.disableMedia, true);
  assert.equal(base.colors.primary, '#111111');
  assert.equal(applyChatComponentConfig(base, null), base);
  assert.equal(applyChatComponentConfig(base, {}), base);
});
