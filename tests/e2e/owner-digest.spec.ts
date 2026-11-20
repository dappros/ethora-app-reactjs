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

async function fakeBackend(page: Page, opts: { digest?: Record<string, unknown>; csvStatus?: number; apps?: number } = {}) {
  const puts: Record<string, unknown>[] = [];
  const appsQueries: Record<string, string>[] = [];
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
      if (pathname === '/v1/apps') {
        appsQueries.push(Object.fromEntries(url.searchParams));
        const n = opts.apps ?? 1;
        const stats = { totalRegistered: 0, totalSessions: 0, totalApiCalls: 0, totalFiles: 0, totalTransactions: 0, totalChats: 0, totalTokens: 0, lastActivityAt: null };
        const list = Array.from({ length: n }, (_, i) => ({ ...app, stats, ...(i ? { _id: `${APP_ID.slice(0, -2)}${String(i + 1).padStart(2, '0')}`, displayName: `E2E App ${i + 1}` } : {}) }));
        return json(route, { apps: list, total: n });
      }
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
        return json(route, {
          results: [
            { id: 'm0', originId: null, ts: 1794999990000, from: `${APP_ID}_bot1-bot`, nick: `${APP_ID}_bot1-bot`, body: 'E2E App has joined the chat', joinNotice: true },
            { id: 'm1', originId: null, ts: 1795000000000, from: `${APP_ID}_widget-1`, nick: '', body: 'Linked from an email' },
            { id: 'm2', originId: null, ts: 1795000005000, from: `${APP_ID}_bot1-bot`, nick: `${APP_ID}_bot1-bot`, body: 'Here is the answer' },
          ],
          total: 3, nextBefore: null, mamUnavailable: false,
        });
      }
      return json(route, { ok: true, items: [], total: 0 });
    },
  );
  await page.addInitScript(() => {
    localStorage.setItem('token-538', 'e2e-token');
    localStorage.setItem('refreshToken-538', 'e2e-refresh');
  });
  return { puts, appsQueries };
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
  // One count everywhere: the agent's join notice is not a message of the conversation.
  await expect(page.getByText('Here is the answer')).toBeVisible();
  await expect(page.getByText('E2E App has joined the chat')).toHaveCount(0);
  await expect(page.getByRole('dialog')).toContainText('Messages (2)');
  await page.keyboard.press('Escape');
  await page.getByTestId('conversations-notifications').click();
  await expect(page.getByRole('link', { name: 'Email me when a conversation is completed' })).toHaveAttribute('href', '/app/account?tab=Email%20reports');
  await expect(page.getByRole('link', { name: 'Webhook (conversation.completed)' })).toHaveAttribute('href', `/app/admin/apps/${APP_ID}/settings?tab=Webhooks`);
});

test('Apps list: newest first at first; a chosen sorting is kept when coming back', async ({ page }) => {
  const { appsQueries } = await fakeBackend(page);
  await page.goto('/app/admin/apps');
  await expect.poll(() => appsQueries.length).toBeGreaterThan(0);
  expect(appsQueries[0]).toMatchObject({ orderBy: 'createdAt', order: 'desc' });
  // A sorting named in the address wins, and is remembered.
  await page.goto('/app/admin/apps?orderBy=displayName&order=asc');
  await expect.poll(() => appsQueries.some((q) => q.orderBy === 'displayName' && q.order === 'asc')).toBe(true);
  appsQueries.length = 0;
  await page.goto(`/app/admin/apps/${APP_ID}/statistics`);
  await page.goto('/app/admin/apps');
  await expect.poll(() => appsQueries.length).toBeGreaterThan(0);
  expect(appsQueries[0]).toMatchObject({ orderBy: 'displayName', order: 'asc' });
  appsQueries.length = 0;
  await page.reload();
  await expect.poll(() => appsQueries.length).toBeGreaterThan(0);
  expect(appsQueries[0]).toMatchObject({ orderBy: 'displayName', order: 'asc' });
});

test('Apps list: a normal account with several Apps sorts its list too', async ({ page }) => {
  const { appsQueries } = await fakeBackend(page, { apps: 3 });
  await page.goto('/app/admin/apps');
  const sorting = page.getByTestId('apps-sorting');
  await expect(sorting).toBeVisible();
  await expect(sorting).toContainText('Date');
  await sorting.getByRole('button').first().click();
  // (The radios are zero-size; the label text is what a person clicks.)
  await page.getByText('Display Name', { exact: true }).click();
  await expect.poll(() => appsQueries.some((q) => q.orderBy === 'displayName')).toBe(true);
  await expect(page).toHaveURL(/orderBy=displayName/);
});

test('Apps list: no sorting control for an account with one App', async ({ page }) => {
  const { appsQueries } = await fakeBackend(page, { apps: 1 });
  await page.goto('/app/admin/apps');
  await expect.poll(() => appsQueries.length).toBeGreaterThan(1);
  await expect(page.getByText('E2E App', { exact: true }).first()).toBeVisible();
  await expect(page.getByTestId('apps-sorting')).toHaveCount(0);
});

test.describe('Apps list on a phone', () => {
  test.use({ viewport: { width: 390, height: 844 } });
  test('the toolbar with the sorting control fits the width', async ({ page }) => {
    await fakeBackend(page, { apps: 3 });
    await page.goto('/app/admin/apps');
    const sorting = page.getByTestId('apps-sorting');
    await expect(sorting).toBeVisible();
    const box = await sorting.boundingBox();
    expect(box && box.x >= 0 && box.x + box.width <= 390).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  });
});

test('Users: inviting a colleague is one click away from the Visitors tab', async ({ page }) => {
  await fakeBackend(page);
  await page.goto(`/app/admin/apps/${APP_ID}/users?access=visitors`);
  await page.getByTestId('visitors-invite-colleague').click();
  await expect(page.getByRole('dialog', { name: 'Invite a colleague' })).toBeVisible();
  await expect(page.getByText('Manages everything in this app; can get its email reports')).toBeVisible();
});

async function boxes(page: Page) {
  const controls = page.getByTestId('stat-controls');
  await expect(page.getByTestId('stat-email-reports')).toBeVisible();
  const period = await controls.locator('button').first().boundingBox();
  const csv = await page.getByTestId('stat-export-csv').boundingBox();
  const mail = await page.getByTestId('stat-email-reports').boundingBox();
  return [period!, csv!, mail!];
}
const overlap = (a: { x: number; y: number; width: number; height: number }, b: typeof a) =>
  a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;

test('Statistics: period, Export CSV and Email reports on one line, same height and top', async ({ page }) => {
  await fakeBackend(page);
  await page.goto(`/app/admin/apps/${APP_ID}/statistics`);
  const [period, csv, mail] = await boxes(page);
  for (const b of [csv, mail]) {
    expect(Math.abs(b.y - period.y)).toBeLessThan(1);
    expect(Math.abs(b.height - period.height)).toBeLessThan(1);
  }
  expect(mail.x).toBeGreaterThan(csv.x);
});

test.describe('on a phone', () => {
  test.use({ viewport: { width: 375, height: 800 } });
  test('Statistics controls wrap without overlapping', async ({ page }) => {
    await fakeBackend(page);
    await page.goto(`/app/admin/apps/${APP_ID}/statistics`);
    const [period, csv, mail] = await boxes(page);
    expect(overlap(period, csv)).toBe(false);
    expect(overlap(period, mail)).toBe(false);
    expect(overlap(csv, mail)).toBe(false);
    for (const b of [period, csv, mail]) expect(b.x + b.width).toBeLessThanOrEqual(375);
  });
});

test('Settings: Email reports under Webhooks opens Account > Email reports', async ({ page }) => {
  await fakeBackend(page);
  await page.goto(`/app/admin/apps/${APP_ID}/settings?tab=Email%20reports`);
  const entry = page.getByTestId('app-email-reports');
  await expect(entry).toContainText('set per person');
  // (Not clicked: the fake App leaves the settings form "unsaved", which holds navigation.)
  await expect(entry.getByTestId('app-email-reports-open')).toHaveAttribute('href', '/app/account?tab=Email%20reports');
  await expect(entry.getByTestId('app-email-reports-colleagues')).toContainText('invited to it as an admin');
  await expect(entry.getByTestId('app-email-reports-invite')).toHaveAttribute('href', `/app/admin/apps/${APP_ID}/users?access=admin`);
  await page.goto('/app/account?tab=Email%20reports');
  await expect(page.getByTestId('email-reports-personal')).toContainText('yours only');
  await expect(page.getByTestId('email-reports-colleagues')).toContainText('Users > Admins > Invite a colleague');
});

test.describe('Settings entry in French and Spanish', () => {
  for (const [locale, text, colleagues, account] of [
    ['fr-FR', 'Ils se règlent par personne', 'Inviter un collègue comme administrateur', 'Utilisateurs > Admins > Inviter un collègue'],
    ['es-ES', 'Se configuran por persona', 'Invitar a un compañero como administrador', 'Usuarios > Admins > Invitar a un compañero'],
  ] as const) {
    test.describe(locale, () => {
      test.use({ locale });
      test(`Email reports entry (${locale})`, async ({ page }) => {
        await fakeBackend(page);
        await page.goto(`/app/admin/apps/${APP_ID}/settings?tab=Email%20reports`);
        await expect(page.getByTestId('app-email-reports')).toContainText(text);
        await expect(page.getByTestId('app-email-reports-invite')).toHaveText(colleagues);
        await page.goto('/app/account?tab=Email%20reports');
        await expect(page.getByTestId('email-reports-colleagues')).toContainText(account);
      });
    });
  }
});
