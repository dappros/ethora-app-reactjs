import { expect, Page, Route, test } from '@playwright/test';

// Account > Email reports, the Statistics CSV export, and the Conversations
// links (?room=, Notifications), against a fake API.

const USER_ID = 'e2e-user';
const APP_ID = 'e2eapp000000000000000001';

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

function digest(over: Record<string, unknown> = {}) {
  return {
    available: true,
    mailConfigured: true,
    enabled: true,
    email: 'e2e@example.com',
    emailVerified: true,
    settings: { daily: false, weekly: false, monthly: false, includeQuestions: true, timeZone: '' },
    apps: [{ appId: APP_ID, name: 'E2E App', completedEmail: false }],
    ...over,
  };
}

async function fakeBackend(page: Page, opts: { digest?: Record<string, unknown>; csvStatus?: number } = {}) {
  const puts: Record<string, unknown>[] = [];
  let state = digest(opts.digest);
  const json = (route: Route, body: unknown, status = 200) =>
    route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
  await page.route(
    (url) => /^\/v[12]\//.test(url.pathname),
    async (route) => {
      const req = route.request();
      const url = new URL(req.url());
      const { pathname } = url;
      const method = req.method();
      if (pathname === '/v1/apps/get-config') return json(route, appConfig);
      if (pathname === '/v1/users/me') return json(route, me);
      if (pathname === '/v1/apps') return json(route, { apps: [app], total: 1 });
      if (pathname === `/v1/apps/${APP_ID}`) return json(route, { result: app });
      if (pathname === '/v2/owner-digest/settings' && method === 'GET') return json(route, state);
      if (pathname === '/v2/owner-digest/settings' && method === 'PUT') {
        const body = req.postDataJSON();
        puts.push(body);
        const { completedApps, ...rest } = body;
        state = { ...state, settings: { ...state.settings, ...rest } };
        if (completedApps) state = { ...state, apps: state.apps.map((a) => ({ ...a, completedEmail: completedApps[a.appId] ?? a.completedEmail })) };
        return json(route, state);
      }
      if (pathname === '/v2/owner-digest/test') return json(route, { sent: true, to: 'e2e@example.com' });
      if (pathname === `/v1/apps/graph-statistic/${APP_ID}/csv`) {
        if (opts.csvStatus) return json(route, { error: 'no' }, opts.csvStatus);
        return route.fulfill({
          status: 200,
          contentType: 'text/csv; charset=utf-8',
          headers: { 'content-disposition': 'attachment; filename="statistics-e2e-app-2026-11-12-2026-11-19.csv"', 'access-control-expose-headers': 'content-disposition' },
          body: 'Date,Registered users\n2026-11-19,1\nTotal,1\n',
        });
      }
      if (pathname === `/v2/apps/${APP_ID}/widget/conversations`) {
        const room = url.searchParams.get('room');
        const row = { _id: 'chat7', name: `${APP_ID}_room7`, title: 'Widget', type: 'widget', createdAt: '2026-11-19T10:00:00.000Z', updatedAt: '2026-11-19T10:05:00.000Z', messageCount: 2, visitor: null };
        const rows = room ? (room === row.name ? [row] : []) : [];
        return json(route, { results: rows, total: rows.length, pagination: { limit: 20, offset: 0, total: rows.length } });
      }
      if (pathname === `/v2/apps/${APP_ID}/chats/chat7/messages`) {
        return json(route, { results: [{ id: 'm1', originId: null, ts: 1795000000000, from: `${APP_ID}_widget-1`, nick: '', body: 'Linked from an email' }], total: 1, nextBefore: null, mamUnavailable: false });
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

test('Email reports: all off at first; a switch saves with the browser time zone', async ({ page }) => {
  const { puts } = await fakeBackend(page);
  await page.goto('/app/account?tab=Email%20reports');
  const section = page.getByTestId('email-reports');
  for (const id of ['digest-daily', 'digest-weekly', 'digest-monthly']) await expect(section.getByTestId(id)).not.toBeChecked();
  await expect(section.getByTestId('digest-questions')).toBeChecked();
  await section.getByTestId('digest-weekly').check();
  await expect(section.getByTestId('digest-weekly')).toBeChecked();
  expect(puts[0]).toMatchObject({ weekly: true });
  expect(typeof puts[0].timeZone).toBe('string');
  await section.getByTestId(`completed-${APP_ID}`).check();
  expect(puts[1]).toEqual({ completedApps: { [APP_ID]: true } });
  await section.getByTestId('digest-test').click();
  await expect(section.getByTestId('digest-test-result')).toContainText('e2e@example.com');
});

test('Email reports: no mail delivery on the server', async ({ page }) => {
  await fakeBackend(page, { digest: { available: false, mailConfigured: false } });
  await page.goto('/app/account?tab=Email%20reports');
  await expect(page.getByTestId('email-reports-nomail')).toBeVisible();
  await expect(page.getByTestId('digest-daily')).toBeDisabled();
});

test.describe('in French', () => {
  test.use({ locale: 'fr-FR' });
  test('Email reports labels', async ({ page }) => {
    await fakeBackend(page);
    await page.goto('/app/account?tab=Email%20reports');
    await expect(page.getByTestId('email-reports')).toContainText('Inclure les questions des visiteurs');
  });
});

test('Statistics: Export CSV downloads the App file; a refusal is explained', async ({ page }) => {
  await fakeBackend(page);
  await page.goto(`/app/admin/apps/${APP_ID}/statistics`);
  const button = page.getByTestId('stat-export-csv');
  await expect(button).toBeEnabled();
  const [download] = await Promise.all([page.waitForEvent('download'), button.click()]);
  expect(download.suggestedFilename()).toBe('statistics-e2e-app-2026-11-12-2026-11-19.csv');
  await expect(page.getByTestId('stat-email-reports')).toHaveAttribute('href', '/app/account?tab=Email%20reports');
});

test('Statistics: Export CSV refused for a member who is not owner or admin', async ({ page }) => {
  await fakeBackend(page, { csvStatus: 403 });
  await page.goto(`/app/admin/apps/${APP_ID}/statistics`);
  await page.getByTestId('stat-export-csv').click();
  await expect(page.getByTestId('stat-export-error')).toContainText('owner or an admin');
});

test('Conversations: ?room= opens that conversation; Notifications links', async ({ page }) => {
  await fakeBackend(page);
  await page.goto(`/app/admin/apps/${APP_ID}/conversations?room=${APP_ID}_room7`);
  await expect(page.getByText('Linked from an email')).toBeVisible();
  await page.keyboard.press('Escape');
  await page.getByTestId('conversations-notifications').click();
  await expect(page.getByRole('link', { name: 'Email me when a conversation is completed' })).toHaveAttribute('href', '/app/account?tab=Email%20reports');
  await expect(page.getByRole('link', { name: 'Webhook (conversation.completed)' })).toHaveAttribute('href', `/app/admin/apps/${APP_ID}/settings?tab=Webhooks`);
});
