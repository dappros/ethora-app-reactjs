import { expect, Page, Route, test } from '@playwright/test';

// Users > Visitors: anonymous website visitors listed from the widget
// conversations endpoint, against a fake API.

const USER_ID = 'e2e-user';
const APP_ID = 'e2eapp000000000000000001';

const conversation = (n: number, extra: Record<string, unknown> = {}) => ({
  _id: `chat${n}`,
  name: `${APP_ID}_room${n}`,
  title: 'Widget',
  type: 'widget',
  createdAt: '2026-10-07T12:00:00.000Z',
  updatedAt: '2026-10-07T12:30:00.000Z',
  visitor: {
    _id: `visitor${n}`,
    uuid: `4f2a9c1${n}aaaa`,
    xmppUsername: `${APP_ID}_widget-4f2a9c1${n}aaaa`,
    firstSeenAt: '2026-10-07T12:00:00.000Z',
    metadata: {
      userAgent: '',
      ip: '203.0.113.7',
      country: 'GB',
      browser: 'Chrome',
      browserVersion: '154.0.1',
      os: 'macOS',
      osVersion: '10.15.7',
      deviceType: '',
      pageUrl: 'https://shop.example.com/pricing',
      lastPageUrl: 'https://shop.example.com/contact',
      capturedAt: null,
      ...extra,
    },
  },
});

async function fakeBackend(page: Page, visitors: unknown[]) {
  const calls: string[] = [];
  const json = (route: Route, body: unknown, status = 200) =>
    route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
  let rows = [...visitors];
  await page.route(
    (url) => /^\/v[12]\//.test(url.pathname),
    async (route) => {
      const req = route.request();
      const { pathname } = new URL(req.url());
      const method = req.method();
      if (method !== 'GET') calls.push(`${method} ${pathname}`);
      if (pathname === '/v1/apps/get-config') return json(route, appConfig);
      if (pathname === '/v1/users/me') return json(route, me);
      if (pathname === '/v1/apps') return json(route, { apps: [app], total: 1 });
      if (pathname === `/v1/apps/${APP_ID}`) return json(route, { result: app });
      if (pathname === `/v1/users/${APP_ID}`) return json(route, { items: [], total: 0 });
      if (pathname === `/v2/apps/${APP_ID}/widget/conversations`) {
        return json(route, { results: rows, total: rows.length, pagination: { limit: 20, offset: 0, total: rows.length } });
      }
      if (pathname.startsWith(`/v2/apps/${APP_ID}/chats/`) && pathname.endsWith('/messages') && method === 'GET') {
        return json(route, { results: [{ id: 'm1', originId: null, ts: 1791380000000, from: `${APP_ID}_widget-4f2a9c11aaaa`, nick: '', body: 'Do you ship to Canada?' }], total: 1, nextBefore: null, mamUnavailable: false });
      }
      if (pathname === `/v1/users/delete-many-with-app-id/${APP_ID}`) {
        rows = [];
        return json(route, { ok: true });
      }
      return json(route, { ok: true, items: [], total: 0 });
    },
  );
  await page.addInitScript(() => {
    localStorage.setItem('token-538', 'e2e-token');
    localStorage.setItem('refreshToken-538', 'e2e-refresh');
  });
  return { calls };
}

const app = { _id: APP_ID, displayName: 'E2E App', creatorId: USER_ID, signonOptions: ['email'], defaultChatRooms: [] };
const appConfig = {
  result: {
    _id: 'e2e-app', displayName: 'Ethora Test App', afterLoginPage: '/app/admin/apps', primaryColor: '#0052CD',
    signonOptions: ['email'], availableMenuItems: { chats: true, profile: true, settings: true }, defaultRooms: [],
    isBaseApp: true, isAllowedNewAppCreate: true, usersCanFree: true, stats: {},
  },
};
const me = {
  token: 'e2e-token', refreshToken: 'e2e-refresh',
  user: { _id: USER_ID, appId: 'e2e-app', firstName: 'E2E', lastName: 'Owner', email: 'e2e@example.com', xmppUsername: `e2e-app_${USER_ID}`, xmppPassword: 'x', isAgreeWithTerms: true, isSuperAdmin: {} },
};

test('Visitors lists country, device, website page and opens the conversation', async ({ page }) => {
  const { calls } = await fakeBackend(page, [conversation(1)]);
  await page.goto(`/app/admin/apps/${APP_ID}/users`);
  const switcher = page.getByTestId('users-access-switch');
  await expect(switcher.getByRole('button', { name: 'Users' })).toBeVisible();
  await expect(switcher.getByRole('button', { name: 'Admins' })).toBeVisible();
  await switcher.getByRole('button', { name: 'Visitors (1)' }).click();
  const table = page.getByTestId('visitors-table');
  await expect(table).toContainText('Visitor #4f2a9c11');
  await expect(table).toContainText('United Kingdom');
  await expect(table).toContainText('Chrome 154 · macOS 10.15.7');
  await expect(table.getByRole('link', { name: 'shop.example.com/pricing' })).toHaveAttribute('href', 'https://shop.example.com/pricing');
  await expect(table).toContainText('Last: shop.example.com/contact');
  await expect(table).not.toContainText('203.0.113.7');
  await table.getByRole('button', { name: 'Conversation' }).click();
  await expect(page.getByText('Do you ship to Canada?')).toBeVisible();
  await page.keyboard.press('Escape');
  await table.getByRole('button', { name: 'Delete' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Delete' }).click();
  await expect(page.getByText('Visitor deleted')).toBeVisible();
  expect(calls).toEqual([
    `DELETE /v2/apps/${APP_ID}/chats/chat1/messages`,
    `DELETE /v2/apps/${APP_ID}/chats`,
    `POST /v1/users/delete-many-with-app-id/${APP_ID}`,
  ]);
});

test('Visitors is disabled when the App has none', async ({ page }) => {
  await fakeBackend(page, []);
  await page.goto(`/app/admin/apps/${APP_ID}/users`);
  const visitors = page.getByTestId('users-access-switch').getByRole('button', { name: 'Visitors' });
  await expect(visitors).toBeDisabled();
});
