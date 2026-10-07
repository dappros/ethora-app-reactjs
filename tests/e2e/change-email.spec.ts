import { expect, Page, Route, test } from '@playwright/test';

// Account > Security > Change email, against a fake API.

const USER_ID = 'e2e-user';

async function fakeBackend(page: Page, opts: { hasPassword?: boolean; result?: 'ok' | 'wrong' | 'taken' } = {}) {
  const posts: Array<Record<string, unknown>> = [];
  const json = (route: Route, body: unknown, status = 200) =>
    route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
  await page.route(
    (url) => /^\/v[12]\//.test(url.pathname),
    async (route) => {
      const req = route.request();
      const { pathname } = new URL(req.url());
      if (pathname === '/v1/apps/get-config') return json(route, appConfig);
      if (pathname === '/v1/users/me') return json(route, me);
      if (pathname === '/v2/users/me/mfa') {
        return json(route, { success: true, enabled: false, hasPassword: opts.hasPassword ?? true, setPasswordMethods: ['reauth'] });
      }
      if (pathname === '/v2/users/me/email' && req.method() === 'POST') {
        const body = req.postDataJSON() as Record<string, unknown>;
        posts.push(body);
        if (opts.result === 'wrong') return json(route, { error: 'Current password is incorrect', code: 'WRONG_CREDENTIALS' }, 401);
        if (opts.result === 'taken') return json(route, { error: 'Another account already uses this email', code: 'EMAIL_IN_USE' }, 409);
        return json(route, { success: true, email: body.email, sessionsRevoked: 1 });
      }
      return json(route, { ok: true, items: [], total: 0 });
    },
  );
  await page.addInitScript(() => {
    localStorage.setItem('token-538', 'e2e-token');
    localStorage.setItem('refreshToken-538', 'e2e-refresh');
  });
  return { posts };
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
    email: 'old@example.com',
    xmppUsername: `e2e-app_${USER_ID}`,
    xmppPassword: 'x',
    isAgreeWithTerms: true,
    isSuperAdmin: {},
  },
};

const open = (page: Page) => page.goto('/app/account?tab=Security');

test('changes the email with the current password and shows the new address', async ({ page }) => {
  const { posts } = await fakeBackend(page);
  await open(page);
  const block = page.getByTestId('change-email');
  await expect(block).toContainText('Your email is old@example.com.');
  const submit = block.getByRole('button', { name: 'Change email' });
  await block.getByLabel('New email').fill('not-an-email');
  await expect(block.getByText('Enter a valid email address')).toBeVisible();
  await block.getByLabel('New email').fill('OLD@example.com');
  await expect(block.getByText('This is already your email')).toBeVisible();
  await block.getByLabel('New email').fill('new@example.com');
  await expect(submit).toBeDisabled();
  await block.getByLabel('Current password').fill('secret-pass');
  await submit.click();
  await expect(page.getByText('Your email is now new@example.com')).toBeVisible();
  expect(posts).toEqual([{ email: 'new@example.com', currentPassword: 'secret-pass' }]);
  await expect(block).toContainText('Your email is new@example.com.');
});

test('shows why a change was refused', async ({ page }) => {
  await fakeBackend(page, { result: 'taken' });
  await open(page);
  const block = page.getByTestId('change-email');
  await block.getByLabel('New email').fill('new@example.com');
  await block.getByLabel('Current password').fill('secret-pass');
  await block.getByRole('button', { name: 'Change email' }).click();
  await expect(page.getByText('Another account already uses this email')).toBeVisible();
  await expect(block).toContainText('Your email is old@example.com.');
});

test('an account without a password and without Google or MFA is told how to proceed', async ({ page }) => {
  await fakeBackend(page, { hasPassword: false });
  await open(page);
  const block = page.getByTestId('change-email');
  await expect(block).toContainText('sign in with Google or turn on two-factor authentication first');
  await expect(block.getByLabel('Current password')).toHaveCount(0);
});
