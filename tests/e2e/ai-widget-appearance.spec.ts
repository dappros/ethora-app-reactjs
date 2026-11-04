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
  stats: { totalRegistered: 0, recentlyRegistered: 0, totalSessions: 0, recentlySessions: 0, totalChats: 0, recentlyChats: 0, totalApiCalls: 0, recentlyApiCalls: 0, totalFiles: 0, recentlyFiles: 0, totalAiTokens: 0, recentlyAiTokens: 0, totalTransactions: 0, recentlyTransactions: 0 },
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

const openTab = (page: Page) => page.goto(`/app/admin/widgets/${APP_ID}?tab=install`);
const openAppearance = (page: Page) => page.getByRole('tab', { name: /Customize appearance/ }).click();

test('project intent is selected before any app is created', async ({ page }) => {
  await fakeBackend(page, {});
  let creates = 0;
  await page.route('**/v1/apps', async (route) => {
    if (route.request().method() !== 'POST') return route.fulfill({ json: { apps: [app], total: 1 } });
    creates++;
    return route.fulfill({ json: { app: { ...app, displayName: 'My new app' } } });
  });
  await page.goto('/app/admin/apps');
  await page.getByRole('button', { name: 'New project', exact: true }).first().click();
  await expect(page.getByRole('heading', { name: 'What would you like to build?' })).toBeVisible();
  expect(creates).toBe(0);
  await page.getByRole('button', { name: /An assistant for my website/ }).click();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Create your website assistant' })).toBeVisible();
  expect(creates).toBe(0);
});

test('project usage stats stay visible without expanding a control', async ({ page }) => {
  await fakeBackend(page, {});
  await page.goto('/app/admin/apps');
  await expect(page.getByText('Sessions', { exact: true })).toBeVisible();
  await expect(page.getByText('Usage and activity', { exact: true })).toHaveCount(0);
});

test('chat intent creates an app and opens chat appearance', async ({ page }) => {
  await fakeBackend(page, {});
  await page.route('**/v1/apps', async (route) => route.request().method() === 'POST'
    ? route.fulfill({ json: { app } }) : route.fulfill({ json: { apps: [app], total: 1 } }));
  await page.goto('/app/admin/apps');
  await page.getByRole('button', { name: 'New project', exact: true }).first().click();
  await page.getByRole('button', { name: /Chat in my app/ }).click();
  await page.getByPlaceholder('My app').fill('My chat app');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`/apps/${APP_ID}/settings\\?tab=Appearance&section=chat`));
});

test('calls intent still opens calling settings', async ({ page }) => {
  await fakeBackend(page, {});
  await page.route('**/v1/apps', (route) => route.request().method() === 'POST'
    ? route.fulfill({ json: { app } }) : route.fulfill({ json: { apps: [app], total: 1 } }));
  await page.goto('/app/admin/start');
  await page.getByRole('button', { name: /Voice or video calls/ }).click();
  await page.getByPlaceholder('My app').fill('My calls app');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`/apps/${APP_ID}/settings\\?tab=Chats`));
});

test('self-hosted setup does not create a cloud app', async ({ page }) => {
  await fakeBackend(page, {});
  let creates = 0;
  await page.route('**/v1/apps', (route) => {
    if (route.request().method() === 'POST') creates++;
    return route.fulfill({ json: { apps: [app], total: 1 } });
  });
  await page.goto('/app/admin/start');
  await page.getByRole('button', { name: /Run Ethora on my server/ }).click();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page).toHaveURL(/\/app\/admin\/self-hosted$/);
  await expect(page.getByRole('heading', { name: 'Set up Ethora on your server' })).toBeVisible();
  expect(creates).toBe(0);
});

test('project opens on a short overview with focused navigation', async ({ page }) => {
  await fakeBackend(page, {});
  await page.goto(`/app/admin/apps/${APP_ID}`);
  await expect(page.getByRole('heading', { name: 'Project overview' })).toBeVisible();
  const projectHeader = page.locator('header');
  const titleBounds = await projectHeader.getByRole('heading', { name: app.displayName }).boundingBox();
  const projectsBounds = await projectHeader.getByRole('link', { name: 'Projects' }).boundingBox();
  expect(titleBounds && projectsBounds && projectsBounds.x > titleBounds.x + titleBounds.width).toBeTruthy();
  await page.evaluate(() => localStorage.setItem('uiTheme-538', 'dark'));
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Project overview' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Assistant', exact: true })).toHaveCSS('color', 'rgb(226, 229, 233)');
  await expect(page.getByRole('link', { name: 'Overview', exact: true })).toHaveAttribute('aria-current', 'page');
  await page.getByRole('link', { name: 'Settings', exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`/apps/${APP_ID}/settings$`));
});

test('loads the saved appearance from the App and saves changes back to it', async ({ page }) => {
  const { puts } = await fakeBackend(page, { 'data-title': 'Help desk' });
  await openTab(page);
  await openAppearance(page);
  const title = page.getByLabel('Popup title');
  await expect(title).toHaveValue('Help desk');

  await title.fill('Ask us');
  await page.getByRole('button', { name: 'Save widget appearance' }).click();
  await expect(page.getByText(/Widget appearance saved/)).toBeVisible();
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
  await expect(card.getByRole('tab', { name: 'Install' })).toHaveAttribute('aria-selected', 'true');
  const code = card.locator('pre').filter({ hasText: 'data-app-id' });
  await expect(code).not.toContainText('Optional.');
  await expect(card.getByTestId('widget-attributes-reference')).not.toHaveAttribute('open', '');
  await expect(page.getByLabel('Popup title')).toHaveCount(0);
  await card.getByRole('tab', { name: 'Customize appearance' }).click();
  await expect(page.getByLabel('Popup title')).toBeVisible();
  await expect(card.getByTestId('appearance-agent-note')).toBeVisible();
  await page.getByRole('tab', { name: 'Conversations', exact: true }).click();
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

test('warns before leaving with unsaved widget appearance', async ({ page }) => {
  await fakeBackend(page, { 'data-title': 'Help desk' });
  await openTab(page);
  await openAppearance(page);
  await page.getByLabel('Popup title').fill('Unsaved title');
  page.once('dialog', (dialog) => dialog.dismiss());
  await page.getByRole('link', { name: /Overview/ }).click();
  await expect(page.getByLabel('Popup title')).toHaveValue('Unsaved title');
});

test('conversation list offers a simple view and the original bulk table', async ({ page }) => {
  await fakeBackend(page, {});
  const row = { _id: 'chat1', name: 'room1', title: '', type: 'group', createdAt: '2026-10-30T10:00:00Z', updatedAt: '2026-10-30T11:00:00Z', visitor: { _id: 'visitor1', uuid: 'abcdefgh1234', xmppUsername: 'visitor', firstSeenAt: '', metadata: { pageUrl: 'https://example.com/product' } } };
  await page.route(`**/v2/apps/${APP_ID}/widget/conversations*`, (route) => route.fulfill({ json: { results: [row], pagination: { total: 1, limit: 20, offset: 0 } } }));
  await openTab(page);
  await page.getByRole('tab', { name: 'Conversations', exact: true }).click();
  await expect(page.getByText('https://example.com/product')).toBeVisible();
  await page.getByRole('button', { name: 'Table and bulk actions' }).click();
  await expect(page.getByRole('checkbox', { name: 'Select all on this page' })).toBeVisible();
  await page.getByRole('button', { name: 'Simple list' }).click();
  await expect(page.getByText('https://example.com/product')).toBeVisible();
});

test('website assistant creates an app with the same name and makes its agent active', async ({ page }) => {
  await fakeBackend(page, {});
  const calls: Array<{ path: string; body: any }> = [];
  const newAppId = 'aaaaaaaaaaaaaaaaaaaaaaaa';
  const agentId = 'bbbbbbbbbbbbbbbbbbbbbbbb';
  const instanceId = 'cccccccccccccccccccccccc';
  const oldInstance = 'dddddddddddddddddddddddd';
  const createdAgent = { id: agentId, ownerId: USER_ID, displayName: 'Store helper', ownerAppId: newAppId, visibility: 'private', bio: '', avatarUrl: '', responseMode: 'always', cooldownSec: 0, categories: [] };
  await page.route('**/v2/agents?*', (route) => route.fulfill({ json: { items: [createdAgent], total: 1 } }));
  await page.route(`**/v2/agents/${agentId}`, (route) => route.fulfill({ json: { agent: createdAgent } }));
  await page.route('**/v2/bot-instances?*', (route) => route.fulfill({ json: { items: [{ id: instanceId, appId: newAppId, agentId, status: 'on', joinedRooms: [] }] } }));
  await page.route('**/v1/apps', async (route) => {
    if (route.request().method() !== 'POST') return route.fallback();
    calls.push({ path: '/v1/apps', body: route.request().postDataJSON() });
    return route.fulfill({ json: { app: { ...app, _id: newAppId, displayName: 'Store helper', aiBot: { status: 'on', chatId: 'chat1' }, defaultBotInstanceId: oldInstance } } });
  });
  await page.route('**/v2/agents', async (route) => {
    if (route.request().method() !== 'POST') return route.fulfill({ json: { items: [createdAgent], total: 1 } });
    calls.push({ path: '/v2/agents', body: route.request().postDataJSON() });
    return route.fulfill({ json: { agent: createdAgent } });
  });
  await page.route(`**/v2/agents/${agentId}/invite-to-chat`, async (route) => {
    calls.push({ path: 'invite', body: route.request().postDataJSON() });
    return route.fulfill({ json: { botInstance: { id: instanceId } } });
  });
  await page.route(`**/v1/apps/${newAppId}`, async (route) => {
    if (route.request().method() === 'PUT') calls.push({ path: 'update', body: route.request().postDataJSON() });
    return route.fulfill({ json: { result: { ...app, _id: newAppId, displayName: 'Store helper', defaultBotInstanceId: instanceId, aiBot: { status: 'on' } } } });
  });
  await page.route(`**/v2/bot-instances/${oldInstance}/status`, async (route) => {
    calls.push({ path: 'old-status', body: route.request().postDataJSON() });
    return route.fulfill({ json: { botInstance: { id: oldInstance, status: 'off' } } });
  });
  await page.route(`**/v2/apps/${newAppId}/sources/site-crawl`, async (route) => {
    if (route.request().method() !== 'POST') return route.fallback();
    calls.push({ path: 'crawl', body: route.request().postDataJSON() });
    return route.fulfill({ json: { status: 'queued', jobId: 'test-job' } });
  });
  await page.route(`**/v2/apps/${newAppId}/sources/site-crawl-jobs/test-job`, (route) => route.fulfill({ json: { result: { status: 'completed', savedPages: 2 } } }));
  await page.route(`**/v2/agents/${agentId}/knowledge`, (route) => route.fulfill({ json: { ok: true, pages: 2, docs: 0, chunks: 2, indexAvailable: true, missing: { pages: 0, docs: 0, examples: [] }, lastIndexedAt: null } }));
  await page.goto('/app/admin/widgets');
  await page.getByRole('button', { name: 'New assistant', exact: true }).click();
  await page.getByLabel('Assistant name').fill('Store helper');
  await page.getByLabel('Website address (optional)').fill('https://example.com');
  await page.getByRole('button', { name: 'Create assistant' }).click();
  await expect(page).toHaveURL(new RegExp(`/apps/${newAppId}/assistant$`));
  await expect(page.getByTestId('widget-config-ai').getByLabel('Display name')).toHaveValue('Store helper');
  await expect(page.getByText('Website processing finished: 2 pages saved.')).toBeVisible();
  await page.getByRole('button', { name: 'Test assistant' }).click();
  await expect(page.getByTestId('try-transcript')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Install on your site' })).toHaveCount(0);
  expect(calls.find((c) => c.path === '/v1/apps')?.body.displayName).toBe('Store helper');
  expect(calls.find((c) => c.path === '/v2/agents')?.body).toMatchObject({ displayName: 'Store helper', ownerAppId: newAppId });
  expect(calls.find((c) => c.path === 'update')?.body).toMatchObject({ defaultBotInstanceId: instanceId, botStatus: 'on' });
  expect(calls.find((c) => c.path === 'old-status')?.body).toEqual({ status: 'off' });
  expect(calls.find((c) => c.path === 'crawl')?.body).toMatchObject({ agentId, url: 'https://example.com', followLink: true });
});

async function configAgentBackend(page: Page, ownerId = USER_ID) {
  await fakeBackend(page, {});
  const agentId = 'agent-test-id';
  const instanceId = 'bot-instance-test';
  const current = { id: agentId, ownerId, ownerAppId: APP_ID, originAppId: APP_ID, displayName: 'Test assistant', bio: 'Friendly assistant', avatarUrl: '', prompt: 'Answer carefully', soulMd: 'Remember the user', visibility: ownerId === USER_ID ? 'private' : 'public', responseMode: 'always', responseProbability: 1, cooldownSec: 0, llmModel: '', categories: [], heartbeat: { enabled: false, schedule: '', prompt: '' }, flowsYaml: '', totalSiteSourceSize: 0 };
  const writes: unknown[] = [];
  await page.route(`**/v1/apps/${APP_ID}`, (route) => route.fulfill({ json: { result: { ...app, defaultBotInstanceId: instanceId, aiBot: { ...app.aiBot, chatId: 'chat-id' } } } }));
  await page.route('**/v2/agents?*', (route) => route.fulfill({ json: { items: [current], total: 1 } }));
  await page.route('**/v2/agents', (route) => route.fulfill({ json: { items: [current], total: 1 } }));
  await page.route('**/v2/bot-instances?*', (route) => route.fulfill({ json: { items: [{ id: instanceId, appId: APP_ID, agentId, status: 'on', joinedRooms: [] }] } }));
  await page.route(`**/v2/agents/${agentId}/bot-instances`, (route) => route.fulfill({ json: { items: [{ id: instanceId, appId: APP_ID, appName: 'E2E Widget App', agentId, status: 'on', isAppWidgetBot: true, joinedRooms: [] }] } }));
  await page.route(`**/v2/agents/${agentId}`, (route) => {
    if (route.request().method() === 'PUT') { const body = route.request().postDataJSON(); writes.push(body); Object.assign(current, body); }
    return route.fulfill({ json: { agent: current } });
  });
  await page.route(`**/v2/agents/${agentId}/soul`, (route) => {
    const body = route.request().postDataJSON(); writes.push(body); Object.assign(current, body);
    return route.fulfill({ json: { agent: current } });
  });
  return { writes };
}

test('setup explains a failed crawl and guides an owner without knowledge', async ({ page }) => {
  await configAgentBackend(page);
  await page.addInitScript(({ appId }) => sessionStorage.setItem(`widget-setup:${appId}`, JSON.stringify({ agentId: 'agent-test-id', jobId: 'failed-job' })), { appId: APP_ID });
  await page.route(`**/v2/apps/${APP_ID}/sources/site-crawl-jobs/failed-job`, (route) => route.fulfill({ json: { result: { status: 'failed', savedPages: 0 } } }));
  await page.route('**/v2/agents/agent-test-id/knowledge', (route) => route.fulfill({ json: { ok: true, pages: 0, docs: 0, chunks: 0, indexAvailable: true, missing: { pages: 0, docs: 0, examples: [] }, lastIndexedAt: null } }));
  await page.goto(`/app/admin/widgets/${APP_ID}/ai`);
  await expect(page.getByText('The website could not be fully added. Open Website knowledge to try again.')).toBeVisible();
  await expect(page.getByText('No website pages or documents have been added yet.', { exact: false })).toBeVisible();
  await page.getByRole('button', { name: 'Add document' }).click();
  await expect(page.getByRole('tab', { name: 'Docs Index' })).toHaveAttribute('aria-selected', 'true');
});

test('Config AI edits the active agent and retains its saved values when switching panels', async ({ page }) => {
  const { writes } = await configAgentBackend(page);
  await openTab(page);
  await page.goto(`/app/admin/widgets/${APP_ID}/ai`);
  const panel = page.getByTestId('widget-config-ai');
  await expect(panel.getByLabel('Display name')).toHaveValue('Test assistant');
  await panel.getByLabel('Display name').fill('Updated assistant');
  await panel.getByRole('button', { name: 'Save persona' }).click();
  await expect.poll(() => writes.some((value) => (value as { displayName?: string }).displayName === 'Updated assistant')).toBeTruthy();
  await panel.getByRole('tab', { name: 'Memory' }).click();
  await expect(panel.locator('textarea')).toHaveValue('Remember the user');
  await panel.locator('textarea').fill('Remember preferences');
  await panel.getByRole('button', { name: /Save memory/i }).click();
  await expect.poll(() => writes.some((value) => (value as { soulMd?: string }).soulMd === 'Remember preferences')).toBeTruthy();
  await panel.getByRole('tab', { name: 'Persona' }).click();
  await expect(panel.getByLabel('Display name')).toHaveValue('Updated assistant');
  for (const label of ['Instructions', 'Web Index', 'Docs Index', 'Memory', 'Heartbeat', 'Flows']) {
    await expect(panel.getByRole('tab', { name: label, exact: true })).toBeVisible();
  }
  for (const label of ['Try it', 'Website widget', 'Chats Index', 'Visibility']) {
    await panel.getByRole('tab', { name: label, exact: true }).click();
    await expect(panel.getByRole('tab', { name: label, exact: true })).toHaveAttribute('aria-selected', 'true');
  }
  await expect(panel.getByText('Private', { exact: true })).toBeVisible();
  await panel.getByRole('tab', { name: 'Website widget', exact: true }).click();
  await expect(panel.getByText('Current app', { exact: true })).toBeVisible();
  await expect(panel.getByRole('link', { name: 'Open AI Widget settings' })).toHaveCount(0);
});

test('Config AI preserves read-only access for another owner’s public agent', async ({ page }) => {
  const { writes } = await configAgentBackend(page, 'another-owner');
  await openTab(page);
  await page.goto(`/app/admin/widgets/${APP_ID}/ai`);
  const panel = page.getByTestId('widget-config-ai');
  await expect(panel.getByText(/Read.only/).first()).toBeVisible();
  await expect(panel.getByLabel('Display name')).toBeDisabled();
  await panel.getByRole('tab', { name: 'Memory' }).click();
  await expect(panel.locator('textarea')).toBeDisabled();
  expect(writes).toHaveLength(0);
});

test('Manage agents opens the original agent list without widget breadcrumbs', async ({ page }) => {
  await configAgentBackend(page);
  await openTab(page);
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('link', { name: 'Manage agents', exact: true }).first().click();
  await expect(page).toHaveURL(/\/app\/admin\/agents$/);
  await expect(page.getByRole('navigation', { name: 'Breadcrumb' })).toHaveCount(0);
});

test('View agent opens the original agent settings without widget breadcrumbs', async ({ page }) => {
  await configAgentBackend(page, 'another-owner');
  await openTab(page);
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('link', { name: 'View agent', exact: true }).click();
  await expect(page).toHaveURL(/\/app\/admin\/agents\/agent-test-id\/settings/);
  await expect(page.getByRole('navigation', { name: 'Breadcrumb' })).toHaveCount(0);
});

test('an agent can be selected for a widget without an existing chat', async ({ page }) => {
  await fakeBackend(page, {});
  const agent = { id: 'agent-no-chat', ownerId: USER_ID, displayName: 'Website assistant', visibility: 'private', bio: '', categories: [] };
  let prepared = false;
  let saved = false;
  await page.route('**/v2/agents?*', (route) => route.fulfill({ json: { items: [agent], total: 1 } }));
  await page.route('**/v2/agents', (route) => route.fulfill({ json: { items: [agent], total: 1 } }));
  await page.route(`**/v2/apps/${APP_ID}/agents/${agent.id}/widget-instance`, (route) => {
    prepared = true;
    return route.fulfill({ json: { botInstance: { id: 'new-widget-bot', appId: APP_ID, agentId: agent.id, status: 'on', joinedRooms: [] } } });
  });
  await page.route(`**/v1/apps/${APP_ID}`, (route) => {
    if (route.request().method() === 'PUT') {
      saved = route.request().postDataJSON().defaultBotInstanceId === 'new-widget-bot';
      return route.fulfill({ json: { result: { ...app, defaultBotInstanceId: 'new-widget-bot' } } });
    }
    return route.fulfill({ json: { result: app } });
  });
  await openTab(page);
  await page.getByLabel('Agent:').selectOption(agent.id);
  await expect.poll(() => prepared && saved).toBe(true);
  await expect(page.getByText(/Bind a chat to AI Widget first/)).toHaveCount(0);
});

test('newly opened app settings are clean and real edits are marked', async ({ page }) => {
  await fakeBackend(page, {});
  await page.goto(`/app/admin/apps/${APP_ID}/settings?tab=Appearance`);
  await expect(page.getByText('Unsaved app settings')).toHaveCount(0);
  await page.getByRole('tab', { name: 'Appearance', exact: true }).first().click();
  const name = page.getByPlaceholder("Enter App's Name");
  await name.fill('Changed app');
  await expect(page.getByText('Unsaved app settings')).toBeVisible();
});

test('Config AI uses the selected agent when the current app lacks the bot pointer', async ({ page }) => {
  await configAgentBackend(page);
  await page.route('**/v1/apps/get-config?*', (route) => route.fulfill({ json: { result: { ...appConfig.result, _id: APP_ID } } }));
  await openTab(page);
  await page.goto(`/app/admin/widgets/${APP_ID}/ai`);
  await expect(page.getByTestId('widget-config-ai').getByLabel('Display name')).toHaveValue('Test assistant');
});

test('Config AI offers grouped, usable section navigation on a narrow screen', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await configAgentBackend(page);
  await openTab(page);
  await page.goto(`/app/admin/widgets/${APP_ID}/ai`);
  const panel = page.getByTestId('widget-config-ai');
  const sections = panel.getByRole('combobox', { name: /Settings section/ });
  await expect(sections).toBeVisible();
  await sections.selectOption({ label: 'Memory' });
  await expect(panel.getByRole('heading', { name: 'Memory' })).toBeVisible();
  await expect(panel.locator('textarea')).toHaveValue('Remember the user');
  await sections.selectOption({ label: 'Instructions' });
  await expect(panel.getByRole('heading', { name: 'Instructions' })).toBeVisible();
});

test('project assistant sections can scroll without clipping the project tabs', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 600 });
  await configAgentBackend(page);
  await page.goto(`/app/admin/apps/${APP_ID}/assistant`);
  await expect(page.getByTestId('widget-config-ai')).toBeVisible();
  await page.evaluate(() => localStorage.setItem('uiTheme-538', 'dark'));
  await page.reload();
  await expect(page.getByTestId('widget-config-ai')).toBeVisible();
  const content = page.getByTestId('project-content-scroll');
  await expect.poll(() => content.evaluate((element) => element.scrollHeight > element.clientHeight)).toBe(true);
  await content.evaluate((element) => { element.scrollTop = element.scrollHeight; });
  await expect.poll(() => content.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
  await expect(page.getByRole('link', { name: 'Assistant', exact: true })).toBeVisible();
  const nav = await page.getByRole('navigation', { name: 'Project navigation' }).boundingBox();
  const selected = await page.getByRole('link', { name: 'Assistant', exact: true }).boundingBox();
  expect(nav && selected && selected.y >= nav.y && selected.y + selected.height <= nav.y + nav.height).toBeTruthy();
});

test('project menu keeps assistant and widget in the same project', async ({ page }) => {
  await configAgentBackend(page);
  await page.goto('/app/admin/widgets');
  await page.getByRole('link', { name: 'Edit widget', exact: true }).first().click();
  await expect(page).toHaveURL(new RegExp(`/apps/${APP_ID}/widget$`));
  await expect(page.getByRole('navigation', { name: 'Project navigation' })).toBeVisible();
  const tabs = page.getByTestId('website-widget-card').getByRole('tab');
  await expect(tabs).toHaveText(['Install', 'Customize appearance', 'Conversations']);
  await page.getByRole('link', { name: 'Assistant', exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`/apps/${APP_ID}/assistant$`));
  await expect(page.getByTestId('widget-config-ai').getByLabel('Display name')).toHaveValue('Test assistant');
  await page.getByRole('link', { name: 'Overview', exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`/apps/${APP_ID}$`));
});

test('overview opens widget and offers to continue there next time', async ({ page }) => {
  await configAgentBackend(page);
  await page.goto(`/app/admin/apps/${APP_ID}`);
  const widget = page.getByRole('region', { name: 'Website widget' });
  await widget.getByRole('link', { name: 'Open widget' }).click();
  await expect(page).toHaveURL(new RegExp(`/apps/${APP_ID}/widget$`));
  await expect.poll(() => page.evaluate((appId) => localStorage.getItem(`ethora:project-recent:${appId}`), APP_ID)).toContain('widget');
  await page.getByRole('link', { name: 'Overview', exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`/apps/${APP_ID}$`));
  await expect(page.getByRole('region', { name: 'Continue' })).toContainText('Website widget');
  await page.reload();
  await page.getByRole('region', { name: 'Continue' }).getByRole('link', { name: 'Continue' }).click();
  await expect(page).toHaveURL(new RegExp(`/apps/${APP_ID}/widget$`));
});

test('overview opens mobile settings and remembers the selected tab', async ({ page }) => {
  await fakeBackend(page, {});
  await page.goto(`/app/admin/apps/${APP_ID}`);
  await expect(page.getByRole('region', { name: 'Website widget' })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Chat' })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Mobile App' })).toBeVisible();
  await page.getByRole('region', { name: 'Mobile App' }).getByRole('link', { name: 'Mobile app settings' }).click();
  await expect(page).toHaveURL(new RegExp(`/apps/${APP_ID}/settings\\?tab=Mobile\\+App$`));
  await expect.poll(() => page.evaluate((appId) => localStorage.getItem(`ethora:project-recent:${appId}`), APP_ID)).toContain('settings');
  await page.getByRole('link', { name: 'Overview', exact: true }).click();
  await expect(page.getByRole('region', { name: 'Continue' })).toContainText('Mobile App');
  await page.getByRole('region', { name: 'Continue' }).getByRole('link', { name: 'Continue' }).click();
  await expect(page).toHaveURL(new RegExp(`/apps/${APP_ID}/settings\\?tab=Mobile\\+App$`));
});

test('overview opens this project chat', async ({ page }) => {
  await fakeBackend(page, {});
  await page.route(`**/v2/apps/${APP_ID}/owner-session`, (route) => route.fulfill({ json: {
    appId: APP_ID,
    appToken: 'e2e-app-token',
    chatTokens: { accessToken: 'e2e-chat-token', refreshToken: 'e2e-chat-refresh' },
    owner: { _id: USER_ID, appId: APP_ID, xmppUsername: `${APP_ID}_${USER_ID}` },
  } }));
  await page.goto(`/app/admin/apps/${APP_ID}`);
  await page.getByRole('region', { name: 'Chat' }).getByRole('button', { name: 'Open project chat' }).click();
  await expect(page).toHaveURL(/\/app\/chat\??$/);
  await expect.poll(() => page.evaluate((appId) => localStorage.getItem(`ethora:project-recent:${appId}`), APP_ID)).toContain('chat');
});

test('long app settings remain scrollable inside the project', async ({ page }) => {
  await fakeBackend(page, {});
  await page.goto(`/app/admin/apps/${APP_ID}/settings?tab=Visibility+%26+Privacy`);
  const panels = page.getByTestId('settings-panels-scroll');
  await expect(page.getByRole('tab', { name: 'Visibility & Privacy' })).toHaveAttribute('aria-selected', 'true');
  await expect.poll(() => panels.evaluate((element) => element.scrollHeight > element.clientHeight)).toBe(true);
  await panels.hover();
  await page.mouse.wheel(0, 600);
  await expect.poll(() => panels.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
  await expect(page.getByText('All User accounts are tied to your App')).toBeVisible();
});

test('legacy settings AI link opens the dedicated assistant page', async ({ page }) => {
  await configAgentBackend(page);
  await page.goto(`/app/admin/apps/${APP_ID}/settings?tab=AI`);
  await expect(page).toHaveURL(new RegExp(`/apps/${APP_ID}/assistant$`));
  await expect(page.getByTestId('widget-config-ai')).toBeVisible();
  await page.getByRole('link', { name: 'Settings', exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`/apps/${APP_ID}/settings$`));
  await expect(page.getByRole('tab', { name: 'Website assistants', exact: true })).toHaveCount(0);
});

test('widget draft survives reload and project navigation', async ({ page }) => {
  await configAgentBackend(page);
  await page.goto(`/app/admin/apps/${APP_ID}/widget?tab=appearance`);
  await page.getByLabel('Popup title').fill('Unsaved title');
  await page.reload();
  await expect(page.getByLabel('Popup title')).toHaveValue('Unsaved title');
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('link', { name: 'Settings', exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`/apps/${APP_ID}/settings$`));
  await page.getByRole('link', { name: 'Widget', exact: true }).click();
  await page.getByRole('tab', { name: /Customize appearance/ }).click();
  await expect(page.getByLabel('Popup title')).toHaveValue('Unsaved title');
  await page.getByRole('button', { name: 'Save widget appearance' }).click();
  await expect.poll(() => page.evaluate((appId) => sessionStorage.getItem(`widget-appearance-draft:${appId}`), APP_ID)).toBeNull();
});

test('widget appearance uses a local skeleton while loading', async ({ page }) => {
  await configAgentBackend(page);
  await page.route(`**/v2/apps/${APP_ID}/widget/appearance`, async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    await route.fulfill({ json: { ok: true, appearance: {} } });
  });
  await page.goto(`/app/admin/apps/${APP_ID}/widget?tab=appearance`);
  await expect(page.getByRole('status', { name: 'Loading project…' })).toBeVisible();
  await expect(page.getByLabel('Popup title')).toBeVisible();
});

test('old widget AI tab link redirects to project assistant', async ({ page }) => {
  await configAgentBackend(page);
  await page.goto(`/app/admin/widgets/${APP_ID}?tab=ai`);
  await expect(page).toHaveURL(new RegExp(`/apps/${APP_ID}/assistant$`));
  await expect(page.getByTestId('widget-config-ai').getByLabel('Display name')).toHaveValue('Test assistant');
});

test('Widgets are under AI rather than a separate main menu item', async ({ page }) => {
  await configAgentBackend(page);
  await page.goto('/app/admin/widgets');
  await expect(page.getByRole('link', { name: 'Widget', exact: true })).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Assistants', exact: true })).toHaveAttribute('aria-current', 'page');
  const sections = page.getByRole('navigation', { name: 'AI sections' });
  await expect(sections.getByRole('link', { name: 'Website assistants', exact: true })).toHaveAttribute('aria-current', 'page');
  await sections.getByRole('link', { name: 'Agents', exact: true }).click();
  await expect(page).toHaveURL(/\/app\/admin\/agents$/);
  await sections.getByRole('link', { name: 'Website assistants', exact: true }).click();
  await expect(page).toHaveURL(/\/app\/admin\/widgets$/);
});

test('mobile main menu also groups Widgets under AI', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await configAgentBackend(page);
  await page.goto('/app/admin/widgets');
  await page.getByRole('button', { name: 'Open menu' }).click();
  const menu = page.getByRole('dialog');
  await expect(menu.getByRole('link', { name: 'Widget', exact: true })).toHaveCount(0);
  await expect(menu.getByRole('link', { name: 'Assistants', exact: true })).toHaveAttribute('aria-current', 'page');
  await menu.getByRole('link', { name: 'Assistants', exact: true }).click();
  await page.getByRole('navigation', { name: 'AI sections' }).getByRole('link', { name: 'Website assistants', exact: true }).click();
  await expect(page).toHaveURL(/\/app\/admin\/widgets$/);
});


for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
  test(`Agents and Widgets share a stable page layout at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await configAgentBackend(page);
    const measure = async (section: string) => {
      await expect(page.getByRole('heading', { name: section, exact: true })).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      const mainTitle = page.getByRole('heading', { name: 'Assistants', exact: true });
      await expect(mainTitle).toBeVisible();
      await expect(page.getByRole('searchbox')).toBeVisible();
      const content = await page.getByTestId('ai-workspace-content').boundingBox();
      const footer = await page.getByRole('link', { name: 'Help & Support', exact: true }).boundingBox();
      expect(footer!.y).toBeGreaterThanOrEqual(content!.y + content!.height);
      return Promise.all([
        mainTitle.boundingBox(),
        page.getByRole('navigation', { name: 'AI sections' }).boundingBox(),
        page.getByTestId('ai-workspace-content').boundingBox(),
        page.getByRole('searchbox').boundingBox(),
      ]);
    };
    await page.goto('/app/admin/agents');
    const agents = await measure('Agents');
    await page.getByRole('navigation', { name: 'AI sections' }).getByRole('link', { name: 'Website assistants', exact: true }).click();
    const widgets = await measure('Website assistants');
    await page.getByRole('navigation', { name: 'AI sections' }).getByRole('link', { name: 'Agents', exact: true }).click();
    const returned = await measure('Agents');
    // Content length may differ; the page chrome must not jump or resize.
    for (let i = 0; i < agents.length; i++) {
      for (const property of ['x', 'y', 'width'] as const) {
        expect(Math.abs(agents[i]![property] - widgets[i]![property])).toBeLessThanOrEqual(1);
        expect(Math.abs(agents[i]![property] - returned[i]![property])).toBeLessThanOrEqual(1);
      }
    }
  });
}
