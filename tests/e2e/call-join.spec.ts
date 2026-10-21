import { expect, Page, Route, test } from '@playwright/test';

// The join link of a scheduled call (/call/<slug>) against a fake API:
//  - opened signed out, the visitor goes to the login and comes back to the
//    same /call/<slug> after signing in (the redirect-after-login bookkeeping),
//  - then the slug is resolved, and a call that cannot be opened gets a screen
//    with a way back to the chats (404, 403, cancelled, server error).
// Nothing here starts a call or touches a real backend.

const SLUG = 'abcdefghijklmnopqrstuv';
const USER_ID = 'e2e-user';

const appConfig = {
  result: {
    _id: 'e2e-app',
    displayName: 'Ethora Test App',
    afterLoginPage: 'chats',
    primaryColor: '#0052CD',
    signonOptions: ['email'],
    availableMenuItems: { chats: true, profile: true, settings: true },
    defaultRooms: [],
    isBaseApp: false,
    isAllowedNewAppCreate: false,
    usersCanFree: true,
    stats: {},
    systemChatAccount: { jid: 'system@example.com' },
  },
};

const user = {
  _id: USER_ID,
  appId: 'e2e-app',
  firstName: 'E2E',
  lastName: 'Member',
  email: 'e2e@example.com',
  xmppUsername: `e2e-app_${USER_ID}`,
  xmppPassword: 'x',
  isAgreeWithTerms: true,
};

type Lookup = { status: number; body: unknown };

const callBody = (status = 'scheduled') => ({
  scheduledCall: { slug: SLUG, status, title: 'Weekly sync' },
  chat: { name: 'e2e-app_room', title: 'Room', type: 'group', jid: 'e2e-app_room@conference.example.com' },
});

async function fakeBackend(page: Page, lookup: Lookup, opts: { signedIn: boolean }) {
  const lookups: string[] = [];
  const json = (route: Route, body: unknown, status = 200) =>
    route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
  await page.route(
    (url) => /^\/v[12]\//.test(url.pathname),
    async (route) => {
      const req = route.request();
      const { pathname } = new URL(req.url());
      if (pathname === '/v1/apps/get-config') return json(route, appConfig);
      if (pathname === '/v1/users/login-with-email') {
        return json(route, { token: 'e2e-token', refreshToken: 'e2e-refresh', user });
      }
      if (pathname === '/v1/users/me') {
        return json(route, { token: 'e2e-token', refreshToken: 'e2e-refresh', user });
      }
      if (pathname === `/v1/chats/calls/scheduled/${SLUG}`) {
        lookups.push(req.headers()['authorization'] ?? '');
        return json(route, lookup.body, lookup.status);
      }
      return json(route, { ok: true, items: [], total: 0 });
    },
  );
  if (opts.signedIn) {
    await page.addInitScript(() => {
      localStorage.setItem('token-538', 'e2e-token');
      localStorage.setItem('refreshToken-538', 'e2e-refresh');
    });
  }
  return { lookups };
}

async function signIn(page: Page) {
  await page.getByPlaceholder('Email').fill('e2e@example.com');
  await page.getByPlaceholder('Password').fill('not-a-real-password');
  await page.getByRole('button', { name: 'Sign In', exact: true }).click();
}

test.describe('signed out', () => {
  test('goes to the login first, and comes back to the same join link after signing in', async ({ page }) => {
    const { lookups } = await fakeBackend(page, { status: 404, body: { error: 'not-found' } }, { signedIn: false });
    await page.goto(`/call/${SLUG}`);
    await expect(page).toHaveURL(/\/login/);
    // Nothing is resolved before there is a session.
    expect(lookups).toHaveLength(0);

    await signIn(page);

    await expect(page).toHaveURL(new RegExp(`/call/${SLUG}$`));
    await expect(page.getByTestId('call-join-error')).toBeVisible();
    expect(lookups.length).toBeGreaterThan(0);
    expect(lookups[0]).toBe('e2e-token');
  });

  test('the parked link is used once: the next login lands on the normal page', async ({ page }) => {
    await fakeBackend(page, { status: 404, body: {} }, { signedIn: false });
    await page.goto(`/call/${SLUG}`);
    await signIn(page);
    await expect(page).toHaveURL(new RegExp(`/call/${SLUG}$`));
    expect(await page.evaluate(() => localStorage.getItem('returnPath-538'))).toBeNull();
  });

  test('a visitor who just opens the login is not sent to a call', async ({ page }) => {
    await fakeBackend(page, { status: 404, body: {} }, { signedIn: false });
    await page.goto('/login');
    await signIn(page);
    await expect(page).not.toHaveURL(/\/call\//);
  });
});

test.describe('signed in', () => {
  const cases: Array<[string, Lookup, string]> = [
    ['unknown call', { status: 404, body: { error: 'not-found' } }, 'not-found'],
    ['not a member', { status: 403, body: { error: 'not-a-member' } }, 'not-a-member'],
    ['cancelled call', { status: 200, body: callBody('cancelled') }, 'cancelled'],
    ['server error', { status: 500, body: {} }, 'error'],
  ];

  for (const [name, lookup, reason] of cases) {
    test(`${name} gets its own screen with a way back to the chats`, async ({ page }) => {
      await fakeBackend(page, lookup, { signedIn: true });
      await page.goto(`/call/${SLUG}`);
      const screen = page.getByTestId('call-join-error');
      await expect(screen).toBeVisible();
      await expect(screen).toHaveAttribute('data-reason', reason);
      const back = screen.getByRole('link', { name: 'Go to chats' });
      await expect(back).toHaveAttribute('href', '/app/chat');
      // No chat was opened behind the error.
      await expect(page).toHaveURL(new RegExp(`/call/${SLUG}$`));
    });
  }

  test('the error screens say what happened', async ({ page }) => {
    await fakeBackend(page, { status: 403, body: { error: 'not-a-member' } }, { signedIn: true });
    await page.goto(`/call/${SLUG}`);
    await expect(page.getByText('You are not a member of this chat')).toBeVisible();
  });

  test('a malformed slug is "not found" without asking the server', async ({ page }) => {
    const { lookups } = await fakeBackend(page, { status: 200, body: callBody() }, { signedIn: true });
    await page.goto('/call/short');
    await expect(page.getByTestId('call-join-error')).toHaveAttribute('data-reason', 'not-found');
    expect(lookups).toHaveLength(0);
  });

  test('an openable call resolves and hands over to the chat page', async ({ page }) => {
    const { lookups } = await fakeBackend(page, { status: 200, body: callBody() }, { signedIn: true });
    await page.goto(`/call/${SLUG}`);
    await expect(page.getByTestId('call-join-error')).toHaveCount(0);
    await expect(page.getByRole('tab', { name: 'Chats' })).toBeVisible();
    expect(lookups.length).toBeGreaterThan(0);
    await expect(page).toHaveURL(new RegExp(`/call/${SLUG}`));
  });
});
