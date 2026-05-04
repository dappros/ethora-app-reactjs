// Diagnostic probe for the "Chats page stuck on Connecting..." failure
// mode. Logs in to a remote frontend, navigates to /app/chat, and dumps:
//
//   - every console message (including chat-component verbose logs)
//   - every WebSocket constructor call + open/close/error
//   - HTTP requests/responses on /v1, /v2, /owner-session paths
//   - a redacted snapshot of the chat-component redux store
//   - the chat-component's `providerBootstrapStatus` (idle/running/ready/failed)
//   - a screenshot
//
// Originally written to diagnose the c1d9469 regression where the
// top-level <XmppProvider/> in main.tsx lost its `config` prop and the
// inner Chat config still had initBeforeLoad=true, leaving the
// chat-component permanently waiting on a parent bootstrap that never
// ran. The probe is general enough to also catch:
//
//   - SASL failures (would show <failure> in WS frames)
//   - Wrong WebSocket URL (would show no [WebSocket-new] events)
//   - Failed user resolution (would show empty user in the store snapshot)
//   - Owner-session errors during App Switcher use (request/response logs)
//
// Run:
//
//   QA_BASE=https://app.chat-qa.ethora.com \
//   QA_API=https://api.chat-qa.ethora.com \
//   APP_ID=646cc8dc96d4a4dc8f7b2f2d \
//   TEST_EMAIL=testNN@test.ethora.com \
//   TEST_PASSWORD=TestPass123! \
//   node tests/diagnostics/chat-spinner-probe.mjs
//
// The script signs up the email if it doesn't exist, otherwise reuses
// the account. See .env.example for the full set of variables.

import { chromium } from 'playwright';
import { installConsoleCapture, drainCapture } from './lib/console-capture.mjs';
import { enableChatVerboseLogging, snapshotChatStore } from './lib/fiber-walker.mjs';
import { signupOrLogin } from './lib/auth.mjs';

const QA_BASE = process.env.QA_BASE || 'https://app.chat-qa.ethora.com';
const QA_API = process.env.QA_API || 'https://api.chat-qa.ethora.com';
const APP_ID = process.env.APP_ID || '646cc8dc96d4a4dc8f7b2f2d';
const TEST_EMAIL = process.env.TEST_EMAIL || `test${Date.now()}@test.ethora.com`;
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'TestPass123!';
const SCREENSHOT_PATH = process.env.SCREENSHOT_PATH || '/tmp/chat-spinner-probe.png';
const WAIT_MS = Number(process.env.WAIT_MS || 12000);

console.log(`[step] target=${QA_BASE} email=${TEST_EMAIL}`);

console.log('[step] ensuring account exists');
await signupOrLogin({
  apiBase: QA_API,
  appId: APP_ID,
  email: TEST_EMAIL,
  password: TEST_PASSWORD,
});

const browser = await chromium.launch({ headless: true, channel: 'chromium' });
const ctx = await browser.newContext({ ignoreHTTPSErrors: true });
await installConsoleCapture(ctx);

const page = await ctx.newPage();

page.on('console', (msg) => {
  console.log(`[console.${msg.type()}] ${msg.text()}`);
});
page.on('pageerror', (err) => {
  console.log(`[pageerror] ${err.message}`);
});
page.on('request', (req) => {
  const u = req.url();
  if (u.includes('/v1/') || u.includes('/v2/') || u.includes('owner-session')) {
    console.log(`[request] ${req.method()} ${u}`);
  }
});
page.on('response', async (resp) => {
  const u = resp.url();
  if (u.includes('/v1/') || u.includes('/v2/') || u.includes('owner-session')) {
    let body = '';
    try {
      const ct = resp.headers()['content-type'] || '';
      if (ct.includes('json') || resp.status() >= 400) {
        const text = await resp.text();
        body = text.length > 300 ? text.slice(0, 300) + '...[TRUNC]' : text;
      }
    } catch {}
    console.log(`[response] ${resp.status()} ${resp.request().method()} ${u}${body ? ' | ' + body : ''}`);
  }
});

let wsCount = 0;
page.on('websocket', (ws) => {
  console.log(`[ws-open] ${ws.url()}`);
  ws.on('framesent', (data) => {
    wsCount++;
    if (wsCount <= 30) {
      const payload = data.payload?.toString?.('utf-8') || String(data.payload);
      console.log(`[ws-tx ${wsCount}] ${payload.slice(0, 250)}`);
    }
  });
  ws.on('framereceived', (data) => {
    wsCount++;
    if (wsCount <= 30) {
      const payload = data.payload?.toString?.('utf-8') || String(data.payload);
      console.log(`[ws-rx ${wsCount}] ${payload.slice(0, 250)}`);
    }
  });
  ws.on('close', () => console.log('[ws-close]'));
  ws.on('socketerror', (e) => console.log(`[ws-error] ${e}`));
});

console.log('[step] navigating to /login');
await page.goto(`${QA_BASE}/login`, { waitUntil: 'domcontentloaded' });
await page.waitForLoadState('networkidle').catch(() => {});

await page.fill('input[name="email"]', TEST_EMAIL);
await page.fill('input[name="password"]', TEST_PASSWORD);
await page.click('button[type="submit"]');

await page.waitForURL(/\/app\//, { timeout: 15000 }).catch(() => {});
console.log(`[step] post-login URL: ${page.url()}`);

console.log('[step] navigating to /app/chat');
await page.goto(`${QA_BASE}/app/chat`, { waitUntil: 'domcontentloaded' });

// Give the chat-component a beat to mount, then enable its verbose logger
await page.waitForTimeout(2000);
const verbose = await enableChatVerboseLogging(page);
console.log(`[step] chat verbose logging: ${verbose}`);

console.log(`[step] waiting ${WAIT_MS}ms for chat to connect`);
await page.waitForTimeout(WAIT_MS);

console.log('[step] taking screenshot');
await page.screenshot({ path: SCREENSHOT_PATH, fullPage: true });
console.log(`[step] screenshot saved to ${SCREENSHOT_PATH}`);

const storeSnap = await snapshotChatStore(page);
console.log('[chat-store]', JSON.stringify(storeSnap, null, 2));

console.log(`[step] total ws frames captured: ${wsCount}`);

const lines = await drainCapture(page);
console.log(`[step] total in-page captured lines: ${lines.length}`);

// Verdict line: makes it easy to scroll to the bottom and see what
// happened without re-reading the whole transcript. We rely on
// `Client is online` (logged by XmppClient.attachEventListeners on the
// 'online' event) as the most authoritative "actually working" signal -
// it fires after SASL, bind, and the initial presence round-trip have
// all succeeded. The `[InitTiming] initClient:wait_online` log is the
// other strong success signal and is always paired with a duration.
const sawClientOnline = lines.some((l) => /Client is online/.test(l));
const sawWaitOnline = lines.some((l) => /InitTiming\] initClient:wait_online \d+ms/.test(l));
const sawSaslSuccess = lines.some((l) => /<success xmlns='urn:ietf:params:xml:ns:xmpp-sasl'\/>/.test(l));
const sawSaslFailure = lines.some((l) => /<failure xmlns='urn:ietf:params:xml:ns:xmpp-sasl/.test(l));
const stillConnecting = lines.some((l) => /InitPolicy.*waiting provider client.*status=idle/.test(l));
console.log(`[verdict] online=${sawClientOnline} waitOnline=${sawWaitOnline} sasl_success=${sawSaslSuccess} sasl_failure=${sawSaslFailure} stillIdleSpinner=${stillConnecting} wsFrames=${wsCount}`);
if (sawClientOnline || sawWaitOnline) {
  console.log('[verdict] CHAT CONNECTED — XMPP reached online state');
} else if (sawSaslFailure) {
  console.log('[verdict] CHAT SASL FAILED — likely password mismatch between Mongo and ejabberd');
} else if (stillConnecting) {
  console.log('[verdict] CHAT STUCK ON IDLE — the c1d9469-style "providerBootstrapStatus stays idle" failure (initBeforeLoad regression)');
} else if (wsCount === 0) {
  console.log('[verdict] CHAT NEVER ATTEMPTED WS — wedged before XmppClient init (check chat-store / verbose logs above)');
} else {
  console.log('[verdict] CHAT TRIED WS BUT DID NOT REACH ONLINE — inspect ws frames above for stream errors');
}

await browser.close();
