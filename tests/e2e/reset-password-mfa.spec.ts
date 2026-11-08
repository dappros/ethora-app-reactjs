import { expect, test } from '@playwright/test';

const token = '0123456789abcdef01234567';

test('reset accepts a backup code after an incorrect MFA attempt', async ({ page }) => {
  const posts: Array<Record<string, unknown>> = [];
  let refreshes = 0;
  await page.route((url) => /^\/v[12]\//.test(url.pathname), async (route) => {
    const path = new URL(route.request().url()).pathname;
    const json = (body: unknown, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
    if (path === '/v1/apps/get-config') return json({ result: { _id: 'e2e-app', displayName: 'Test', primaryColor: '#0052CD', signonOptions: ['email'] } });
    if (path === '/v1/users/login/refresh') { refreshes++; return json({}, 401); }
    if (path === '/v1/users/reset') {
      posts.push(route.request().postDataJSON());
      if (posts.length === 1) return json({ code: 'MFA_REQUIRED', details: { methods: ['totp', 'backup'] } }, 403);
      if (posts.length === 2) return json({ code: 'MFA_CODE_INVALID', details: { attemptsLeft: 4 } }, 401);
      return json({ ok: true });
    }
    return json({ ok: true, items: [] });
  });
  await page.goto(`/resetPassword/${token}`);
  await page.getByPlaceholder('Enter New Password').fill('password123');
  await page.getByPlaceholder('Repeat New Password').fill('password123');
  await page.getByRole('button', { name: 'Reset password' }).click();
  await expect(page.getByText('Enter a code from your authenticator app or a backup code.')).toBeVisible();
  await page.getByLabel('Verification code').fill('000000');
  await page.getByRole('button', { name: 'Reset password' }).click();
  await expect(page.getByText('Attempts remaining: 4')).toBeVisible();
  await page.getByLabel('Verification code').fill('AAAAA-BBBBB');
  await page.getByRole('button', { name: 'Reset password' }).click();
  await expect(page).toHaveURL(/\/login/);
  expect(posts).toEqual([
    { token, password: 'password123' },
    { token, password: 'password123', mfaCode: '000000' },
    { token, password: 'password123', mfaCode: 'AAAAA-BBBBB' },
  ]);
  expect(refreshes).toBe(0);
});

test('expired reset link offers a new reset request', async ({ page }) => {
  await page.route((url) => /^\/v[12]\//.test(url.pathname), async (route) => {
    const path = new URL(route.request().url()).pathname;
    const body = path === '/v1/apps/get-config'
      ? { result: { _id: 'e2e-app', displayName: 'Test', primaryColor: '#0052CD', signonOptions: ['email'] } }
      : path === '/v1/users/reset' ? { code: 'RESET_TOKEN_INVALID' } : { ok: true, items: [] };
    await route.fulfill({ status: path === '/v1/users/reset' ? 422 : 200, contentType: 'application/json', body: JSON.stringify(body) });
  });
  await page.goto(`/resetPassword/${token}`);
  await page.getByPlaceholder('Enter New Password').fill('password123');
  await page.getByPlaceholder('Repeat New Password').fill('password123');
  await page.getByRole('button', { name: 'Reset password' }).click();
  await page.getByRole('link', { name: 'Request a new reset link.' }).click();
  await expect(page.getByPlaceholder('Email')).toBeVisible();
});

test('resets without a second factor when MFA is not required', async ({ page }) => {
  const posts: Array<Record<string, unknown>> = [];
  await page.route((url) => /^\/v[12]\//.test(url.pathname), async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path === '/v1/users/reset') posts.push(route.request().postDataJSON());
    const body = path === '/v1/apps/get-config'
      ? { result: { _id: 'e2e-app', displayName: 'Test', primaryColor: '#0052CD', signonOptions: ['email'] } }
      : { ok: true, items: [] };
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
  });
  await page.goto(`/resetPassword/${token}`);
  await page.getByPlaceholder('Enter New Password').fill('password123');
  await page.getByPlaceholder('Repeat New Password').fill('password123');
  await page.getByRole('button', { name: 'Reset password' }).click();
  await expect(page).toHaveURL(/\/login/);
  expect(posts).toEqual([{ token, password: 'password123' }]);
});
