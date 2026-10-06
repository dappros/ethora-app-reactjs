import { expect, Page, Route, test } from '@playwright/test';

// Agents page (/app/admin/agents) against a mocked API: category filter and
// chips, and the clone dialog (with the "include knowledge" option).

const USER_ID = 'e2e-user';
const OWNED_APP = { _id: 'e2eapp000000000000000001', displayName: 'E2E Owned App' };

const agentBase = {
  ownerAppId: null,
  originAppId: null,
  bio: '',
  avatarUrl: '',
  prompt: '',
  responseMode: 'always',
  responseProbability: 1,
  cooldownSec: 0,
  isRAG: true,
  ragTags: [],
  soulMd: '',
  heartbeat: { enabled: false, schedule: '', prompt: '' },
  flowsYaml: '',
  flows: [],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const agents = [
  { ...agentBase, id: 'a-mine', address: '0x1', ownerId: USER_ID, ownerAppId: OWNED_APP._id, originAppId: OWNED_APP._id, displayName: 'My Worker', visibility: 'private', categories: ['worker'], totalSiteSourceSize: 0 },
  { ...agentBase, id: 'a-gandhi', address: '0x2', ownerId: 'publisher', displayName: 'AI Gandhi', visibility: 'public', categories: ['persona'], totalSiteSourceSize: 1825807 },
  { ...agentBase, id: 'a-support', address: '0x3', ownerId: 'system', displayName: 'Support Agent', visibility: 'public', categories: ['customer-support'], totalSiteSourceSize: 0 },
];

async function fakeBackend(page: Page) {
  const clones: unknown[] = [];
  const writes: Array<{ method: string; path: string; body: unknown }> = [];
  const JOB_ID = '0123456789abcdef0123456789abcdef';
  const json = (route: Route, body: unknown, status = 200) =>
    route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });

  await page.route(
    (url) => /^\/v[12]\//.test(url.pathname),
    async (route) => {
      const req = route.request();
      const { pathname } = new URL(req.url());
      if (pathname === '/v1/apps/get-config') {
        return json(route, {
          result: {
            _id: 'e2e-app',
            displayName: 'Ethora Test App',
            afterLoginPage: '/app/admin/apps',
            appTagline: 'Playwright agents',
            primaryColor: '#0052CD',
            signonOptions: ['email'],
            availableMenuItems: { chats: true, profile: true, settings: true },
            defaultRooms: [],
            isBaseApp: true,
            isAllowedNewAppCreate: true,
            usersCanFree: true,
            stats: {},
          },
        });
      }
      if (pathname === '/v1/users/me') {
        return json(route, {
          token: 'e2e-token',
          refreshToken: 'e2e-refresh',
          user: { _id: USER_ID, appId: 'e2e-app', firstName: 'E2E', lastName: 'Owner', email: 'e2e@example.com', xmppUsername: `e2e-app_${USER_ID}`, isAgreeWithTerms: true, isSuperAdmin: {} },
        });
      }
      if (pathname === '/v1/apps') return json(route, { apps: [OWNED_APP], total: 1 });
      if (req.method() !== 'GET') writes.push({ method: req.method(), path: pathname, body: req.postDataJSON?.() ?? null });
      if (pathname === '/v2/agents' && req.method() === 'GET') return json(route, { ok: true, total: agents.length, items: agents });
      const one = pathname.match(/^\/v2\/agents\/(a-[a-z]+)$/);
      if (one && req.method() === 'GET') return json(route, { ok: true, agent: agents.find((a) => a.id === one[1]) });
      const vis = pathname.match(/^\/v2\/agents\/(a-[a-z]+)\/visibility$/);
      if (vis) return json(route, { ok: true, agent: { ...agents.find((a) => a.id === vis[1]), visibility: req.postDataJSON().visibility } });
      if (pathname.endsWith('/sources/site-crawl') && req.method() === 'POST') return json(route, { ok: true, jobId: JOB_ID, url: req.postDataJSON().url });
      if (pathname.endsWith(`/site-crawl-jobs/${JOB_ID}/cancel`)) return json(route, { ok: true, status: 'cancelling' }, 202);
      if (pathname.endsWith(`/site-crawl-jobs/${JOB_ID}`)) return json(route, { result: { jobId: JOB_ID, status: 'running', kind: 'crawl', url: 'https://example.com', savedPages: 7 } });
      const clone = pathname.match(/^\/v2\/agents\/([^/]+)\/clone$/);
      if (clone && req.method() === 'POST') {
        const body = req.postDataJSON();
        clones.push({ id: clone[1], body });
        return json(route, {
          ok: true,
          agent: { ...agents.find((a) => a.id === clone[1]), id: 'a-clone', ownerId: USER_ID, visibility: 'private', displayName: body.displayName },
          ...(body.includeKnowledge ? { knowledge: { copied: true, sites: 8, docs: 0, chunks: 120 } } : {}),
        }, 201);
      }
      return json(route, { ok: true, items: [], total: 0 });
    },
  );
  await page.addInitScript(() => {
    localStorage.setItem('token-538', 'e2e-token');
    localStorage.setItem('refreshToken-538', 'e2e-refresh');
  });
  return { clones, writes, JOB_ID };
}

test('category chips filter the lists and label the cards', async ({ page }) => {
  await fakeBackend(page);
  await page.goto('/app/admin/agents');
  await expect(page.getByText('My Worker')).toBeVisible();
  await expect(page.getByText('AI Gandhi')).toBeVisible();

  await page.getByRole('button', { name: 'Persona', exact: true }).click();
  await expect(page.getByText('AI Gandhi')).toBeVisible();
  await expect(page.getByText('My Worker')).toHaveCount(0);
  await expect(page.getByText('Support Agent', { exact: true })).toHaveCount(0);

  await page.getByRole('button', { name: 'Customer support', exact: true }).click();
  await expect(page.getByText('Support Agent', { exact: true })).toBeVisible();
  await expect(page.getByText('AI Gandhi')).toHaveCount(0);

  await page.getByRole('button', { name: 'All', exact: true }).click();
  await expect(page.getByText('My Worker')).toBeVisible();
});

test('cloning an agent with knowledge sends includeKnowledge and the chosen app', async ({ page }) => {
  const { clones } = await fakeBackend(page);
  await page.goto('/app/admin/agents');
  const card = page.locator('div.border.rounded-xl', { hasText: 'AI Gandhi' });
  await card.getByRole('button', { name: 'Clone to my agents' }).click();

  const dialog = page.getByRole('dialog', { name: 'Clone agent' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('checkbox')).toBeChecked();
  await expect(dialog.getByRole('combobox')).toHaveValue(OWNED_APP._id);
  await dialog.getByRole('button', { name: 'Clone', exact: true }).click();

  await expect(dialog).toHaveCount(0);
  expect(clones).toEqual([
    { id: 'a-gandhi', body: { displayName: 'AI Gandhi', includeKnowledge: true, ownerAppId: OWNED_APP._id } },
  ]);
  await expect(page.getByText('Knowledge copied: 8 pages, 0 documents.')).toBeVisible();
});

test('an agent without knowledge clones without the knowledge option', async ({ page }) => {
  const { clones } = await fakeBackend(page);
  await page.goto('/app/admin/agents');
  const card = page.locator('div.border.rounded-xl', { hasText: 'Support Agent' });
  await card.getByRole('button', { name: 'Clone to my agents' }).click();
  const dialog = page.getByRole('dialog', { name: 'Clone agent' });
  await expect(dialog.getByRole('checkbox')).toHaveCount(0);
  await dialog.getByRole('button', { name: 'Clone', exact: true }).click();
  await expect(dialog).toHaveCount(0);
  expect(clones).toEqual([{ id: 'a-support', body: { displayName: 'Support Agent' } }]);
});

test('own agents come first, then public ones; no section toggles', async ({ page }) => {
  await fakeBackend(page);
  await page.goto('/app/admin/agents');
  const headings = page.getByRole('heading', { level: 3 });
  await expect(headings.nth(0)).toHaveText('My agents');
  await expect(headings.nth(1)).toHaveText('Public agents');
  await expect(page.getByText('Private to your account. Manage and deploy across your Apps.')).toBeVisible();
  await expect(page.getByText('Sample platform-wide agents. Clone into your agents to modify.')).toBeVisible();
  await expect(page.getByText('Show:')).toHaveCount(0);
});

test('making an agent public asks first; cancelling changes nothing', async ({ page }) => {
  const { writes } = await fakeBackend(page);
  await page.goto('/app/admin/agents/a-mine/settings?tab=Visibility');
  const publicOption = page.locator('input[type="radio"][value="public"]');
  await publicOption.click();
  const dialog = page.getByRole('dialog', { name: 'Make this agent public?' });
  await expect(dialog).toContainText('Are you sure you want to make My Worker available to other users of this server?');
  await dialog.getByRole('button', { name: 'Cancel' }).click();
  await expect(dialog).toHaveCount(0);
  expect(writes.filter((w) => w.path.endsWith('/visibility'))).toEqual([]);

  await publicOption.click();
  await page.getByRole('dialog', { name: 'Make this agent public?' }).getByRole('button', { name: 'Make public' }).click();
  await expect(publicOption).toBeChecked();
  expect(writes.filter((w) => w.path.endsWith('/visibility'))).toEqual([
    { method: 'POST', path: '/v2/agents/a-mine/visibility', body: { visibility: 'public' } },
  ]);

  // Back to private needs no confirmation.
  await page.locator('input[type="radio"][value="private"]').click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  expect(writes.filter((w) => w.path.endsWith('/visibility')).length).toBe(2);
});

test('a running crawl can be stopped from the Web Index', async ({ page }) => {
  const { writes, JOB_ID } = await fakeBackend(page);
  await page.goto('/app/admin/agents/a-mine/settings?tab=Web%20Index');
  await page.getByPlaceholder('https://example.com').fill('https://example.com');
  await page.getByRole('button', { name: 'Crawl', exact: true }).click();
  const stop = page.getByRole('button', { name: 'Stop', exact: true });
  await expect(stop).toBeVisible();
  await stop.click();
  await expect(page.getByRole('button', { name: 'Stopping...' })).toBeDisabled();
  expect(writes.some((w) => w.method === 'POST' && w.path === `/v2/apps/e2eapp000000000000000001/sources/site-crawl-jobs/${JOB_ID}/cancel`)).toBe(true);
});
