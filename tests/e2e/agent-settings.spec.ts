import { expect, Page, Route, test } from '@playwright/test';

// Agent Settings (/app/admin/agents/:id/settings) against an in-memory fake of
// the agents API. The tabs unmount on switch, so every panel re-reads the
// agent when it comes back into view; these specs guard against a panel
// showing the pre-save value after a save + tab switch, and against the
// Web / Docs Index tabs losing their App scope when the page is opened by URL.

const USER_ID = 'e2e-user';
const AGENT_ID = 'e2eagent0000000000000001';
const OWNED_APP = { _id: 'e2eapp000000000000000001', displayName: 'E2E Owned App' };

type Agent = Record<string, unknown> & { id: string };

function freshAgent(): Agent {
  return {
    id: AGENT_ID,
    address: '0x0000000000000000000000000000000000000001',
    ownerId: USER_ID,
    ownerAppId: OWNED_APP._id,
    originAppId: OWNED_APP._id,
    originAppName: OWNED_APP.displayName,
    botInstancesCount: 0,
    displayName: 'E2E Agent',
    avatarUrl: '',
    bio: '',
    prompt: 'You are a helpful assistant.',
    llmModel: '',
    responseMode: 'always',
    responseProbability: 1,
    cooldownSec: 0,
    soulMd: '',
    heartbeat: { enabled: false, schedule: '', prompt: '' },
    flowsYaml: '',
    flows: [],
    visibility: 'private',
    totalSiteSourceSize: 0,
  };
}

// Mirrors the backend: GET returns the enriched agent, writes return the bare
// projection (originAppName / botInstancesCount null).
function bare(agent: Agent): Agent {
  return { ...agent, originAppName: null, botInstancesCount: null };
}

async function fakeBackend(page: Page) {
  const agent = freshAgent();
  const writes: Array<{ method: string; path: string; body: unknown }> = [];

  const json = (route: Route, body: unknown, status = 200) =>
    route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });

  await page.route(
    (url) => /^\/v[12]\//.test(url.pathname),
    async (route) => {
      const req = route.request();
      const { pathname } = new URL(req.url());
      const method = req.method();
      const body = req.postDataJSON?.() ?? null;
      if (method !== 'GET') writes.push({ method, path: pathname, body });

      if (pathname === '/v1/apps/get-config') return json(route, appConfig);
      if (pathname === '/v1/users/me') return json(route, me);
      if (pathname === '/v1/apps') return json(route, { apps: [OWNED_APP], total: 1 });
      if (pathname === '/v2/agents' && method === 'GET') return json(route, { ok: true, total: 1, items: [agent] });
      if (pathname === '/v2/agents/flows/validate') return json(route, { ok: true, flowKeys: ['main'] });
      if (pathname === `/v2/agents/${AGENT_ID}/bot-instances`) return json(route, { ok: true, items: [] });
      if (pathname === `/v2/agents/${AGENT_ID}` && method === 'GET') return json(route, { ok: true, agent });
      if (pathname === `/v2/agents/${AGENT_ID}` && method === 'PUT') {
        Object.assign(agent, body);
        return json(route, { ok: true, agent: bare(agent) });
      }
      if (pathname === `/v2/agents/${AGENT_ID}/soul` && method === 'POST') {
        agent.soulMd = (body as { soulMd: string }).soulMd;
        return json(route, { ok: true, agent: bare(agent) });
      }
      if (pathname === `/v2/agents/${AGENT_ID}/visibility` && method === 'POST') {
        agent.visibility = (body as { visibility: string }).visibility;
        return json(route, { ok: true, agent: bare(agent) });
      }
      // Everything else the shell asks for on load (license, stats, sources
      // lists, ...) gets an empty success so nothing reaches a real server.
      return json(route, { ok: true, items: [], total: 0 });
    },
  );

  // A stored token makes the app restore the session through /v1/users/me.
  await page.addInitScript(() => {
    localStorage.setItem('token-538', 'e2e-token');
    localStorage.setItem('refreshToken-538', 'e2e-refresh');
  });

  return { agent, writes };
}

const appConfig = {
  result: {
    _id: 'e2e-app',
    displayName: 'Ethora Test App',
    afterLoginPage: '/app/admin/apps',
    appTagline: 'Playwright agent settings',
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

async function openTab(page: Page, tab: string) {
  await page.goto(`/app/admin/agents/${AGENT_ID}/settings?tab=${encodeURIComponent(tab)}`);
}

async function switchAwayAndBack(page: Page, tab: string) {
  const other = tab === 'Persona' ? 'Context' : 'Persona';
  await page.getByRole('tab', { name: other, exact: true }).click();
  await page.getByRole('tab', { name: tab, exact: true }).click();
}

test.describe('Agent Settings keeps saved values across tab switches', () => {
  test('Persona', async ({ page }) => {
    await fakeBackend(page);
    await openTab(page, 'Persona');
    await page.getByLabel('Display name').fill('Renamed agent');
    await page.getByLabel('Bio').fill('A new bio');
    await page.getByRole('button', { name: 'Save persona' }).click();
    await expect(page.getByText('Saved', { exact: true })).toBeVisible();
    await switchAwayAndBack(page, 'Persona');
    await expect(page.getByLabel('Display name')).toHaveValue('Renamed agent');
    await expect(page.getByLabel('Bio')).toHaveValue('A new bio');
  });

  test('Context', async ({ page }) => {
    const { writes } = await fakeBackend(page);
    await openTab(page, 'Context');
    const prompt = page.locator('textarea').first();
    await expect(prompt).toHaveValue('You are a helpful assistant.');
    await prompt.fill('You answer questions about the e2e suite.');
    await page.getByRole('button', { name: 'Save context' }).click();
    await expect(page.getByText('Context saved')).toBeVisible();
    expect(writes).toContainEqual(
      expect.objectContaining({ method: 'PUT', body: { prompt: 'You answer questions about the e2e suite.' } }),
    );
    await switchAwayAndBack(page, 'Context');
    await expect(page.locator('textarea').first()).toHaveValue('You answer questions about the e2e suite.');
  });

  test('SOUL.MD', async ({ page }) => {
    await fakeBackend(page);
    await openTab(page, 'SOUL.MD');
    await page.locator('textarea').first().fill('# Soul\nCalm and brief.');
    await page.getByRole('button', { name: 'Save SOUL.MD' }).click();
    await expect(page.getByText('SOUL.MD saved')).toBeVisible();
    await switchAwayAndBack(page, 'SOUL.MD');
    await expect(page.locator('textarea').first()).toHaveValue('# Soul\nCalm and brief.');
  });

  test('Heartbeat', async ({ page }) => {
    await fakeBackend(page);
    await openTab(page, 'Heartbeat');
    await page.getByLabel('Enabled').check();
    await page.getByLabel(/^Schedule/).fill('every 30m');
    await page.getByLabel('Heartbeat prompt').fill('Post a short status.');
    await page.getByRole('button', { name: 'Save heartbeat' }).click();
    await expect(page.getByText('Heartbeat saved')).toBeVisible();
    await switchAwayAndBack(page, 'Heartbeat');
    await expect(page.getByLabel('Enabled')).toBeChecked();
    await expect(page.getByLabel(/^Schedule/)).toHaveValue('every 30m');
    await expect(page.getByLabel('Heartbeat prompt')).toHaveValue('Post a short status.');
  });

  test('Flows', async ({ page }) => {
    await fakeBackend(page);
    await openTab(page, 'Flows');
    const yaml = 'flows:\n  - key: main\n    steps: []\n';
    await page.locator('textarea').first().fill(yaml);
    const save = page.getByRole('button', { name: 'Save flows' });
    await save.click();
    await expect(page.getByText('Flows saved')).toBeVisible();
    // Saved means clean: the button only enables again on a new edit.
    await expect(save).toBeDisabled();
    await switchAwayAndBack(page, 'Flows');
    await expect(page.locator('textarea').first()).toHaveValue(yaml);
    await expect(save).toBeDisabled();
  });

  test('Visibility', async ({ page }) => {
    await fakeBackend(page);
    await openTab(page, 'Visibility');
    await page.locator('input[type="radio"][value="unlisted"]').click();
    await expect(page.locator('input[type="radio"][value="unlisted"]')).toBeChecked();
    await switchAwayAndBack(page, 'Visibility');
    await expect(page.locator('input[type="radio"][value="unlisted"]')).toBeChecked();
  });
});

test.describe('Agent Settings opened by URL', () => {
  for (const tab of ['Web Index', 'Docs Index']) {
    test(`${tab} resolves the agent's App without visiting the Apps page`, async ({ page }) => {
      await fakeBackend(page);
      await openTab(page, tab);
      await expect(page.getByRole('tab', { name: tab, exact: true })).toHaveAttribute('aria-selected', 'true');
      await expect(page.getByText(/No app picked/)).toHaveCount(0);
      if (tab === 'Web Index') {
        await expect(page.getByPlaceholder('https://example.com')).toBeEnabled();
      } else {
        await expect(page.locator('input[type="file"]')).toBeEnabled();
      }
    });
  }
});
