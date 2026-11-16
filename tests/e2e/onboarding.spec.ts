import { expect, Page, Route, test } from '@playwright/test';

// Start screen and App Home (onboarding), against a faked API.
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

async function fakeBackend(page: Page, app: Record<string, unknown> = baseApp) {
  const puts: Array<Record<string, unknown>> = [];
  const json = (route: Route, body: unknown, status = 200) =>
    route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
  await page.route('**/config.js', (route) =>
    route.fulfill({ contentType: 'application/javascript', body: 'window.__ETHORA_CONFIG__ = { VITE_AI_FEATURE_ENABLED: "true" };' }),
  );
  await page.route(
    (url) => /^\/v[12]\//.test(url.pathname),
    async (route) => {
      const req = route.request();
      const { pathname } = new URL(req.url());
      if (pathname === '/v1/apps/get-config') return json(route, appConfig);
      if (pathname === '/v1/users/me') return json(route, me);
      if (pathname === '/v1/apps') return json(route, { apps: [app], total: 1 });
      if (pathname === `/v1/apps/${APP_ID}` && req.method() === 'PUT') {
        const body = req.postDataJSON() as Record<string, unknown>;
        puts.push(body);
        Object.assign(app, body);
        return json(route, { result: app });
      }
      if (pathname === `/v1/apps/${APP_ID}`) return json(route, { result: app });
      return json(route, { ok: true, items: [], total: 0 });
    },
  );
  await page.addInitScript(() => {
    localStorage.setItem('token-538', 'e2e-token');
    localStorage.setItem('refreshToken-538', 'e2e-refresh');
  });
  return { puts };
}

test('the start screen offers the four goals and the two quiet links', async ({ page }) => {
  await fakeBackend(page);
  await page.goto('/app/admin/start');
  for (const goal of ['website', 'sdk', 'messenger', 'selfHost']) {
    await expect(page.getByTestId(`onboarding-goal-${goal}`)).toBeVisible();
  }
  await expect(page.getByRole('link', { name: 'Connect the Ethora MCP server' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Just looking around' })).toBeVisible();
  await expect(page.getByTestId('onboarding-goal-website').getByRole('img')).toHaveAttribute('aria-label', /website/i);
});

test('an explicit intent skips the chooser; the name follows the website', async ({ page }) => {
  await fakeBackend(page);
  await page.goto('/app/admin/start?intent=widget');
  const website = page.getByTestId('onboarding-website');
  await expect(website).toBeVisible();
  await website.fill('yourbusiness.com');
  await expect(page.getByTestId('onboarding-name')).toHaveValue('Yourbusiness assistant');
  await expect(page.getByTestId('onboarding-create-assistant')).toBeEnabled();
});

test('the messenger goal needs the 18+ confirmation', async ({ page }) => {
  await fakeBackend(page);
  await page.goto('/app/admin/start?intent=messenger');
  await page.getByLabel('Messenger name').fill('Team Chat');
  const create = page.getByRole('button', { name: 'Create messenger' });
  await expect(create).toBeDisabled();
  await page.getByTestId('onboarding-adults-only').check();
  await expect(create).toBeEnabled();
});

test('an App without a goal asks what it is for, then shows that goal', async ({ page }) => {
  const { puts } = await fakeBackend(page, { ...baseApp });
  await page.goto(`/app/admin/apps/${APP_ID}`);
  await expect(page.getByTestId('app-home-choose')).toBeVisible();
  await page.getByTestId('app-home-choose').getByRole('button', { name: /Chat and calls in my app/ }).click();
  expect(puts).toEqual([{ onboardingGoal: 'sdk' }]);
  await expect(page.getByTestId('home-step-1')).toContainText('Keys and code');
  await expect(page.getByTestId('home-step-1')).toContainText(APP_ID);
});

test('App Home follows the server milestones', async ({ page }) => {
  await fakeBackend(page, {
    ...baseApp,
    onboardingGoal: 'website',
    aiBot: { ...baseApp.aiBot, siteUrlsV2: [{ url: 'https://example.com/' }] },
    milestones: {
      knowledge_added: { firstAt: '2026-11-16T10:00:00Z', lastAt: null, count: 1 },
      agent_tested: { firstAt: '2026-11-16T10:05:00Z', lastAt: null, count: 1 },
      widget_test_page: { firstAt: '2026-11-16T10:10:00Z', lastAt: null, count: 1, meta: { host: '127.0.0.1' } },
    },
  });
  await page.goto(`/app/admin/apps/${APP_ID}`);
  await expect(page.getByTestId('home-step-1')).toHaveAttribute('data-done', 'true');
  await expect(page.getByTestId('home-step-2')).toHaveAttribute('data-done', 'true');
  await expect(page.getByTestId('home-step-3')).toContainText('Seen on a test page (127.0.0.1)');
  await expect(page.getByTestId('home-step-4')).not.toHaveAttribute('data-done', 'true');
  await expect(page.getByTestId('app-status-pill')).toHaveText('On a test page');
  await expect(page.getByRole('navigation', { name: 'App sections' }).getByRole('link', { name: 'Test Chats' })).toBeVisible();
});

test('sign-up attribution keeps utm_source, utm_medium and utm_campaign', async ({ page }) => {
  await page.route('**/config.js', (route) =>
    route.fulfill({ contentType: 'application/javascript', body: 'window.__ETHORA_CONFIG__ = {};' }),
  );
  await page.route(
    (url) => /^\/v[12]\//.test(url.pathname),
    (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(new URL(route.request().url()).pathname === '/v1/apps/get-config' ? appConfig : {}) }),
  );
  await page.goto('/register?utm_source=newsletter&utm_medium=email&utm_campaign=nov&first_page=%2Fai-widget%2F');
  await expect.poll(() => page.evaluate(() => localStorage.getItem('urlParams'))).not.toBeNull();
  const params = JSON.parse((await page.evaluate(() => localStorage.getItem('urlParams'))) || '{}');
  expect(params).toMatchObject({ utm_source: 'newsletter', utm_medium: 'email', utm_campaign: 'nov', first_page: '/ai-widget/' });
});

test('an App made before goals existed is a website App when its assistant has website knowledge', async ({ page }) => {
  await fakeBackend(page, { ...baseApp, aiBot: { ...baseApp.aiBot, status: 'on', siteUrlsV2: [{ url: 'https://example.com/' }] } });
  await page.goto(`/app/admin/apps/${APP_ID}`);
  await expect(page.getByTestId('app-home')).toBeVisible();
  await expect(page.getByTestId('app-home-choose')).toHaveCount(0);
  await expect(page.getByTestId('home-step-1')).toContainText('Website added');
});
