// Diagnostic probe for the App Switcher (Option A) end-to-end flow.
// Logs in, navigates to /app/chat (base app context), then uses the
// dropdown to switch to a child app, and captures everything that
// happens during the switch.
//
// What we're checking:
//   - Did the old XmppClient get disconnected? Look for a [WebSocket-close]
//     after the switch HTTP call.
//   - Did a fresh WebSocket open? Look for a NEW [ws-open] for the
//     gateway-user JID after switch.
//   - Did /v1/chats/my succeed (200) for the new context, or 401?
//   - Did mod_ethora reject any presence stanzas with "wrong app name"?
//   - Did the chat-component show the new app's rooms (or empty state
//     if the app is fresh)?
//
// Run:
//
//   QA_BASE=https://app.chat-qa.ethora.com \
//   QA_API=https://api.chat-qa.ethora.com \
//   APP_ID=646cc8dc96d4a4dc8f7b2f2d \
//   CHILD_APP_ID=69f8e086... \
//   TEST_EMAIL=...@test.ethora.com \
//   TEST_PASSWORD=... \
//   node tests/diagnostics/app-switcher-probe.mjs

import { chromium } from 'playwright';
import { installConsoleCapture, drainCapture } from './lib/console-capture.mjs';
import { enableChatVerboseLogging, snapshotChatStore } from './lib/fiber-walker.mjs';
import { signupOrLogin } from './lib/auth.mjs';

const QA_BASE = process.env.QA_BASE || 'https://app.chat-qa.ethora.com';
const QA_API = process.env.QA_API || 'https://api.chat-qa.ethora.com';
const APP_ID = process.env.APP_ID || '646cc8dc96d4a4dc8f7b2f2d';
const CHILD_APP_ID = process.env.CHILD_APP_ID;
const TEST_EMAIL = process.env.TEST_EMAIL || `test${Date.now()}@test.ethora.com`;
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'TestPass123!';
const SCREENSHOT_PATH = process.env.SCREENSHOT_PATH || '/tmp/app-switcher-probe.png';

if (!CHILD_APP_ID) {
  console.error('CHILD_APP_ID required - create a child app first via POST /v1/apps and pass its _id.');
  process.exit(1);
}

console.log(`[step] target=${QA_BASE} email=${TEST_EMAIL} child=${CHILD_APP_ID}`);
console.log('[step] ensuring account exists');
await signupOrLogin({ apiBase: QA_API, appId: APP_ID, email: TEST_EMAIL, password: TEST_PASSWORD });

const browser = await chromium.launch({ headless: true, channel: 'chromium' });
const ctx = await browser.newContext({ ignoreHTTPSErrors: true });
await installConsoleCapture(ctx);
const page = await ctx.newPage();

const events = []; // ordered timeline of "interesting" events

page.on('console', (msg) => {
  const text = msg.text();
  if (/InitPolicy|InitTiming|XMPP|presence_failed|Connection timeout|chats\/my|ethora-xmpp|Refresh token|wrong app/.test(text)) {
    events.push({ kind: `console.${msg.type()}`, t: Date.now(), text: text.slice(0, 280) });
  }
});
page.on('pageerror', (err) => events.push({ kind: 'pageerror', t: Date.now(), text: err.message.slice(0, 280) }));
page.on('request', (req) => {
  const u = req.url();
  if (u.includes('/owner-session') || u.includes('/chats/my') || u.includes('/v1/apps') || u.includes('/v1/users/me')) {
    events.push({ kind: 'request', t: Date.now(), text: `${req.method()} ${u}` });
  }
});
page.on('response', async (resp) => {
  const u = resp.url();
  if (u.includes('/owner-session') || u.includes('/chats/my') || u.includes('/v1/apps')) {
    let body = '';
    try {
      const ct = resp.headers()['content-type'] || '';
      if (resp.status() >= 400 || ct.includes('json')) {
        const t = await resp.text();
        body = t.length > 200 ? t.slice(0, 200) + '...' : t;
      }
    } catch {}
    events.push({ kind: 'response', t: Date.now(), text: `${resp.status()} ${resp.request().method()} ${u} ${body}`.slice(0, 400) });
  }
});

let wsCount = 0;
let wsOpens = 0;
let wsCloses = 0;
page.on('websocket', (ws) => {
  if (!ws.url().includes('/ws')) return;  // ignore centrifuge
  wsOpens++;
  events.push({ kind: 'ws-open', t: Date.now(), text: ws.url() });
  ws.on('framesent', (data) => {
    wsCount++;
    const p = data.payload?.toString?.('utf-8') || String(data.payload);
    if (/auth|bind|<presence|<message|wrong app/.test(p) && wsCount <= 50) {
      events.push({ kind: 'ws-tx', t: Date.now(), text: p.slice(0, 200) });
    }
  });
  ws.on('framereceived', (data) => {
    wsCount++;
    const p = data.payload?.toString?.('utf-8') || String(data.payload);
    if (/<success|<failure|<bind|wrong app|forbidden|<error/.test(p) && wsCount <= 50) {
      events.push({ kind: 'ws-rx', t: Date.now(), text: p.slice(0, 250) });
    }
  });
  ws.on('close', () => {
    wsCloses++;
    events.push({ kind: 'ws-close', t: Date.now(), text: ws.url() });
  });
});

console.log('[step] login + initial /app/chat');
await page.goto(`${QA_BASE}/login`, { waitUntil: 'domcontentloaded' });
await page.waitForLoadState('networkidle').catch(() => {});
await page.fill('input[name="email"]', TEST_EMAIL);
await page.fill('input[name="password"]', TEST_PASSWORD);
await page.click('button[type="submit"]');
await page.waitForURL(/\/app\//, { timeout: 15000 }).catch(() => {});

// Visit the admin/apps page first so the frontend store loads `apps[]`.
// The Chat page's dropdown is gated on having owned apps in the store.
await page.goto(`${QA_BASE}/app/admin/apps`, { waitUntil: 'domcontentloaded' });
await page.waitForLoadState('networkidle').catch(() => {});
await page.waitForTimeout(1500);

await page.goto(`${QA_BASE}/app/chat`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(2000);
await enableChatVerboseLogging(page);
await page.waitForTimeout(8000);

const baseSnap = await snapshotChatStore(page);
console.log('[step] BASE-app snapshot:');
console.log(JSON.stringify({
  user_xmppUsername: baseSnap.user?.xmppUsername,
  user_token: baseSnap.user?.token,
  ws_opens_so_far: wsOpens,
  ws_closes_so_far: wsCloses,
}, null, 2));

const switchT = Date.now();
console.log(`[step] === SWITCHING APP at t=${switchT} ===`);

// Two routes into actionSwitchChatApp:
//   1. The dropdown on /app/chat (only renders if apps[] is loaded in
//      the zustand store - usually via AdminApps page).
//   2. The "Chats" tab on /app/admin/apps/:appId (eagerly fires the
//      same actionSwitchChatApp on click).
// Route 2 is more reliable for a fresh session because it doesn't
// depend on apps[] being prefilled. We use that.
const adminAppChatsURL = `${QA_BASE}/app/admin/apps/${CHILD_APP_ID}/users`;
console.log(`[step] navigating to ${adminAppChatsURL} so the AdminApp Chats tab is rendered`);
await page.goto(adminAppChatsURL, { waitUntil: 'domcontentloaded' });
await page.waitForLoadState('networkidle').catch(() => {});
await page.waitForTimeout(1500);

const chatsLink = page.locator('a:has-text("Chats")').last();
const hasSelect = await chatsLink.count();
if (!hasSelect) {
  // Debug: dump the store and DOM to see why
  const debug = await page.evaluate(() => {
    const elts = Array.from(document.querySelectorAll('*'));
    // Walk fibers to find the zustand-backed `useAppStore` state.
    // It's accessed via a hook, but the hook stashes the store on
    // a global if useDevtools is on. Simpler: walk fibers looking
    // for a memoizedState chain that contains apps[] and currentApp.
    const start = elts.find(e => Object.keys(e).some(k => k.startsWith('__reactFiber')));
    let zustandState = null;
    if (start) {
      const fiberKey = Object.keys(start).find(k => k.startsWith('__reactFiber'));
      let f = start[fiberKey];
      while (f && f.return) f = f.return;
      const stack = [f];
      while (stack.length) {
        const fb = stack.pop();
        if (!fb) continue;
        // Hook state is a linked list on memoizedState. zustand selectors return scalar values.
        // We can't reverse-engineer the store easily; just check a few common globals.
        if (fb.child) stack.push(fb.child);
        if (fb.sibling) stack.push(fb.sibling);
      }
    }
    return {
      bodyHTMLLen: document.body.innerHTML.length,
      bodyHasChats: /Chats/.test(document.body.innerText.slice(0, 4000)),
      bodyHasAppName: /Probe Test App/.test(document.body.innerText.slice(0, 8000)),
      bodySnippet: document.body.innerText.slice(0, 1000),
      selects: elts.filter(e => e.tagName === 'SELECT').length,
      lsKeys: Object.keys(localStorage),
      currentURL: location.href,
    };
  });
  console.log('[debug] no dropdown:', JSON.stringify(debug, null, 2));
  console.log('[verdict] CHATS TAB NOT FOUND on AdminApp page');
  await browser.close();
  process.exit(2);
}
await chatsLink.click();
console.log('[step] AdminApp Chats tab clicked; waiting 15s for chat to come up in child app');
await page.waitForTimeout(15000);

console.log('[step] taking screenshot');
await page.screenshot({ path: SCREENSHOT_PATH, fullPage: true });
console.log(`[step] screenshot saved to ${SCREENSHOT_PATH}`);

const childSnap = await snapshotChatStore(page);
console.log('[step] CHILD-app snapshot:');
console.log(JSON.stringify({
  user_xmppUsername: childSnap.user?.xmppUsername,
  user_token: childSnap.user?.token,
  config_userLogin: childSnap.config?.userLogin,
  config_customAppToken: childSnap.config?.customAppToken,
}, null, 2));

console.log(`[step] events around the switch (last 40):`);
for (const e of events.slice(-40)) {
  const dt = e.t - switchT;
  const sign = dt >= 0 ? '+' : '';
  console.log(`  [${sign}${dt}ms] ${e.kind}: ${e.text}`);
}

const lines = await drainCapture(page);
const sawWrongApp = lines.some((l) => /wrong app/.test(l)) || events.some((e) => /wrong app/.test(e.text));
const sawPresenceTimeout = lines.some((l) => /presence_timeout/.test(l));
const sawWsClose = wsCloses >= 1;
const sawSecondWsOpen = wsOpens >= 2;
const sawChatsMy401 = events.some((e) => e.kind === 'response' && /\/chats\/my/.test(e.text) && /401/.test(e.text));
const sawChatsMy200 = events.some((e) => e.kind === 'response' && /\/chats\/my/.test(e.text) && /^200/.test(e.text));
const sawOwnerSession = events.some((e) => e.kind === 'response' && /owner-session/.test(e.text) && /^200/.test(e.text));
const childUsername = childSnap.user?.xmppUsername || '';
const expectedPrefix = `${CHILD_APP_ID}_`;
const userJidMatchesChildApp = childUsername.startsWith(expectedPrefix);

console.log('');
console.log('[verdict-detail]', JSON.stringify({
  ws_opens: wsOpens,
  ws_closes: wsCloses,
  ws_total_frames: wsCount,
  sawWsClose,
  sawSecondWsOpen,
  sawWrongApp,
  sawPresenceTimeout,
  sawChatsMy401,
  sawChatsMy200,
  sawOwnerSession,
  userJidMatchesChildApp,
  childUsername,
}, null, 2));

if (
  sawOwnerSession &&
  userJidMatchesChildApp &&
  sawWsClose &&
  sawSecondWsOpen &&
  !sawWrongApp &&
  !sawChatsMy401
) {
  console.log('[verdict] APP SWITCH CLEAN — old client closed, new gateway connected, no auth failures');
} else if (!sawOwnerSession) {
  console.log('[verdict] OWNER-SESSION HTTP FAILED — switching never reached the new app context');
} else if (!userJidMatchesChildApp) {
  console.log(`[verdict] STORE NOT UPDATED — chat-component user is "${childUsername}", expected "${expectedPrefix}*"`);
} else if (!sawWsClose || !sawSecondWsOpen) {
  console.log('[verdict] OLD XMPP CLIENT REUSED — the chat-component did not disconnect+reconnect for the new gateway user');
} else if (sawWrongApp) {
  console.log('[verdict] mod_ethora REJECTED — JID prefix did not match a room JID prefix; old room cache leaking through');
} else if (sawChatsMy401) {
  console.log('[verdict] /chats/my 401 — chat-component HTTP layer using stale token');
}

await browser.close();
