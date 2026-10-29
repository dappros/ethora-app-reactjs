import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isReturnablePath, signedOutEntryPath } from '../../src/utils/returnPath.ts';

const CHAT = '646cc8dc96d4a4dc8f7b2f2d_6a48b84be7b43f307b6f0286';

test('a shared chat link is kept through the login', () => {
  assert.equal(isReturnablePath(`/app/chat?chatId=${CHAT}`), true);
  assert.equal(isReturnablePath(`/app/chat?qrChatId=${CHAT}`), true);
  assert.equal(isReturnablePath(`/app/chat?chatId=${CHAT}&messageId=abc`), true);
  assert.equal(isReturnablePath(`/app/chat?lang=uk&chatId=${CHAT}@conference.example.com`), true);
  assert.equal(signedOutEntryPath('/app/chat'), '/login');
});

test('the chat page without a chat id, or with a malformed one, is not', () => {
  assert.equal(isReturnablePath('/app/chat'), false);
  assert.equal(isReturnablePath('/app/chat?chatId='), false);
  assert.equal(isReturnablePath('/app/chat?chatId=<script>'), false);
  assert.equal(isReturnablePath(`//evil.com/app/chat?chatId=${CHAT}`), false);
  assert.equal(isReturnablePath(`/app/admin?chatId=${CHAT}`), false);
});

test('existing call and agent links still work', () => {
  assert.equal(isReturnablePath('/call/abcdefghijklmnopqrstuvwxyz'), true);
  assert.equal(isReturnablePath('/agent/0x3f5A9c21B7e04D8a6F1c2E9b0D47a8C5e6B19f02'), true);
});
