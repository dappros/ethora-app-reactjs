import { expect, Page, Route, test } from '@playwright/test';

// Sidebar section memory (utils/sectionMemory), against a faked API.
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

const MISSING_APP = 'e2eapp0000000000000000ff';

async function fakeBackend(page: Page) {
  const json = (route: Route, body: unknown, status = 200) =>
    route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
  await page.route('**/config.js', (route) =>
    route.fulfill({ contentType: 'application/javascript', body: 'window.__ETHORA_CONFIG__ = { VITE_AI_FEATURE_ENABLED: "true" };' }),
  );
  await page.route(
    (url) => /^\/v[12]\//.test(url.pathname),
    async (route) => {
      const { pathname } = new URL(route.request().url());
      if (pathname === '/v1/apps/get-config') return json(route, appConfig);
      if (pathname === '/v1/users/me') return json(route, me);
      if (pathname === '/v1/apps') return json(route, { apps: [baseApp], total: 1 });
      if (pathname === `/v1/apps/${APP_ID}`) return json(route, { result: { ...baseApp, onboardingGoal: 'website' } });
      if (pathname === `/v1/apps/${MISSING_APP}`) return json(route, { error: 'App not found' }, 404);
      if (pathname === '/v2/agents/ag-gone') return json(route, { error: 'Agent not found' }, 404);
      return json(route, { ok: true, items: [], total: 0 });
    },
  );
  await page.addInitScript(() => {
    localStorage.setItem('token-538', 'e2e-token');
    localStorage.setItem('refreshToken-538', 'e2e-refresh');
  });
}

// Seeds the remembered places for the signed-in user before the page loads.
async function remember(page: Page, memory: Record<string, string>) {
  await page.addInitScript(
    ([key, value]) => sessionStorage.setItem(key, value),
    [`sectionMemory-538:${USER_ID}`, JSON.stringify(memory)],
  );
}

test('Apps reopens the App and tab left for Agents; Apps again goes to the list', async ({ page }) => {
  await fakeBackend(page);
  await page.goto(`/app/admin/apps/${APP_ID}/settings?tab=Appearance`);
  await expect(page).toHaveURL(/tab=Appearance/);
  await page.getByRole('link', { name: 'Agents', exact: true }).first().click();
  await expect(page).toHaveURL(/\/app\/admin\/agents$/);
  await page.getByRole('link', { name: 'Apps', exact: true }).first().click();
  await expect(page).toHaveURL(new RegExp(`/app/admin/apps/${APP_ID}/settings\\?tab=Appearance$`));
  await page.getByRole('link', { name: 'Apps', exact: true }).first().click();
  await expect(page).toHaveURL(/\/app\/admin\/apps$/);
});

test('an agent that is gone sends the restore back to the Agents list, without an error', async ({ page }) => {
  await fakeBackend(page);
  await remember(page, { agents: '/app/admin/agents/ag-gone/settings?tab=Flows' });
  await page.goto(`/app/admin/apps/${APP_ID}`);
  await page.getByRole('link', { name: 'Agents', exact: true }).first().click();
  await expect(page).toHaveURL(/\/app\/admin\/agents$/);
  await expect(page.getByText(/Agent not found/)).toHaveCount(0);
});

test('an App that is gone sends the restore back to the Apps list, without an error page', async ({ page }) => {
  await fakeBackend(page);
  await remember(page, { apps: `/app/admin/apps/${MISSING_APP}/settings?tab=Chats` });
  await page.goto('/app/admin/agents');
  await page.getByRole('link', { name: 'Apps', exact: true }).first().click();
  await expect(page).toHaveURL(/\/app\/admin\/apps$/);
  await expect(page.getByText(/404|not found/i)).toHaveCount(0);
});

test('Test Chats is not reopened when it would switch the chat context: the App Home opens', async ({ page }) => {
  await fakeBackend(page);
  await remember(page, { apps: `/app/admin/apps/${APP_ID}/chats` });
  await page.goto('/app/admin/agents');
  await page.getByRole('link', { name: 'Apps', exact: true }).first().click();
  await expect(page).toHaveURL(new RegExp(`/app/admin/apps/${APP_ID}$`));
});
