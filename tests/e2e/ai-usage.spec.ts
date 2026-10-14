import { expect, Page, Route, test } from '@playwright/test';

// Statistics > AI tokens: the breakdown under the chart (purpose, agent,
// model) from the App's AI usage ledger, against a fake API.

const USER_ID = 'e2e-user';
const APP_ID = 'e2eapp000000000000000001';

const row = (n: number, extra: Record<string, unknown>) => ({
  calls: 1, inputTokens: n, outputTokens: 0, totalTokens: n, cachedInputTokens: 0, estimatedTokens: 0, ...extra,
});

const usage = {
  from: '2026-10-01T00:00:00.000Z',
  to: '2026-10-15T00:00:00.000Z',
  monthToDate: 12000,
  total: { calls: 9, inputTokens: 9000, outputTokens: 1000, totalTokens: 10000, cachedInputTokens: 4500, estimatedTokens: 0, chatTokens: 8000, embeddingTokens: 2000 },
  byKind: [row(7000, { kind: 'reply' }), row(1500, { kind: 'embed_site' }), row(1000, { kind: 'gate' }), row(500, { kind: 'embed_query' })],
  byAgent: [row(9000, { agentId: 'agent00000000000000000001', agentName: 'Support Agent' }), row(1000, { agentId: 'agent00000000000000000002', agentName: null })],
  byModel: [row(8000, { model: 'gpt-4.1-mini' }), row(2000, { model: 'text-embedding-3-small' })],
};

async function fakeBackend(page: Page, opts: { usage?: unknown } = {}) {
  const queries: string[] = [];
  const json = (route: Route, body: unknown, status = 200) =>
    route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
  await page.route(
    (url) => /^\/v[12]\//.test(url.pathname),
    async (route) => {
      const url = new URL(route.request().url());
      const { pathname } = url;
      if (pathname === '/v1/apps/get-config') return json(route, appConfig);
      if (pathname === '/v1/users/me') return json(route, me);
      if (pathname === '/v1/apps') return json(route, { apps: [app], total: 1 });
      if (pathname === `/v1/apps/${APP_ID}`) return json(route, { result: app });
      if (pathname === `/v1/apps/graph-statistic/${APP_ID}`) {
        return json(route, { aitokens: { x: [Date.UTC(2026, 9, 14)], y: [10000] }, aitokensCount: 10000 });
      }
      if (pathname === `/v2/apps/${APP_ID}/ai-usage`) {
        queries.push(url.search);
        return json(route, { ok: true, result: opts.usage ?? usage });
      }
      return json(route, { ok: true, items: [], total: 0 });
    },
  );
  await page.addInitScript(() => {
    localStorage.setItem('token-538', 'e2e-token');
    localStorage.setItem('refreshToken-538', 'e2e-refresh');
  });
  return { queries };
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

test('AI tokens tab breaks the period down by purpose, agent and model', async ({ page }) => {
  const { queries } = await fakeBackend(page);
  await page.goto(`/app/admin/apps/${APP_ID}/statistics?tab=aitokens`);
  const box = page.getByTestId('ai-usage-breakdown');
  await expect(box).toContainText('10,000 tokens in this period: 9,000 input, 1,000 output; 50% of input served from the prompt cache.');
  await expect(box).toContainText('This month so far: 12,000 tokens.');
  const purpose = page.getByTestId('ai-usage-by-purpose');
  await expect(purpose).toContainText('Agent replies');
  await expect(purpose).toContainText('7,000 · 70%');
  await expect(purpose).toContainText('Website indexing');
  await expect(purpose).toContainText('Reply checks (should an agent answer)');
  await expect(purpose).toContainText('Knowledge search');
  const agents = page.getByTestId('ai-usage-by-agent');
  await expect(agents).toContainText('Support Agent');
  await expect(agents).toContainText('Deleted agent');
  await expect(page.getByTestId('ai-usage-by-model')).toContainText('text-embedding-3-small');
  expect(queries[0]).toMatch(/from=\d{4}-\d{2}-\d{2}&to=\d{4}-\d{2}-\d{2}/);
});

test('other tabs do not show the breakdown', async ({ page }) => {
  await fakeBackend(page);
  await page.goto(`/app/admin/apps/${APP_ID}/statistics?tab=apiCalls`);
  await expect(page.getByText('By purpose')).toHaveCount(0);
});

test('a period with no recorded usage says so', async ({ page }) => {
  await fakeBackend(page, { usage: { ...usage, total: { ...usage.total, totalTokens: 0 }, byKind: [], byAgent: [], byModel: [] } });
  await page.goto(`/app/admin/apps/${APP_ID}/statistics?tab=aitokens`);
  await expect(page.getByTestId('ai-usage-breakdown')).toContainText('No AI usage recorded per purpose in this period.');
});
