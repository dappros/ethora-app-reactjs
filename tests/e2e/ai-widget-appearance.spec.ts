import { expect, Page, Route, test } from '@playwright/test';

// App settings > AI Widget against a fake API: the widget appearance is read
// from and saved to the App (GET/PUT /v2/apps/:appId/widget/appearance), a
// copy an older build left in localStorage is offered once for saving, and the
// embed snippet carries the appearance only when the operator pins it.

const USER_ID = 'e2e-user';
const APP_ID = 'e2eapp000000000000000001';
const LEGACY_KEY = `ethora_ai_widget_appearance_${APP_ID}`;

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
};

async function fakeBackend(page: Page, stored: Record<string, string>) {
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
      if (pathname === '/v1/apps') return json(route, { apps: [app], total: 1 });
      if (pathname === `/v1/apps/${APP_ID}`) return json(route, { result: app });
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

const openTab = (page: Page) => page.goto(`/app/admin/apps/${APP_ID}/settings?tab=AI+Widget`);
const openAppearance = (page: Page) => page.getByRole('tab', { name: /Customize appearance/ }).click();

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
  await expect(page.getByText('Unsaved changes')).toHaveCount(0);
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

test('layout: Test widget on top, one agent card, code first, appearance on its own tab', async ({ page }) => {
  await fakeBackend(page, {});
  await openTab(page);
  const agentCard = page.getByTestId('ai-agent-card');
  await expect(agentCard).toBeVisible();
  await expect(agentCard.getByLabel('Agent:')).toBeVisible();
  await expect(agentCard.getByRole('checkbox')).toBeChecked();
  await expect(agentCard).toContainText('Answering website visitors');
  // Test widget sits above the agent card, outside it.
  const testButton = page.getByRole('button', { name: 'Test widget' });
  await expect(testButton).toBeVisible();
  expect(await agentCard.getByRole('button', { name: 'Test widget' }).count()).toBe(0);
  const [tb, ac] = await Promise.all([testButton.boundingBox(), agentCard.boundingBox()]);
  expect(tb!.y).toBeLessThan(ac!.y);
  // Code is the default tab and the snippet is short.
  const card = page.getByTestId('website-widget-card');
  await expect(card.getByRole('tab', { name: 'Code' })).toHaveAttribute('aria-selected', 'true');
  const code = card.locator('pre').filter({ hasText: 'data-app-id' });
  await expect(code).not.toContainText('Optional.');
  await expect(card.getByTestId('widget-attributes-reference')).not.toHaveAttribute('open', '');
  await expect(page.getByLabel('Popup title')).toHaveCount(0);
  await card.getByRole('tab', { name: 'Customize appearance' }).click();
  await expect(page.getByLabel('Popup title')).toBeVisible();
  await expect(card.getByTestId('appearance-agent-note')).toBeVisible();
  await expect(page.getByText('Conversations history')).toBeVisible();
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
