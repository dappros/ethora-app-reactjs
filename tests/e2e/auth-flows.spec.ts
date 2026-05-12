/**
 * Auth-flow Playwright tests against the host app's OWN login form
 * (`src/pages/AuthPage/Login/Steps/LoginForm.tsx`). The chat-component
 * has its own `<Login>` for embed scenarios — that one is covered by
 * Vitest in `ethora-chat-component`. Here we drive the admin/portal
 * login the host renders at `/login`.
 *
 * Mocks all HTTP — no real backend needed. Mirrors the pattern in
 * `smoke.spec.ts` for `/v1/apps/get-config`.
 */

import { expect, Page, test } from '@playwright/test';

const appConfigResponse = {
  result: {
    _id: 'playwright-app',
    afterLoginPage: '/app/admin/apps',
    aiBot: {
      userId: '',
      chatId: '',
      status: 'off',
      greetingMessage: '',
      isRAG: false,
      trigger: '',
      prompt: '',
      siteLinks: [],
      siteUrlsV2: [],
      files: [],
      user: { _id: '', firstName: '', lastName: '', isBot: true },
      chat: { _id: '', name: '', title: '', description: '', type: '', picture: '' },
    },
    allowUsersToCreateRooms: true,
    appTagline: 'Playwright auth-flow environment',
    appToken: 'playwright-app-token',
    availableMenuItems: { chats: true, profile: true, settings: true },
    bundleId: 'com.ethora.playwright',
    coinName: 'Ethora',
    coinSymbol: 'ETHORA',
    createdAt: '2026-01-01T00:00:00.000Z',
    creatorId: 'playwright-user',
    defaultAccessAssetsOpen: true,
    defaultAccessProfileOpen: true,
    defaultRooms: [],
    displayName: 'Ethora Test App',
    domainName: 'playwright.local',
    firebaseWebConfigString: '',
    googleServiceInfoPlist: '',
    googleServicesJson: '',
    isAllowedNewAppCreate: true,
    isBaseApp: false,
    logoImage: '',
    parentAppId: '',
    primaryColor: '#0052CD',
    signonOptions: ['email'],
    stats: {
      recentlyApiCalls: 0,
      recentlyFiles: 0,
      recentlyIssuance: 0,
      recentlyRegistered: 0,
      recentlySessions: 0,
      recentlyTokens: 0,
      recentlyTransactions: 0,
      totalApiCalls: 0,
      totalFiles: 0,
      totalIssuance: 0,
      totalRegistered: 0,
      totalSessions: 0,
      totalTransactions: 0,
      totalChats: 0,
      totalTokens: 0,
      recentlyChats: 0,
    },
    sublogoImage: '',
    systemChatAccount: { jid: 'system@example.com' },
    updatedAt: '2026-01-01T00:00:00.000Z',
    usersCanFree: true,
  },
};

async function mockAppConfig(page: Page) {
  await page.route('**/v1/apps/get-config*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(appConfigResponse),
    });
  });
}

test.beforeEach(async ({ page }) => {
  await mockAppConfig(page);
});

test('login form rejects empty submit with required-field validation', async ({
  page,
}) => {
  await page.goto('/login');

  // Click "Sign In" without typing anything. react-hook-form fires
  // `required` validation messages without hitting the API.
  await page.getByRole('button', { name: 'Sign In' }).click();

  // The form's required validators surface the messages defined in
  // LoginForm.tsx: 'Email is required' + 'Required field' (password).
  await expect(page.getByText('Email is required')).toBeVisible();
  await expect(page.getByText('Required field')).toBeVisible();
});

test('login form rejects invalid email format with regex error', async ({
  page,
}) => {
  await page.goto('/login');

  await page.getByPlaceholder('Email').fill('not-an-email');
  await page.getByPlaceholder('Password').fill('something');
  await page.getByRole('button', { name: 'Sign In' }).click();

  // The pattern check in LoginForm.tsx fires "Invalid email address"
  // for anything that doesn't match /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.
  await expect(page.getByText('Invalid email address')).toBeVisible();
});

test('login form posts to /v1/users/login-with-email on valid input', async ({
  page,
}) => {
  let postedBody: { email?: string; password?: string } | null = null;

  // Intercept the login endpoint. We don't need to fully roundtrip
  // through actionAfterLogin (that pulls the user via /me, sets
  // auth state, navigates to /app/admin/apps); just proving the
  // request fires with the right body confirms the form's HTTP
  // wiring is intact.
  await page.route('**/v1/users/login-with-email', async (route) => {
    const request = route.request();
    try {
      postedBody = JSON.parse(request.postData() || '{}');
    } catch {
      postedBody = null;
    }
    // Reply with a 401 so the test exits the auth flow without
    // needing to mock the rest of the post-login bootstrap chain
    // (/me, /apps/get-config-by-token, etc.). The form's behavior
    // we care about — "submit fired with the right body" — has
    // already been observed by this point.
    await route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Invalid credentials' }),
    });
  });

  await page.goto('/login');
  await page.getByPlaceholder('Email').fill('alice@ethora.com');
  await page.getByPlaceholder('Password').fill('TestPass123');
  await page.getByRole('button', { name: 'Sign In' }).click();

  // Wait for the POST to be intercepted (Playwright fulfills it
  // synchronously, so the test can read postedBody right after
  // waitForRequest resolves).
  await page.waitForRequest('**/v1/users/login-with-email');

  expect(postedBody).not.toBeNull();
  expect(postedBody?.email).toBe('alice@ethora.com');
  expect(postedBody?.password).toBe('TestPass123');
});
