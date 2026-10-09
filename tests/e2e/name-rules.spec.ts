import { expect, Page, Route, test } from '@playwright/test';

// Profile > Edit accepts short names and an empty last name (the API's shared
// name rules: first name 1-60 characters, last name optional), against a fake API.

const USER_ID = 'e2e-user';

async function fakeBackend(page: Page) {
  const puts: string[] = [];
  const user = {
    _id: USER_ID,
    appId: 'e2e-app',
    firstName: 'E2E',
    lastName: 'Owner',
    email: 'e2e@example.com',
    xmppUsername: `e2e-app_${USER_ID}`,
    xmppPassword: 'x',
    isAgreeWithTerms: true,
    isSuperAdmin: {},
  };
  const json = (route: Route, body: unknown, status = 200) =>
    route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
  await page.route(
    (url) => /^\/v[12]\//.test(url.pathname),
    async (route) => {
      const req = route.request();
      const { pathname } = new URL(req.url());
      if (pathname === '/v1/apps/get-config') return json(route, appConfig);
      if (pathname === '/v1/users/me') return json(route, { token: 'e2e-token', refreshToken: 'e2e-refresh', user });
      if (pathname === '/v1/users' && req.method() === 'PUT') {
        const body = req.postData() || '';
        puts.push(body);
        const field = (name: string) => (new RegExp(`name="${name}"\\r\\n\\r\\n([^\\r]*)\\r\\n`).exec(body) || [])[1] ?? null;
        Object.assign(user, { firstName: field('firstName'), lastName: field('lastName') });
        return json(route, { success: true, user });
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

test('a two-letter first name and no last name can be saved', async ({ page }) => {
  const { puts } = await fakeBackend(page);
  await page.goto('/app/profile/edit');
  await page.getByPlaceholder('First Name').fill('Li');
  await page.getByPlaceholder('Last Name').fill('');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.getByText('Profile updated successfully')).toBeVisible();
  expect(puts).toHaveLength(1);
  expect(puts[0]).toMatch(/name="firstName"\r\n\r\nLi\r\n/);
  expect(puts[0]).toMatch(/name="lastName"\r\n\r\n\r\n/);
});

test('the first name is still required', async ({ page }) => {
  const { puts } = await fakeBackend(page);
  await page.goto('/app/profile/edit');
  await page.getByPlaceholder('First Name').fill('');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await page.waitForTimeout(500);
  expect(puts).toHaveLength(0);
});
