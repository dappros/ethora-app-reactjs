// Diagnostic probe for every tab of Agent Settings (/app/admin/agents/:id/settings).
// Creates a throwaway agent scoped to one of the account's own apps, then per tab:
// edits, saves, switches to another tab and back, and checks the value is still
// shown (the tabs unmount on switch, so a panel that read a stale copy of the
// agent used to show the pre-save value). After the round trips it reloads the
// page and re-reads the agent from the API to confirm the server kept every
// value. Web Index crawls https://example.com, Docs Index uploads a small text
// file. Deletes the agent at the end.
//
// Verdict line:
//   - TABS_OK      - every check passed
//   - TABS_FAIL    - one or more checks failed (listed as [fail] lines)

import { chromium } from 'playwright';
import { login } from './lib/auth.mjs';

const QA_BASE = process.env.QA_BASE || 'https://app.chat-qa.ethora.com';
const QA_API = process.env.QA_API || 'https://api.chat-qa.ethora.com';
const APP_ID = process.env.APP_ID || '646cc8dc96d4a4dc8f7b2f2d';
const TEST_EMAIL = process.env.TEST_EMAIL || 'test18491@test.ethora.com';
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'TestPass123!';
const CRAWL_URL = process.env.CRAWL_URL || 'https://example.com';
const OUT_DIR = process.env.OUT_DIR || '/tmp/qa-debug';
const KEEP_AGENT = process.env.KEEP_AGENT === '1';

const results = [];
const check = (name, ok, detail = '') => {
  results.push({ name, ok });
  console.log(`[${ok ? 'ok' : 'fail'}] ${name}${detail ? ` - ${detail}` : ''}`);
};

const { token } = await login({ apiBase: QA_API, appId: APP_ID, email: TEST_EMAIL, password: TEST_PASSWORD });
const api = (path, method = 'GET', body) =>
  fetch(`${QA_API}/v2${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', Authorization: token },
    body: body ? JSON.stringify(body) : undefined,
  }).then((r) => r.json());

// Scope the agent to an App the account owns, so Web Index / Docs Index have
// somewhere to ingest into. SCOPE_APP_ID overrides the pick.
const ownedApps = await fetch(`${QA_API}/v1/apps`, { headers: { Authorization: token } }).then((r) => r.json());
const SCOPE_APP_ID = process.env.SCOPE_APP_ID || (ownedApps.apps || [])[0]?._id;
if (!SCOPE_APP_ID) {
  console.error('[fatal] the account owns no App to scope the agent to; set SCOPE_APP_ID');
  process.exit(1);
}
const created = await api('/agents', 'POST', {
  displayName: `Tabs probe ${Date.now()}`,
  prompt: 'You are a helpful assistant.',
  ownerAppId: SCOPE_APP_ID,
});
const AGENT_ID = created?.agent?.id;
if (!AGENT_ID) {
  console.error('[fatal] agent create failed', JSON.stringify(created).slice(0, 300));
  process.exit(1);
}
console.log(`[step] created agent ${AGENT_ID} in app ${SCOPE_APP_ID}`);

let browser;
try {

const stamp = Date.now();
const want = {
  displayName: `Tabs probe renamed ${stamp}`,
  bio: `bio ${stamp}`,
  prompt: `probe context ${stamp}`,
  soulMd: `# Soul ${stamp}`,
  schedule: 'every 30m',
  hbPrompt: `heartbeat ${stamp}`,
};

browser = await chromium.launch({ headless: true, channel: 'chromium' });
const page = await (await browser.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
page.on('pageerror', (e) => check('no page errors', false, e.message));
page.on('response', (r) => {
  if (r.url().startsWith(QA_API) && r.status() >= 400) console.log(`[http] ${r.status()} ${r.request().method()} ${r.url()}`);
});
page.on('dialog', (d) => d.accept());

await page.goto(`${QA_BASE}/login`, { waitUntil: 'domcontentloaded' });
await page.fill('input[name="email"]', TEST_EMAIL);
await page.fill('input[name="password"]', TEST_PASSWORD);
await page.click('button[type="submit"]');
await page.waitForURL(/\/app\//, { timeout: 15000 }).catch(() => {});

const settingsUrl = `${QA_BASE}/app/admin/agents/${AGENT_ID}/settings`;
await page.goto(`${settingsUrl}?tab=Persona`, { waitUntil: 'domcontentloaded' });
await page.getByLabel('Display name').waitFor({ timeout: 15000 });

const tab = async (name) => {
  await page.getByRole('tab', { name, exact: true }).click();
  await page.waitForTimeout(400);
};
const away = async (from) => {
  await tab(from === 'Persona' ? 'Instructions' : 'Persona');
  await tab(from);
};
const savedBy = (method) =>
  page.waitForResponse((r) => r.url().includes(`/agents/${AGENT_ID}`) && r.request().method() === method, { timeout: 15000 }).catch(() => null);
const click = async (name, method = 'PUT') => {
  const resp = savedBy(method);
  await page.getByRole('button', { name, exact: true }).click();
  return (await resp)?.status();
};

// Persona
await page.getByLabel('Display name').fill(want.displayName);
await page.getByLabel('Bio').fill(want.bio);
check('persona save', (await click('Save persona')) === 200);
await away('Persona');
check('persona kept after tab switch',
  (await page.getByLabel('Display name').inputValue()) === want.displayName && (await page.getByLabel('Bio').inputValue()) === want.bio);

// Instructions
await tab('Instructions');
await page.locator('textarea').first().fill(want.prompt);
check('instructions save', (await click('Save instructions')) === 200);
await away('Instructions');
check('instructions kept after tab switch', (await page.locator('textarea').first().inputValue()) === want.prompt);

// Memory
await tab('Memory');
await page.locator('textarea').first().fill(want.soulMd);
check('memory save', (await click('Save memory', 'POST')) === 200);
await away('Memory');
check('memory kept after tab switch', (await page.locator('textarea').first().inputValue()) === want.soulMd);

// Heartbeat
await tab('Heartbeat');
await page.getByLabel('Enabled').check();
await page.getByLabel(/^Schedule/).fill(want.schedule);
await page.getByLabel('Heartbeat prompt').fill(want.hbPrompt);
check('heartbeat save', (await click('Save heartbeat')) === 200);
await away('Heartbeat');
check('heartbeat kept after tab switch',
  (await page.getByLabel('Enabled').isChecked()) &&
  (await page.getByLabel(/^Schedule/).inputValue()) === want.schedule &&
  (await page.getByLabel('Heartbeat prompt').inputValue()) === want.hbPrompt);

// Flows: load the first template, validate, save
await tab('Flows');
const flowsArea = page.locator('textarea').first();
const templateButtons = page.locator('span:text-is("Templates:") ~ button');
if ((await templateButtons.count()) > 0) await templateButtons.first().click();
const flowsYaml = await flowsArea.inputValue();
check('flows template loaded', flowsYaml.trim().length > 0);
const validated = page.waitForResponse((r) => r.url().includes('/agents/flows/validate'), { timeout: 15000 }).catch(() => null);
await page.getByRole('button', { name: 'Validate', exact: true }).click();
const v = await validated;
check('flows validate', !!v && v.status() === 200 && (await v.json().catch(() => ({}))).ok === true);
check('flows save', (await click('Save flows')) === 200);
await page.waitForTimeout(300);
check('flows clean after save (Save disabled)', await page.getByRole('button', { name: 'Save flows', exact: true }).isDisabled());
await away('Flows');
check('flows kept after tab switch', (await flowsArea.inputValue()) === flowsYaml);

// Visibility
await tab('Visibility');
{
  const resp = page.waitForResponse((r) => r.url().includes(`/agents/${AGENT_ID}`) && r.request().method() !== 'GET', { timeout: 15000 }).catch(() => null);
  await page.locator('input[type="radio"][value="unlisted"]').click();
  check('visibility save', (await resp)?.status() === 200);
  await away('Visibility');
  check('visibility kept after tab switch', await page.locator('input[type="radio"][value="unlisted"]').isChecked());
}

// Widget Appearance (browser-local only): loads and saves without errors
await tab('Widget Appearance');
check('widget appearance renders', (await page.getByRole('button', { name: /save/i }).count()) > 0);

// Web Index: crawl a small public page into this agent
await tab('Web Index');
await page.waitForTimeout(1500);
await page.getByPlaceholder('https://example.com').fill(CRAWL_URL);
{
  const resp = page.waitForResponse((r) => /crawl/i.test(r.url()) && r.request().method() === 'POST', { timeout: 20000 }).catch(() => null);
  await page.getByRole('button', { name: 'Crawl', exact: true }).click();
  const r = await resp;
  check('web index crawl accepted', !!r && r.status() < 300, r ? String(r.status()) : 'no response');
  const host = new URL(CRAWL_URL).host;
  const row = await page.getByText(host).nth(1).waitFor({ timeout: 90000 }).then(() => true).catch(() => false);
  check('web index lists crawled url', row);
}

// Docs Index: upload a small text file
await tab('Docs Index');
{
  const name = `probe-${stamp}.txt`;
  const resp = page.waitForResponse((r) => r.request().method() === 'POST' && /docs/i.test(r.url()), { timeout: 60000 }).catch(() => null);
  await page.locator('input[type="file"]').setInputFiles({ name, mimeType: 'text/plain', buffer: Buffer.from(`Probe document ${stamp}. The probe colour is teal.`) });
  const r = await resp;
  check('docs upload accepted', !!r && r.status() < 300, r ? String(r.status()) : 'no response');
  const row = await page.getByText(name).waitFor({ timeout: 60000 }).then(() => true).catch(() => false);
  check('docs index lists uploaded file', row);
}

// Chats Index: renders without errors
await tab('Chats Index');
await page.waitForTimeout(1500);
check('chats index renders', (await page.locator('main, body').first().innerText()).length > 0);

// Reload: everything above must come back from the server
await page.goto(`${settingsUrl}?tab=Persona`, { waitUntil: 'domcontentloaded' });
await page.getByLabel('Display name').waitFor({ timeout: 15000 });
check('persona after reload', (await page.getByLabel('Display name').inputValue()) === want.displayName);
await tab('Instructions');
check('instructions after reload', (await page.locator('textarea').first().inputValue()) === want.prompt);
await page.screenshot({ path: `${OUT_DIR}/agent-settings-tabs.png`, fullPage: true });
await browser.close();
browser = null;

const a = (await api(`/agents/${AGENT_ID}`))?.agent || {};
check('api has every saved value',
  a.displayName === want.displayName && a.bio === want.bio && a.prompt === want.prompt &&
  a.soulMd === want.soulMd && a.heartbeat?.enabled === true && a.heartbeat?.schedule === want.schedule &&
  a.heartbeat?.prompt === want.hbPrompt && a.flowsYaml === flowsYaml && a.visibility === 'unlisted',
  JSON.stringify({ displayName: a.displayName, soulMd: a.soulMd, heartbeat: a.heartbeat, visibility: a.visibility }).slice(0, 200));

} catch (e) {
  check('probe ran to the end', false, e.message.split('\n')[0]);
} finally {
  await browser?.close();
  if (!KEEP_AGENT) {
    const del = await api(`/agents/${AGENT_ID}`, 'DELETE').catch((e) => ({ error: e.message }));
    console.log(`[step] deleted agent: ${JSON.stringify(del).slice(0, 120)}`);
  }
}

const failed = results.filter((r) => !r.ok);
console.log(`[verdict] ${failed.length ? 'TABS_FAIL' : 'TABS_OK'} (${results.length - failed.length}/${results.length})`);
