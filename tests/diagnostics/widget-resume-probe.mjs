// Widget lazy-session + resume probe.
//
// Drives the embeddable AI widget through two page loads in ONE browser
// context (so localStorage survives, as it does for a real visitor):
//
//   load 1: no session call may happen before the launcher is touched; click
//           it, send a message, wait for the agent's reply.
//   load 2: reload the host page, click the launcher again; the session call
//           must come back with `room.resumed: true` and the SAME room, and
//           the earlier message must reappear from history (MAM).
//
// Env (defaults target our QA):
//   QA_API, WIDGET_URL, APP_ID, TEST_MESSAGE, REPLY_WAIT_MS (default 30000),
//   SETTLE_MS (default 6000; how long the widget gets to bootstrap before we
//   assert that no session call happened).
//
//   node tests/diagnostics/widget-resume-probe.mjs

import { chromium } from 'playwright';
import { enableChatVerboseLogging } from './lib/fiber-walker.mjs';

const QA_API = process.env.QA_API || 'https://api.chat-qa.ethora.com';
const WIDGET_URL = process.env.WIDGET_URL || 'https://widget.chat-qa.ethora.com/assistant.js';
const APP_ID = process.env.APP_ID || '68b2cd91d58ec5578cfca55b';
const TEST_MESSAGE = process.env.TEST_MESSAGE || 'resume-probe-' + Date.now();
const SETTLE_MS = Number(process.env.SETTLE_MS || 6000);
const REPLY_WAIT_MS = Number(process.env.REPLY_WAIT_MS || 30000);
// Pause between the chat input appearing and typing; 0 reproduces a visitor who
// types the moment the panel is ready.
const TYPE_DELAY_MS = Number(process.env.TYPE_DELAY_MS || 0);

const HOST_HTML = `<!doctype html><html><head><meta charset="utf-8"><title>widget-resume</title></head>
<body><h1>widget-resume probe host</h1>
<script id="chat-content-assistant" src="${WIDGET_URL}" data-app-id="${APP_ID}" data-api-base="${QA_API}"></script>
</body></html>`;
const HOST_URL = new URL('/__widget-resume-probe.html', WIDGET_URL).toString();

const browser = await chromium.launch({ headless: true, channel: 'chromium' });
const ctx = await browser.newContext({ ignoreHTTPSErrors: true });
const page = await ctx.newPage();
// TRACE_SENDS=1: log a stack trace for every outgoing groupchat <message> with a
// <body>, from inside the page, so a duplicate send shows its two call paths.
if (process.env.TRACE_SENDS) {
  await page.addInitScript(() => {
    Error.stackTraceLimit = 60;
    const orig = WebSocket.prototype.send;
    WebSocket.prototype.send = function (d) {
      try {
        if (typeof d === 'string' && d.includes('type="groupchat"') && d.includes('<body>')) {
          const st = new Error().stack.split('\n').slice(1, 60).map((l) => l.trim()).join(' | ');
          console.log('[WS-SEND-TRACE] ' + (d.match(/\sid="([^"]+)"/) || [])[1] + ' :: ' + st);
        }
      } catch (_) {}
      return orig.call(this, d);
    };
  });
}
await page.route(HOST_URL, (route) => route.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: HOST_HTML }));

// Per-load bookkeeping, reset by startLoad().
let sessions = [];
let wsRx = [];
let t0 = Date.now();
const ms = () => Date.now() - t0;

page.on('request', (r) => {
  if (/\/v2\/widget\/sessions/.test(r.url())) sessions.push({ at: ms(), status: null, body: null });
});
page.on('response', async (r) => {
  if (!/\/v2\/widget\/sessions/.test(r.url())) return;
  const s = sessions[sessions.length - 1] || (sessions.push({ at: ms() }), sessions[sessions.length - 1]);
  s.status = r.status();
  try {
    s.body = await r.json();
  } catch {
    s.body = null;
  }
  console.log(`[sessions] ${r.status()} at +${s.at}ms room=${s.body?.room?.name} resumed=${s.body?.room?.resumed} visitor=${s.body?.visitor?.xmppUsername}`);
});
let wsOpens = 0;
let wsTxBodies = [];
page.on('websocket', (ws) => {
  wsOpens += 1;
  ws.on('framereceived', (d) => wsRx.push(d.payload?.toString?.('utf-8') || String(d.payload)));
  ws.on('framesent', (d) => {
    const p = d.payload?.toString?.('utf-8') || String(d.payload);
    if (/<message[^>]*type=['"]groupchat/.test(p) && /<body>/.test(p)) wsTxBodies.push({ at: ms(), id: (p.match(/\sid=['"]([^'"]+)['"]/) || [])[1], len: p.length, head: p.slice(0, 160) });
  });
});
page.on('pageerror', (e) => console.log(`[pageerror] ${e.message}`));
page.on('console', (m) => { const t = m.text(); if (t.startsWith('[WS-SEND-TRACE]')) console.log(t); });
// Send-path diagnostics from chat-component (visible once verbose logging is on).
const sendLog = [];
page.on('console', (m) => {
  const t = m.text();
  if (/\[DIAG\]|send_wait_ms|SendRetry|send_click_to_echo|room_presence|ensureRoomPresence|active_room_retry|not_online|drainHeap|processQueue|\[Send\]|\[XMPP\]/.test(t)) sendLog.push(`+${ms()}ms ${t.slice(0, 220)}`);
});

async function startLoad(label) {
  sessions = [];
  wsRx = [];
  t0 = Date.now();
  console.log(`\n[step] ${label}: load host page`);
  await page.goto(HOST_URL, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(SETTLE_MS);
  console.log(`[step] ${label}: after ${SETTLE_MS}ms idle, session calls so far: ${sessions.length}`);
}

async function openPanel(label) {
  const launcher = page.locator('#chat-widget button[aria-label^="Open"]').first();
  await launcher.waitFor({ state: 'visible', timeout: 5000 });
  const clickAt = ms();
  await launcher.click();
  console.log(`[step] ${label}: launcher clicked at +${clickAt}ms`);
  // Wait for the chat input (the engine mounts once the session exists).
  const input = page.locator('#chat-widget textarea, #chat-widget input[type="text"], #chat-widget input:not([type])').first();
  await input.waitFor({ state: 'visible', timeout: 20000 });
  console.log(`[step] ${label}: chat input visible at +${ms()}ms (${ms() - clickAt}ms after click)`);
  return input;
}

// ---- load 1: fresh visitor -------------------------------------------------
await startLoad('load1');
const idleCallsLoad1 = sessions.length;
const input1 = await openPanel('load1');
try {
  console.log(`[step] load1: verbose chat logging: ${await enableChatVerboseLogging(page)}`);
} catch (e) {
  console.log(`[step] verbose logging not enabled: ${e.message}`);
}
if (TYPE_DELAY_MS) await page.waitForTimeout(TYPE_DELAY_MS);
wsTxBodies = [];
await input1.click();
await input1.fill(TEST_MESSAGE);
await input1.press('Enter');
console.log(`[step] load1: sent "${TEST_MESSAGE}" at +${ms()}ms`);

const replyDeadline = Date.now() + REPLY_WAIT_MS;
let botReplyAt = null;
const sentAt = ms();
while (Date.now() < replyDeadline) {
  // A groupchat message from someone other than the visitor, not our own echo
  // and not a join notice.
  // A groupchat body from an agent occupant (nickname ends in -bot) that is
  // not a join notice. Keyed on the sender, not the text: agents often quote
  // the question back, which a text-exclusion check mistook for an echo.
  const hit = wsRx.find((p) =>
    /<message[^>]*type=['"]groupchat/.test(p) && /<body>/.test(p) &&
    /from=['"][^'"]+\/[^'"]*-bot['"]/.test(p) && !/has joined the chat/.test(p));
  if (hit) {
    botReplyAt = ms();
    break;
  }
  await page.waitForTimeout(500);
}
console.log(`[step] load1: bot reply ${botReplyAt ? `seen at +${botReplyAt}ms (${botReplyAt - sentAt}ms after send)` : 'NOT seen within ' + REPLY_WAIT_MS + 'ms'}`);
console.log(`[step] load1: websockets opened=${wsOpens}; outgoing groupchat bodies=${wsTxBodies.length} ${JSON.stringify(wsTxBodies)}`);
for (const l of sendLog) console.log(`[chat-log] ${l}`);
const load1 = { idleCalls: idleCallsLoad1, session: sessions[0]?.body || null, botReplyAt };

// ---- load 2: returning visitor -------------------------------------------
await startLoad('load2');
const idleCallsLoad2 = sessions.length;
await openPanel('load2');
// Give MAM a moment to deliver history.
await page.waitForTimeout(4000);
const historyHasMessage = wsRx.some((p) => p.includes(TEST_MESSAGE));
const load2 = { idleCalls: idleCallsLoad2, session: sessions[0]?.body || null, historyHasMessage };

await browser.close();

const sameRoom = !!load1.session?.room?.name && load1.session.room.name === load2.session?.room?.name;
const sameVisitor = !!load1.session?.visitor?.xmppUsername && load1.session.visitor.xmppUsername === load2.session?.visitor?.xmppUsername;
console.log(`\n[verdict] lazy=${load1.idleCalls === 0 && load2.idleCalls === 0} (idle session calls: ${load1.idleCalls}/${load2.idleCalls})`);
console.log(`[verdict] botReplied=${!!load1.botReplyAt}`);
console.log(`[verdict] resumedFlag=${load2.session?.room?.resumed === true} sameVisitor=${sameVisitor} sameRoom=${sameRoom} historyRestored=${load2.historyHasMessage}`);
const ok = load1.idleCalls === 0 && load2.idleCalls === 0 && !!load1.botReplyAt && load2.session?.room?.resumed === true && sameVisitor && sameRoom && load2.historyHasMessage;
console.log(`[verdict] ${ok ? 'PASS' : 'FAIL'}`);
process.exit(ok ? 0 : 1);
