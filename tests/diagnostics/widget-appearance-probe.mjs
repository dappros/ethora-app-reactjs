// Diagnostic probe for the website widget appearance stored on the App.
//
// 1. Admin side: logs in, opens App settings > AI Widget for an owned App, sets
//    a distinctive teaser text, saves, and checks the save went to
//    PUT /v2/apps/:appId/widget/appearance.
// 2. Public side: reads GET /v2/widget/config?appId= and checks it serves the
//    saved value.
// 3. Embed side: loads the widget on a blank host page with only data-app-id
//    and checks the teaser shows the saved text; then with data-cta-text on the
//    tag and checks the tag wins.
// 4. Agent side: opens the App's active agent, Website widget tab, and checks
//    the App is listed.
// Restores the App's previous appearance at the end.
//
// Verdict line: WIDGET_APPEARANCE_OK / WIDGET_APPEARANCE_FAIL

import { chromium } from 'playwright';
import { login } from './lib/auth.mjs';

const QA_BASE = process.env.QA_BASE || 'https://app.chat-qa.ethora.com';
const QA_API = process.env.QA_API || 'https://api.chat-qa.ethora.com';
const WIDGET_URL = process.env.WIDGET_URL || 'https://widget.chat-qa.ethora.com/assistant.js';
const BASE_APP_ID = process.env.BASE_APP_ID || '646cc8dc96d4a4dc8f7b2f2d';
const APP_ID = process.env.APP_ID || '6ac176810b4da565169f4634';
const TEST_EMAIL = process.env.TEST_EMAIL || 'test18491@test.ethora.com';
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'TestPass123!';
const OUT_DIR = process.env.OUT_DIR || '/tmp/qa-debug';

const results = [];
const check = (name, ok, detail = '') => {
  results.push({ name, ok });
  console.log(`[${ok ? 'ok' : 'fail'}] ${name}${detail ? ` - ${detail}` : ''}`);
};

const { token } = await login({ apiBase: QA_API, appId: BASE_APP_ID, email: TEST_EMAIL, password: TEST_PASSWORD });
const api = (path, method = 'GET', body) =>
  fetch(`${QA_API}/v2${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', Authorization: token },
    body: body ? JSON.stringify(body) : undefined,
  }).then((r) => r.json());

const before = (await api(`/apps/${APP_ID}/widget/appearance`)).appearance || {};
console.log(`[state] appearance before: ${JSON.stringify(before)}`);
const teaser = `Probe teaser ${Date.now().toString(36)}`;

const browser = await chromium.launch({ channel: 'chromium' });
try {
  const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
  page.on('pageerror', (e) => console.log(`[pageerror] ${e.message}`));
  const puts = [];
  page.on('request', (r) => {
    if (r.method() === 'PUT' && r.url().includes(`/apps/${APP_ID}/widget/appearance`)) puts.push(r.postDataJSON());
  });

  await page.goto(`${QA_BASE}/login`, { waitUntil: 'domcontentloaded' });
  await page.fill('input[name="email"]', TEST_EMAIL);
  await page.fill('input[name="password"]', TEST_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/app\//, { timeout: 15000 }).catch(() => {});

  // 1. Admin
  await page.goto(`${QA_BASE}/app/admin/apps/${APP_ID}/settings?tab=AI+Widget`, { waitUntil: 'domcontentloaded' });
  const ctaField = page.getByLabel('Teaser text');
  if (!(await ctaField.isVisible().catch(() => false))) {
    await page.getByRole('button', { name: /Launcher & call to action/ }).click().catch(() => {});
  }
  await ctaField.waitFor({ timeout: 15000 });
  await ctaField.fill(teaser);
  await page.getByRole('button', { name: 'Save appearance' }).click();
  const saved = await page.getByText('Widget appearance saved').waitFor({ timeout: 10000 }).then(() => true).catch(() => false);
  check('admin save toast', saved);
  check('admin save used the API', puts.some((b) => b?.appearance?.['data-cta-text'] === teaser), JSON.stringify(puts.at(-1)));
  const snippet = await page.locator('pre').filter({ hasText: 'data-app-id' }).innerText();
  check('snippet minimal by default', !snippet.includes(teaser));
  await page.getByLabel('Pin the appearance in the snippet').check();
  const pinned = await page.locator('pre').filter({ hasText: 'data-app-id' }).innerText();
  check('snippet carries appearance when pinned', pinned.includes(teaser));
  await page.screenshot({ path: `${OUT_DIR}/widget-appearance-admin.png`, fullPage: true });

  // 2. Public config
  const cfg = await fetch(`${QA_API}/v2/widget/config?appId=${APP_ID}`).then((r) => r.json());
  check('public config serves saved value', cfg?.appearance?.['data-cta-text'] === teaser, JSON.stringify(cfg));

  // 3. Embed
  const hostUrl = new URL('/__widget-appearance-probe.html', WIDGET_URL).toString();
  const embed = async (extra) => {
    const host = await browser.newPage();
    host.on('pageerror', (e) => console.log(`[embed pageerror] ${e.message}`));
    await host.route(hostUrl, (route) =>
      route.fulfill({
        contentType: 'text/html; charset=utf-8',
        body: `<!doctype html><html><body><h1>Host</h1><script src="${WIDGET_URL}?v=${Date.now()}" id="chat-content-assistant" data-app-id="${APP_ID}" data-api-base="${QA_API}" data-cta-delay="0" ${extra}></script></body></html>`,
      }),
    );
    await host.goto(hostUrl, { waitUntil: 'domcontentloaded' });
    await host.waitForTimeout(6000);
    // The widget renders in an open shadow root; innerText stops at it.
    const text = await host.evaluate(() => document.getElementById('chat-widget')?.shadowRoot?.textContent || '');
    await host.screenshot({ path: `${OUT_DIR}/widget-appearance-embed${extra ? '-override' : ''}.png` });
    await host.close();
    return text;
  };
  const plain = await embed('');
  check('minimal embed shows saved teaser', plain.includes(teaser), plain.slice(0, 200).replace(/\s+/g, ' '));
  const override = await embed('data-cta-text="Tag wins"');
  check('snippet attribute wins over saved', override.includes('Tag wins') && !override.includes(teaser));

  // 4. Agent side
  const app = (await fetch(`${QA_API}/v1/apps/${APP_ID}`, { headers: { Authorization: token } }).then((r) => r.json()))?.result;
  const biId = app?.defaultBotInstanceId;
  const agents = [
    ...((await api('/agents?visibility=mine&limit=200')).items || []),
    ...((await api('/agents?visibility=public&limit=200')).items || []),
  ];
  let agentId = null;
  for (const a of agents) {
    const items = (await api(`/agents/${a.id}/bot-instances`)).items || [];
    if (items.some((b) => b.id === biId)) {
      agentId = a.id;
      check('bot-instances flags the App widget bot', items.find((b) => b.id === biId)?.isAppWidgetBot === true);
      break;
    }
  }
  if (agentId) {
    await page.goto(`${QA_BASE}/app/admin/agents/${agentId}/settings?tab=Widget+Appearance`, { waitUntil: 'domcontentloaded' });
    const list = page.getByTestId('website-widget-apps');
    const listed = await list.waitFor({ timeout: 15000 }).then(() => true).catch(() => false);
    check('agent Website widget tab lists the App', listed && (await list.innerText()).includes(app.displayName));
    await page.screenshot({ path: `${OUT_DIR}/widget-appearance-agent.png`, fullPage: true });
  } else {
    console.log(`[skip] App's widget bot ${biId} is not on one of this account's own agents`);
  }
} finally {
  await browser.close();
  const restored = await api(`/apps/${APP_ID}/widget/appearance`, 'PUT', { appearance: before });
  console.log(`[state] restored: ${JSON.stringify(restored.appearance)}`);
}

const failed = results.filter((r) => !r.ok);
console.log(`[verdict] ${failed.length ? 'WIDGET_APPEARANCE_FAIL' : 'WIDGET_APPEARANCE_OK'} (${results.length - failed.length}/${results.length})`);
process.exit(failed.length ? 1 : 0);
