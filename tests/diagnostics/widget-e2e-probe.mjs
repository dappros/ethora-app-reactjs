// End-to-end diagnostic probe for the AI Widget pipeline.
//
// Loads a minimal HTML host page that injects the widget bundle (the
// same `assistant.js` operators paste into their site), drives it as a
// visitor, and reports what actually lands on the wire and in the
// archive.
//
// Captures:
//   - HTTP requests (POST /v2/widget/sessions and the bundle fetch)
//   - WebSocket frames (SASL handshake, MUC join, groupchat sends, MAM acks)
//   - Console messages, including the widget's own debug logs
//   - Final state of the messages API for the room created by this run
//
// Use this when:
//   - Visitors say "messages don't go anywhere" / no double-tick
//   - Widget Conversations admin panel is empty even after operator tests
//   - You suspect the bundle is hardcoded to the wrong WS URL or fails
//     to read xmpp.wsUrl from the session response.
//
// Run:
//
//   QA_BASE=https://app.chat-qa.ethora.com \
//   QA_API=https://api.chat-qa.ethora.com \
//   WIDGET_URL=https://widget.chat-qa.ethora.com/assistant.js \
//   APP_ID=68b2cd91d58ec5578cfca55b \
//   TEST_EMAIL=test18491@test.ethora.com \
//   TEST_PASSWORD='TestPass123!' \
//   node tests/diagnostics/widget-e2e-probe.mjs

import { chromium } from 'playwright';
import { installConsoleCapture, drainCapture } from './lib/console-capture.mjs';
import { signupOrLogin } from './lib/auth.mjs';

const QA_BASE = process.env.QA_BASE || 'https://app.chat-qa.ethora.com';
const QA_API = process.env.QA_API || 'https://api.chat-qa.ethora.com';
const WIDGET_URL = process.env.WIDGET_URL || 'https://widget.chat-qa.ethora.com/assistant.js';
const APP_ID = process.env.APP_ID || '68b2cd91d58ec5578cfca55b';
const ADMIN_APP_ID = process.env.ADMIN_APP_ID || APP_ID;
const TEST_EMAIL = process.env.TEST_EMAIL || 'test18491@test.ethora.com';
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'TestPass123!';
const SCREENSHOT_PATH = process.env.SCREENSHOT_PATH || '/tmp/widget-e2e-probe.png';
const TEST_MESSAGE = process.env.TEST_MESSAGE || 'probe-' + Date.now();
const SETTLE_MS = Number(process.env.SETTLE_MS || 8000);
const REPLY_WAIT_MS = Number(process.env.REPLY_WAIT_MS || 12000);

// Tiny host page. We can't use `data:` URLs because they have null
// origin and localStorage is disabled — the widget reads/writes its
// visitor identity there. Instead we intercept a fake URL on the
// widget's own origin via page.route and serve this HTML from there.
const HOST_HTML = `
<!doctype html>
<html><head><meta charset="utf-8"><title>widget-e2e</title></head>
<body>
<h1>widget-e2e probe host</h1>
<script id="chat-content-assistant"
        src="${WIDGET_URL}"
        data-app-id="${APP_ID}"
        data-api-base="${QA_API}"></script>
</body></html>`;

const HOST_URL = new URL('/__widget-e2e-probe.html', WIDGET_URL).toString();

console.log(`[step] api=${QA_API} widget=${WIDGET_URL} appId=${APP_ID}`);

console.log('[step] login admin (for post-run history check)');
const auth = await signupOrLogin({
  apiBase: QA_API,
  appId: APP_ID,
  email: TEST_EMAIL,
  password: TEST_PASSWORD,
});
const adminToken = auth?.data?.token || auth?.token;
console.log(`[step] admin token len=${adminToken?.length || 0}`);

const browser = await chromium.launch({ headless: true, channel: 'chromium' });
const ctx = await browser.newContext({ ignoreHTTPSErrors: true });
await installConsoleCapture(ctx);
const page = await ctx.newPage();

const httpEvents = [];
const wsEvents = [];
let createdSession = null;

page.on('console', (m) => {
  console.log(`[console.${m.type()}] ${m.text()}`);
});
page.on('pageerror', (e) => console.log(`[pageerror] ${e.message}`));

page.on('request', (r) => {
  const u = r.url();
  if (/widget|assistant|\/v[12]\//.test(u)) {
    httpEvents.push({ method: r.method(), url: u });
    console.log(`[request] ${r.method()} ${u}`);
  }
});
page.on('response', async (r) => {
  const u = r.url();
  if (/\/v[12]\/widget\/sessions/.test(u)) {
    try {
      const body = await r.json();
      createdSession = body;
      console.log(`[response] ${r.status()} ${u}`);
      console.log(`[session.visitor] ${body.visitor?.xmppUsername} (jid=${body.visitor?.jid})`);
      console.log(`[session.room]    ${body.room?.name} chatId=${body.room?.chatId} jid=${body.room?.jid}`);
      console.log(`[session.bot]     ${body.bot?.xmppUsername}`);
      console.log(`[session.xmpp]    host=${body.xmpp?.host} service=${body.xmpp?.service} wsUrl=${body.xmpp?.wsUrl}`);
    } catch (e) {
      console.log(`[response] ${r.status()} ${u} (failed to parse: ${e.message})`);
    }
  } else if (/widget|assistant\.js/.test(u) && r.status() >= 400) {
    console.log(`[response] ${r.status()} ${u}`);
  }
});

let wsCount = 0;
page.on('websocket', (ws) => {
  console.log(`[ws-open] ${ws.url()}`);
  wsEvents.push({ type: 'open', url: ws.url() });
  ws.on('framesent', (data) => {
    wsCount++;
    const p = data.payload?.toString?.('utf-8') || String(data.payload);
    if (wsCount <= 60) console.log(`[ws-tx ${wsCount}] ${p.slice(0, 400)}`);
    wsEvents.push({ type: 'tx', payload: p });
  });
  ws.on('framereceived', (data) => {
    wsCount++;
    const p = data.payload?.toString?.('utf-8') || String(data.payload);
    if (wsCount <= 60) console.log(`[ws-rx ${wsCount}] ${p.slice(0, 400)}`);
    wsEvents.push({ type: 'rx', payload: p });
  });
  ws.on('close', () => console.log('[ws-close]'));
  ws.on('socketerror', (e) => console.log(`[ws-error] ${e}`));
});

// Intercept our synthetic host URL on the widget's own origin so the
// page has a normal http(s) origin and localStorage works.
await page.route(HOST_URL, (route) => {
  route.fulfill({
    status: 200,
    contentType: 'text/html; charset=utf-8',
    body: HOST_HTML,
  });
});

console.log(`[step] navigating to host page ${HOST_URL}`);
await page.goto(HOST_URL, { waitUntil: 'domcontentloaded' });

// Wait for the widget to mount.
console.log(`[step] waiting ${SETTLE_MS}ms for widget to bootstrap`);
await page.waitForTimeout(SETTLE_MS);

// Try to open the chat by clicking the widget toggle. The widget's
// public DOM uses #chat-widget; the toggle is typically a single button
// inside it. We click any clickable element within #chat-widget root —
// brittle but the widget bundle owns its own DOM contract so this is
// the most stable approximation.
const opened = await page.evaluate(() => {
  const root = document.getElementById('chat-widget');
  if (!root) return { ok: false, reason: 'no #chat-widget' };
  // Find a button-shaped element to click.
  const btn = root.querySelector('button, [role=button]') || root.firstElementChild;
  if (!btn) return { ok: false, reason: 'no clickable in #chat-widget' };
  (btn).click();
  return { ok: true, tag: btn.tagName, text: (btn.textContent || '').slice(0, 40) };
});
console.log(`[step] widget-open click: ${JSON.stringify(opened)}`);

await page.waitForTimeout(2000);

// Type a message and submit. The widget owns its DOM, but the chat
// input ends up nested several layers deep (under MUI Dialog / styled
// components / etc) so we search the entire document, not just under
// `#chat-widget`. The placeholder "Type message" is stable across
// versions; we use it as the primary selector.
const sent = await page.evaluate((msg) => {
  const candidates = [
    ...document.querySelectorAll('input[placeholder*="Type" i]'),
    ...document.querySelectorAll('textarea[placeholder*="Type" i]'),
    ...document.querySelectorAll('input[type="text"]'),
    ...document.querySelectorAll('textarea'),
  ];
  const input = candidates.find((el) => {
    const r = el.getBoundingClientRect();
    return r.width > 50 && r.height > 10 && !el.disabled && !el.readOnly;
  });
  if (!input) {
    return {
      ok: false,
      reason: 'no input found',
      seen: candidates.map((el) => ({
        tag: el.tagName,
        placeholder: el.getAttribute('placeholder'),
        rect: el.getBoundingClientRect(),
        disabled: el.disabled,
      })),
    };
  }
  // React-controlled inputs require the native setter to be called or
  // React's onChange won't fire. Standard pattern.
  const proto = Object.getPrototypeOf(input);
  const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
  if (setter) setter.call(input, msg);
  else input.value = msg;
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.focus();
  // Most chat inputs send on Enter.
  input.dispatchEvent(
    new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true, cancelable: true })
  );
  // Form-submit fallback.
  const form = input.closest('form');
  if (form) form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  // Send-button fallback. Search the input's ancestor chain for a
  // sibling button — most send icons are positioned next to the input.
  let p = input.parentElement;
  while (p) {
    const btn = p.querySelector('button, [role="button"], svg[role="button"]');
    if (btn) {
      btn.click();
      break;
    }
    p = p.parentElement;
  }
  return { ok: true, value: input.value, placeholder: input.getAttribute('placeholder') };
}, TEST_MESSAGE);
console.log(`[step] widget-send: ${JSON.stringify(sent)}`);

console.log(`[step] waiting ${REPLY_WAIT_MS}ms for bot reply / archive`);
await page.waitForTimeout(REPLY_WAIT_MS);

await page.screenshot({ path: SCREENSHOT_PATH, fullPage: true });
console.log(`[step] screenshot saved to ${SCREENSHOT_PATH}`);

const lines = await drainCapture(page);
console.log(`[step] captured ${lines.length} log lines, ${wsCount} ws frames, ${httpEvents.length} relevant http events`);

// Post-run: hit the messages API for the chatId we just created.
let messageApiResult = null;
if (createdSession?.room?.chatId && adminToken) {
  console.log(`[step] querying messages API for chatId=${createdSession.room.chatId}`);
  try {
    const resp = await fetch(
      `${QA_API}/v2/apps/${ADMIN_APP_ID}/chats/${createdSession.room.chatId}/messages?limit=50`,
      { headers: { 'Authorization': `Bearer ${adminToken}` } }
    );
    messageApiResult = await resp.json();
    console.log(`[messages-api] status=${resp.status} total=${messageApiResult?.total} mamUnavailable=${messageApiResult?.mamUnavailable} returned=${(messageApiResult?.results || []).length}`);
    for (const m of messageApiResult?.results || []) {
      console.log(`  msg from=${m.from} body=${JSON.stringify((m.body || '').slice(0, 80))}`);
    }
  } catch (e) {
    console.log(`[messages-api] ERROR: ${e.message}`);
  }
}

// Verdict.
const sawWsOpen = wsEvents.some((e) => e.type === 'open');
const sawSaslSuccess = wsEvents.some((e) => e.type === 'rx' && /<success xmlns=['"]urn:ietf:params:xml:ns:xmpp-sasl/.test(e.payload));
const sawSaslFailure = wsEvents.some((e) => e.type === 'rx' && /<failure xmlns=['"]urn:ietf:params:xml:ns:xmpp-sasl/.test(e.payload));
const sawMucPresence = wsEvents.some((e) => e.type === 'tx' && /<presence[^>]*to=['"][^'"]*conference\./.test(e.payload));
const sawGroupchatTx = wsEvents.some((e) => e.type === 'tx' && /<message[^>]*type=['"]groupchat/.test(e.payload));
const sawGroupchatRx = wsEvents.some((e) => e.type === 'rx' && /<message[^>]*type=['"]groupchat/.test(e.payload));
const archivedRows = (messageApiResult?.results || []).length;

console.log(`\n[verdict] sessionCreated=${Boolean(createdSession)} wsOpen=${sawWsOpen} saslSuccess=${sawSaslSuccess} saslFailure=${sawSaslFailure} mucPresence=${sawMucPresence} groupchatTx=${sawGroupchatTx} groupchatRx=${sawGroupchatRx} archivedRows=${archivedRows}`);

if (!createdSession) {
  console.log('[verdict] NO_SESSION — POST /v2/widget/sessions never landed; the bundle may not have loaded or the request was blocked.');
} else if (!sawWsOpen) {
  console.log('[verdict] NO_WS — session was minted but the widget never opened a WebSocket. Check console errors above (CORS, mixed content, hardcoded WS URL).');
} else if (sawSaslFailure) {
  console.log('[verdict] SASL_FAILED — visitor password mismatch between session response and what ejabberd expects (or the bundle is using a different auth path).');
} else if (!sawSaslSuccess) {
  console.log('[verdict] SASL_INCOMPLETE — WS opened but SASL never finished. Look for stream errors / version mismatch in the WS frames.');
} else if (!sawMucPresence) {
  console.log('[verdict] NO_MUC_JOIN — SASL succeeded but the widget never sent <presence/> to the conference room. Bundle bug.');
} else if (!sawGroupchatTx) {
  console.log('[verdict] NO_SEND — joined the room but did not send a groupchat message. Either input automation failed (check sent.value) or the widget is sending 1:1 chat instead.');
} else if (archivedRows === 0) {
  console.log('[verdict] SENT_BUT_NOT_ARCHIVED — message left the client (groupchat tx observed) but MAM has no rows. Inspect ejabberd mod_mam config: archive_on_inbox / muc_default / domain coverage. Confirm the room is on a domain mod_mam handles.');
} else {
  console.log('[verdict] ARCHIVED — full pipeline works. Message reached MAM and is readable via the admin endpoint.');
}

await browser.close();
