/**
 * Chat-flow Playwright tests against the host's `/app/chat` route,
 * where `<Chat>` from `@ethora/chat-component` mounts. Resolves nodes
 * by `data-testid` using the constants from `_chatComponentTestIds.ts`,
 * which mirrors the chat-component package's public testid API.
 *
 * Cross-platform parity: the same testid strings drive Maestro
 * flows on Android (`ethora-sample-android/.maestro/`) and iOS
 * (`ethora-sample-swift/.maestro/`). One selector contract → three
 * platforms.
 *
 * Status: most tests below are `test.fixme()` until backend mocks
 * for the post-login bootstrap (`/me`, `/apps/get-config-by-token`,
 * `/chats/my`, XMPP WebSocket handshake) are wired. The shape and
 * the `data-testid` anchors are in place so filling each in is a
 * mechanical follow-up.
 */

import { expect, test } from '@playwright/test';
import {
  ChatInputTestIds,
  RoomListTestIds,
} from './_chatComponentTestIds';

test.describe('chat-component on /app/chat', () => {
  test.fixme(
    'mounts the room list when the user lands on /app/chat',
    async ({ page }) => {
      // Pre-condition: an authenticated session. The host reads
      // tokens from localStorage on boot via actionAfterLogin's
      // persistence side effects. Easiest CI shape is to seed the
      // expected localStorage keys via page.addInitScript before
      // navigation, and route /me + /chats/my to a fixture.
      await page.addInitScript(() => {
        localStorage.setItem(
          'auth_token',
          'JWT eyJhbGciOiJIUzI1NiJ9.fake-test-token'
        );
        // Seed whatever other auth state the host expects — this
        // shape needs to match useAppStore's persistence schema.
      });

      await page.route('**/v1/chats/my**', async (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            result: [
              {
                _id: 'room-1',
                name: 'maestro-test-room',
                title: 'Maestro Test Room',
                jid: 'maestro_room@conference.xmpp.chat-qa.ethora.com',
                participants: [],
                messages: [],
                pendingMessages: 0,
              },
            ],
          }),
        })
      );

      await page.goto('/app/chat');

      // chat-component's RoomListView wraps its <List> with
      // `data-testid="rooms_list"` (RoomListTestIds.roomsList).
      // If the constant ever changes upstream, the local mirror
      // and Android/iOS tags must move in lockstep.
      await expect(
        page.locator(`[data-testid="${RoomListTestIds.roomsList}"]`)
      ).toBeVisible();

      await expect(
        page.locator(`[data-testid="${RoomListTestIds.roomRow}"]`).first()
      ).toBeVisible();
    }
  );

  test.fixme(
    'send a message via the chat input',
    async ({ page }) => {
      // Same auth + rooms-list pre-condition as the test above.
      // After selecting a room, type into the chat input and
      // assert the bubble renders. The actual XMPP send is hard
      // to fully mock — easier to point this test at chat-qa
      // when run with PLAYWRIGHT_REAL_BACKEND=1 and skip in CI
      // unless the env var is set.
      await page.goto('/app/chat');
      await page
        .locator(`[data-testid="${RoomListTestIds.roomRow}"]`)
        .first()
        .click();

      const messageBody = `playwright-${Date.now()}`;
      await page
        .locator(`[data-testid="${ChatInputTestIds.inputField}"]`)
        .fill(messageBody);
      await page
        .locator(`[data-testid="${ChatInputTestIds.sendButton}"]`)
        .click();

      await expect(page.getByText(messageBody)).toBeVisible({
        timeout: 5000,
      });
    }
  );

  test.fixme(
    'attach button is visible and enabled when media is allowed',
    async ({ page }) => {
      await page.goto('/app/chat');
      await page
        .locator(`[data-testid="${RoomListTestIds.roomRow}"]`)
        .first()
        .click();

      // chat-component renders the attach button only when the
      // host config sets onSendMedia. The host's Chat.tsx mounts
      // <Chat> with media enabled by default.
      const attach = page.locator(
        `[data-testid="${ChatInputTestIds.attachButton}"]`
      );
      await expect(attach).toBeVisible();
      await expect(attach).toBeEnabled();
    }
  );
});
