import { expect, Page, Route, test } from '@playwright/test';

// App settings > AI Widget against a fake API: the widget appearance is read
// from and saved to the App (GET/PUT /v2/apps/:appId/widget/appearance), a
// copy an older build left in localStorage is offered once for saving, and the
// embed snippet carries the appearance only when the operator pins it.

const USER_ID = 'e2e-user';
const APP_ID = 'e2eapp000000000000000001';
const LEGACY_KEY = `ethora_ai_widget_appearance_${APP_ID}`;
const APP_ID_2 = 'e2eapp000000000000000009';
const draftKey = (id: string) => `widget-appearance-draft:${id}`;

const app = {
  _id: APP_ID,
  displayName: 'E2E Widget App',
  creatorId: USER_ID,
  appTagline: '',
  primaryColor: '#0052CD',
  signonOptions: ['email'],
  availableMenuItems: { chats: true, profile: true, settings: true },
  aiBot: { status: 'on', userId: 'e2e-bot' },
  defaultChatRooms: [],
  defaultBotInstanceId: 'e2e-bi',
  onboardingGoal: 'website',
  milestones: {},
};

const agent = { id: 'e2e-agent', displayName: 'E2E Assistant', ownerId: USER_ID, visibility: 'private', ownerAppId: APP_ID };
const botInstance = { id: 'e2e-bi', agentId: 'e2e-agent', appId: APP_ID, status: 'on' };

async function fakeBackend(page: Page, stored: Record<string, string>, opts: { withAgent?: boolean } = {}) {
  const withAgent = opts.withAgent !== false;
  const theApp = withAgent ? app : { ...app, defaultBotInstanceId: undefined };
  const puts: Array<Record<string, string>> = [];
  const json = (route: Route, body: unknown, status = 200) =>
    route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });

  // Runtime config: this tab renders read-only on installs without AI.
  await page.route('**/config.js', (route) =>
    route.fulfill({
      contentType: 'application/javascript',
      body: 'window.__ETHORA_CONFIG__ = { VITE_AI_FEATURE_ENABLED: "true" };',
    }),
  );

  await page.route(
    (url) => /^\/v[12]\//.test(url.pathname),
    async (route) => {
      const req = route.request();
      const { pathname } = new URL(req.url());
      const method = req.method();
      if (pathname === '/v1/apps/get-config') return json(route, appConfig);
      if (pathname === '/v1/users/me') return json(route, me);
      if (pathname === '/v1/apps') return json(route, { apps: [theApp], total: 1 });
      if (pathname === `/v1/apps/${APP_ID}`) return json(route, { result: theApp });
      // A second App, for switching between Apps.
      if (pathname === `/v1/apps/${APP_ID_2}`) return json(route, { result: { ...theApp, _id: APP_ID_2, displayName: 'E2E Second App' } });
      if (pathname === `/v2/apps/${APP_ID_2}/widget/appearance` && method === 'GET') return json(route, { ok: true, appearance: {} });
      if (pathname === '/v2/agents') return json(route, { items: withAgent ? [agent] : [], total: withAgent ? 1 : 0 });
      if (pathname === '/v2/bot-instances') return json(route, { items: withAgent ? [botInstance] : [], total: withAgent ? 1 : 0 });
      if (pathname === `/v2/apps/${APP_ID}/widget/appearance` && method === 'GET') {
        return json(route, { ok: true, appearance: stored });
      }
      if (pathname === `/v2/apps/${APP_ID}/widget/appearance` && method === 'PUT') {
        const { appearance } = req.postDataJSON() as { appearance: Record<string, string> };
        puts.push(appearance);
        stored = appearance;
        return json(route, { ok: true, appearance });
      }
      return json(route, { ok: true, items: [], total: 0 });
    },
  );

  await page.addInitScript(() => {
    localStorage.setItem('token-538', 'e2e-token');
    localStorage.setItem('refreshToken-538', 'e2e-refresh');
  });
  return { puts };
}

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

// The App's AI assistant tab (was Settings > AI Widget).
const openTab = (page: Page) => page.goto(`/app/admin/apps/${APP_ID}/assistant`);
const openAppearance = (page: Page) => page.getByRole('button', { name: 'Customize' }).click();

test('loads the saved appearance from the App and saves changes back to it', async ({ page }) => {
  const { puts } = await fakeBackend(page, { 'data-title': 'Help desk' });
  await openTab(page);
  await openAppearance(page);
  const title = page.getByLabel('Popup title');
  await expect(title).toHaveValue('Help desk');

  await title.fill('Ask us');
  await page.getByRole('button', { name: 'Save appearance' }).click();
  await expect(page.getByText('Widget appearance saved')).toBeVisible();
  expect(puts).toEqual([{ 'data-title': 'Ask us' }]);
  await expect(page.getByTestId('assistant-section-looks').getByText('Unsaved changes')).toHaveCount(0);
});

test('the snippet stays minimal unless the appearance is pinned', async ({ page }) => {
  await fakeBackend(page, { 'data-title': 'Help desk' });
  await openTab(page);
  const code = page.locator('pre').filter({ hasText: 'data-app-id' });
  await expect(code).toContainText(`data-app-id="${APP_ID}"`);
  await expect(code).not.toContainText('data-title="Help desk"');

  await page.getByLabel('Pin the appearance in the snippet').check();
  await expect(code).toContainText('data-title="Help desk"');
});

test('offers to save appearance an older build kept in this browser', async ({ page }) => {
  const { puts } = await fakeBackend(page, {});
  await page.addInitScript((key) => {
    localStorage.setItem(key, JSON.stringify({ title: 'From this browser' }));
  }, LEGACY_KEY);
  await openTab(page);
  const banner = page.getByRole('status').filter({ hasText: 'earlier version of this page' });
  await expect(banner).toBeVisible();
  await banner.getByRole('button', { name: 'Save and apply' }).click();
  await expect(banner).toHaveCount(0);
  expect(puts).toEqual([{ 'data-title': 'From this browser' }]);
  await openAppearance(page);
  await expect(page.getByLabel('Popup title')).toHaveValue('From this browser');
  expect(await page.evaluate((key) => localStorage.getItem(key), LEGACY_KEY)).toBeNull();
});

test('does not offer the browser copy when the App already has an appearance', async ({ page }) => {
  await fakeBackend(page, { 'data-title': 'Help desk' });
  await page.addInitScript((key) => {
    localStorage.setItem(key, JSON.stringify({ title: 'From this browser' }));
  }, LEGACY_KEY);
  await openTab(page);
  await openAppearance(page);
  await expect(page.getByLabel('Popup title')).toHaveValue('Help desk');
  await expect(page.getByText('earlier version of this page')).toHaveCount(0);
});

test('layout: four sections, the test chat in view, appearance and advanced folded', async ({ page }) => {
  await fakeBackend(page, {});
  await openTab(page);
  for (const id of ['knows', 'answers', 'looks', 'install']) {
    await expect(page.getByTestId(`assistant-section-${id}`)).toBeVisible();
  }
  await expect(page.getByTestId('assistant-test')).toBeVisible();
  await expect(page.getByTestId('assistant-test').getByRole('heading', { name: 'Test it' })).toBeVisible();
  // Appearance editor and advanced panels only on request.
  await expect(page.getByLabel('Popup title')).toHaveCount(0);
  await expect(page.getByTestId('assistant-advanced')).not.toHaveAttribute('open', '');
  await openAppearance(page);
  await expect(page.getByLabel('Popup title')).toBeVisible();
  // Not seen on any site yet.
  await expect(page.getByTestId('assistant-section-install')).toContainText('Not detected yet');
  await expect(page.getByTestId('app-assistant')).toContainText('Ready to answer visitors');
});

test('selecting the snippet text copies it as written, not one token per line', async ({ page }) => {
  await fakeBackend(page, {});
  await openTab(page);
  const pre = page.locator('pre').filter({ hasText: 'data-app-id' });
  await expect(pre).toBeVisible();
  const selected = await pre.evaluate((el) => {
    const code = el.querySelector('code') as HTMLElement;
    const range = document.createRange();
    range.selectNodeContents(code);
    const sel = window.getSelection()!;
    sel.removeAllRanges();
    sel.addRange(range);
    return sel.toString();
  });
  const lines = selected.trim().split('\n');
  expect(lines[0]).toBe('<script');
  expect(lines).toContain(`  data-app-id="${APP_ID}"`);
  expect(lines[lines.length - 1]).toBe('></script>');
  expect(lines.length).toBeLessThanOrEqual(7);
});

test('old Settings > AI Widget links open the AI assistant tab', async ({ page }) => {
  await fakeBackend(page, {});
  await page.goto(`/app/admin/apps/${APP_ID}/settings?tab=AI+Widget`);
  await expect(page).toHaveURL(new RegExp(`/app/admin/apps/${APP_ID}/assistant$`));
  await expect(page.getByTestId('app-assistant')).toBeVisible();
});

test('an App without an assistant offers to create one', async ({ page }) => {
  await fakeBackend(page, {}, { withAgent: false });
  await openTab(page);
  await expect(page.getByTestId('assistant-empty')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Create an AI assistant' })).toBeEnabled();
});

test('an unsaved appearance survives a reload of the tab', async ({ page }) => {
  await fakeBackend(page, { 'data-title': 'Help desk' });
  await openTab(page);
  await openAppearance(page);
  await page.getByLabel('Popup title').fill('Draft title');
  await expect.poll(() => page.evaluate((k) => sessionStorage.getItem(k), draftKey(APP_ID))).toContain('Draft title');
  await page.reload();
  await openAppearance(page);
  await expect(page.getByLabel('Popup title')).toHaveValue('Draft title');
});

test('switching App never writes or deletes a draft under the other App', async ({ page }) => {
  await fakeBackend(page, { 'data-title': 'Help desk' });
  await openTab(page);
  await openAppearance(page);
  await page.getByLabel('Popup title').fill('Draft for app one');
  await expect.poll(() => page.evaluate((k) => sessionStorage.getItem(k), draftKey(APP_ID))).toContain('Draft for app one');
  // In-app navigation to the second App's AI assistant tab.
  await page.evaluate((id) => {
    window.history.pushState({}, '', `/app/admin/apps/${id}/assistant`);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }, APP_ID_2);
  await page.waitForTimeout(1500);
  expect(await page.evaluate((k) => sessionStorage.getItem(k), draftKey(APP_ID_2))).toBeNull();
  expect(await page.evaluate((k) => sessionStorage.getItem(k), draftKey(APP_ID))).toContain('Draft for app one');
});
