import { expect, Page, Route, test } from '@playwright/test';

// Help: the weekly release notes from GET /v2/release-notes, against a faked API.
const USER_ID = 'e2e-user';
const APP_ID = 'e2eapp000000000000000002';

const baseApp = {
  _id: APP_ID,
  displayName: 'E2E Onboarding App',
  creatorId: USER_ID,
  primaryColor: '#0052CD',
  signonOptions: ['email'],
  availableMenuItems: { chats: true, profile: true, settings: true },
  aiBot: { status: 'on', userId: 'e2e-bot' },
  defaultChatRooms: [],
  stats: {},
};

const appConfig = {
  result: {
    _id: 'e2e-app',
    displayName: 'Ethora Test App',
    afterLoginPage: '/app/admin/apps',
    primaryColor: '#0052CD',
    signonOptions: ['email'],
    availableMenuItems: { chats: true, profile: true, settings: true },
    defaultRooms: [],
    isBaseApp: true,
    isAllowedNewAppCreate: true,
    usersCanFree: true,
    stats: {},
  },
};

const me = {
  token: 'e2e-token',
  refreshToken: 'e2e-refresh',
  user: {
    _id: USER_ID,
    appId: 'e2e-app',
    firstName: 'E2E',
    lastName: 'Owner',
    email: 'e2e@example.com',
    xmppUsername: `e2e-app_${USER_ID}`,
    xmppPassword: 'x',
    isAgreeWithTerms: true,
    isSuperAdmin: {},
  },
};

async function fakeBackend(page: Page, notes: unknown) {
  const json = (route: Route, body: unknown, status = 200) =>
    route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
  await page.route('**/config.js', (route) =>
    route.fulfill({ contentType: 'application/javascript', body: 'window.__ETHORA_CONFIG__ = {};' }),
  );
  await page.route(
    (url) => /^\/v[12]\//.test(url.pathname),
    async (route) => {
      const { pathname } = new URL(route.request().url());
      if (pathname === '/v1/apps/get-config') return json(route, appConfig);
      if (pathname === '/v1/users/me') return json(route, me);
      if (pathname === '/v2/release-notes') return json(route, notes);
      return json(route, { ok: true, items: [], total: 0 });
    },
  );
  await page.addInitScript(() => {
    localStorage.setItem('token-538', 'e2e-token');
    localStorage.setItem('refreshToken-538', 'e2e-refresh');
  });
}

const URL_ALL = 'https://github.com/dappros/ethora/blob/main/RELEASE-NOTES.md';

test('Help shows the latest weekly release notes, the newest open, with a link to all of them', async ({ page }) => {
  await fakeBackend(page, {
    url: URL_ALL,
    entries: [
      { title: 'Week 46 (Nov 9 – 15, 2026) — Trust & Safety arrives', body: '### Theme\n\nThe **first** line.\n\n> [repo](https://github.com/dappros/ethora-chat-component) | 5 commits\n\n- **New:** a thing' },
      { title: 'Week 45 (Nov 2 – 8, 2026) — Second', body: 'Body 45 <img src=x onerror="window.__pwned=1"> end' },
    ],
  });
  await page.goto('/app/help');
  const section = page.getByTestId('release-notes');
  await expect(section.getByText('Week 46 (Nov 9 – 15, 2026) — Trust & Safety arrives')).toBeVisible();
  await expect(section.locator('strong', { hasText: 'first' })).toBeVisible();
  await expect(section.getByRole('link', { name: 'All release notes on GitHub' })).toHaveAttribute('href', URL_ALL);
  await expect(section.getByRole('link', { name: 'repo' })).toHaveAttribute('href', 'https://github.com/dappros/ethora-chat-component');
  // Raw HTML in the notes stays text.
  await section.getByText('Week 45 (Nov 2 – 8, 2026) — Second').click();
  await expect(section.getByText(/<img src=x/)).toBeVisible();
  expect(await section.locator('img').count()).toBe(0);
  expect(await page.evaluate(() => (window as unknown as { __pwned?: number }).__pwned)).toBeUndefined();
});

test('Help hides the release notes when there are none (outbound calls off, GitHub unreachable)', async ({ page }) => {
  await fakeBackend(page, { url: URL_ALL, entries: [] });
  await page.goto('/app/help');
  await expect(page.getByText('Help & Support').first()).toBeVisible();
  await expect(page.getByTestId('release-notes')).toHaveCount(0);
});

test('the old What\'s new address opens Help', async ({ page }) => {
  await fakeBackend(page, { url: URL_ALL, entries: [] });
  await page.goto('/app/help/whats-new');
  await expect(page).toHaveURL(/\/app\/help$/);
});
