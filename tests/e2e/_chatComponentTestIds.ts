/**
 * Local mirror of `@ethora/chat-component`'s public testid constants.
 *
 * The chat-component package exports these via `src/main.ts` (see PR
 * https://github.com/dappros/ethora-chat-component/pull/71). Once that
 * PR merges and a new version (>= 26.3.18) publishes, replace the
 * inline definitions below with:
 *
 *     import {
 *       ChatInputTestIds,
 *       MessageBubbleTestIds,
 *       RoomListTestIds,
 *       AuthTestIds,
 *     } from '@ethora/chat-component';
 *
 * and delete the literals here. The string values are the source of
 * truth for cross-platform testing — they also match Android's
 * `*TestTags` Kotlin objects (in `ethora-sdk-android`'s `chat-ui`
 * module) and iOS's `*AccessibilityID` Swift enums (in
 * `ethora-sdk-swift`'s `XMPPChatUI/AccessibilityIdentifiers.swift`).
 *
 * Maestro flows in `ethora-sample-android/.maestro/` and
 * `ethora-sample-swift/.maestro/` already use these strings via
 * `id: "chat_input"` etc. So a Playwright test in this repo that
 * resolves `[data-testid="chat_input"]` is exercising the same
 * intent as the corresponding mobile flow — three platforms,
 * one selector contract.
 */

export const ChatInputTestIds = {
  inputField: 'chat_input',
  sendButton: 'chat_send_button',
  attachButton: 'chat_attach_button',
} as const;

export const MessageBubbleTestIds = {
  mediaContent: 'chat_message_image',
} as const;

export const RoomListTestIds = {
  roomsList: 'rooms_list',
  roomRow: 'room_row',
  searchInput: 'rooms_search_input',
  createRoomButton: 'create_room_button',
} as const;

export const AuthTestIds = {
  emailInput: 'auth_email_input',
  passwordInput: 'auth_password_input',
  submitButton: 'auth_submit_button',
  emailError: 'auth_email_error',
  passwordError: 'auth_password_error',
} as const;
