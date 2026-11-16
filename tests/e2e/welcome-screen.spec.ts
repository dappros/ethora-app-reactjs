import { expect, Page, Route, test } from '@playwright/test';

// Welcome screen (Settings > Appearance): the editor, and the login and
// register pages that read it from the public app config. Faked API.
const USER_ID = 'e2e-user';
const APP_ID = 'e2eapp000000000000000003';
const UPLOADED_IMAGE = 'http://files.welcome.test/welcome.png';

// 1x1 PNG, served for the uploaded image so the artwork renders.
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64',
);

const baseConfig = {
  _id: 'e2e-app',
  displayName: 'Ethora Test App',
  appTagline: 'Chat with your team',
  afterLoginPage: '/app/admin/apps',
  primaryColor: '#0052CD',
  logoImage: '',
  signonOptions: ['email'],
  availableMenuItems: { chats: true, profile: true, settings: true },
  defaultRooms: [],
  isBaseApp: false,
  isAllowedNewAppCreate: true,
  usersCanFree: true,
  stats: {},
};

const editedApp = {
  _id: APP_ID,
  displayName: 'Acme Community',
  appTagline: 'Chat with your team',
  creatorId: USER_ID,
  primaryColor: '#0052CD',
  logoImage: '',
  signonOptions: ['email'],
  availableMenuItems: { chats: true, profile: true, settings: true },
  aiBot: { status: 'on', userId: 'e2e-bot', user: { firstName: 'Bot', lastName: 'Helper' } },
  defaultRooms: [],
  stats: {},
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

async function fakeBackend(
  page: Page,
  { config = baseConfig, app = editedApp, signedIn = false }: { config?: Record<string, unknown>; app?: Record<string, unknown>; signedIn?: boolean } = {},
) {
  const puts: Array<Record<string, unknown>> = [];
  const json = (route: Route, body: unknown, status = 200) =>
    route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
  await page.route('**/config.js', (route) =>
    route.fulfill({ contentType: 'application/javascript', body: 'window.__ETHORA_CONFIG__ = {};' }),
  );
  await page.route('http://files.welcome.test/**', (route) =>
    route.fulfill({ contentType: 'image/png', body: PNG }),
  );
  await page.route(
    (url) => /^\/v[12]\//.test(url.pathname),
    async (route) => {
      const req = route.request();
      const { pathname } = new URL(req.url());
      if (pathname === '/v1/apps/get-config') return json(route, { result: config });
      if (pathname === '/v1/users/me') return json(route, me);
      if (pathname === '/v1/files' && req.method() === 'POST') {
        return json(route, { results: [{ location: UPLOADED_IMAGE }] });
      }
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
  if (signedIn) {
    await page.addInitScript(() => {
      localStorage.setItem('token-538', 'e2e-token');
      localStorage.setItem('refreshToken-538', 'e2e-refresh');
    });
  }
  return { puts };
}

test('the welcome screen editor previews and saves the welcome fields', async ({ page }) => {
  const { puts } = await fakeBackend(page, { app: { ...editedApp }, signedIn: true });
  await page.goto(`/app/admin/apps/${APP_ID}/settings?tab=Appearance`);

  await expect(page.getByLabel('Welcome heading')).toBeVisible();
  await expect(page.getByTestId('settings-unsaved')).toHaveCount(0);
  await page.getByLabel('Welcome heading').fill('Welcome to Acme');
  await page.getByLabel('Welcome message').fill('Meet the community');
  await page.getByText('Centered', { exact: true }).click();
  // The upload answers with a plain http URL, as a self-hosted install does.
  await page.getByLabel('Welcome image').setInputFiles({ name: 'welcome.png', mimeType: 'image/png', buffer: PNG });
  await expect(page.getByRole('button', { name: 'Replace image' })).toBeVisible();
  await expect(page.getByRole('alert')).toHaveCount(0);

  // Both previews show the unsaved values, in the centered layout.
  const desktop = page.getByTestId('signin-preview-desktop');
  await expect(desktop.getByTestId('welcome-title')).toHaveText('Welcome to Acme');
  await expect(desktop.getByTestId('welcome-message')).toHaveText('Meet the community');
  await expect(desktop.locator(`img[src="${UPLOADED_IMAGE}"]`)).toBeVisible();
  const title = await desktop.getByTestId('welcome-title').boundingBox();
  const cardTitle = await desktop.getByRole('heading', { name: 'Sign In', includeHidden: true }).boundingBox();
  expect(title && cardTitle && title.y < cardTitle.y).toBeTruthy();
  await expect(page.getByTestId('signin-preview-phone').getByTestId('welcome-title')).toHaveText('Welcome to Acme');

  await expect(page.getByTestId('settings-unsaved')).toBeVisible();
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect.poll(() => puts.length).toBe(1);
  expect(puts[0]).toMatchObject({
    welcomeTitle: 'Welcome to Acme',
    welcomeDescription: 'Meet the community',
    welcomeLayout: 'centered',
    welcomeImage: UPLOADED_IMAGE,
    welcomeImageFit: 'cover',
  });
  await expect(page.getByTestId('settings-unsaved')).toHaveCount(0);
});

test('saving an App without welcome edits sends no welcome fields', async ({ page }) => {
  const { puts } = await fakeBackend(page, { app: { ...editedApp }, signedIn: true });
  await page.goto(`/app/admin/apps/${APP_ID}/settings?tab=Appearance`);
  await page.getByPlaceholder('Enter Tagline of Your App').fill('Chat with everyone');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect.poll(() => puts.length).toBe(1);
  expect(Object.keys(puts[0]).filter((key) => key.startsWith('welcome'))).toEqual([]);
});

test('an App without welcome fields renders the login page as before', async ({ page }) => {
  await fakeBackend(page);
  await page.goto('/login');
  const cardTitle = page.getByRole('heading', { name: 'Sign In' });
  await expect(cardTitle).toBeVisible();
  await expect(page.getByTestId('welcome-title')).toHaveCount(0);
  await expect(page.getByTestId('welcome-message')).toHaveCount(0);
  const tagline = page.getByText('Chat with your team');
  await expect(tagline).toBeVisible();
  // Side by side: the tagline column on the left, the fixed-height card on
  // the right.
  const taglineBox = await tagline.boundingBox();
  const titleBox = await cardTitle.boundingBox();
  expect(taglineBox && titleBox && taglineBox.x + taglineBox.width <= titleBox.x).toBeTruthy();
  const card = page.getByTestId('signin-card');
  expect(Math.round((await card.boundingBox())?.height ?? 0)).toBe(588);
  // The placeholder logo, not the initials tile of the welcome screen.
  await expect(page.getByRole('img', { name: /logo/i })).toBeVisible();
});

const centeredConfig = {
  ...baseConfig,
  welcomeTitle: 'Welcome to Acme',
  welcomeDescription: 'Meet the community',
  welcomeLayout: 'centered',
};

for (const path of ['/login', '/register']) {
  test(`a centered welcome screen shows its heading above the form on ${path}`, async ({ page }) => {
    await fakeBackend(page, { config: centeredConfig });
    await page.goto(path);
    const heading = page.getByRole('heading', { name: path === '/login' ? 'Sign In' : 'Sign Up' });
    await expect(heading).toBeVisible();
    const title = page.getByTestId('welcome-title');
    await expect(title).toHaveText('Welcome to Acme');
    await expect(page.getByTestId('welcome-message')).toHaveText('Meet the community');
    const titleBox = await title.boundingBox();
    const headingBox = await heading.boundingBox();
    expect(titleBox && headingBox && titleBox.y + titleBox.height <= headingBox.y).toBeTruthy();
  });
}

test('the welcome heading shows on the phone register page', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await fakeBackend(page, { config: { ...centeredConfig, welcomeLayout: 'split' } });
  await page.goto('/register');
  await expect(page.getByRole('heading', { name: 'Sign Up' })).toBeVisible();
  await expect(page.getByTestId('welcome-title')).toHaveText('Welcome to Acme');
});
