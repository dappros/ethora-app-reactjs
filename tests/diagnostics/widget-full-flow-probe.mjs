// End-to-end probe: provision app -> create agent -> wire as default ->
// drive widget UI -> verify visitor message AND bot reply land in MAM.
//
// Distinct from `widget-e2e-probe.mjs`, which assumes a pre-configured
// app and bot; this probe builds the configuration from scratch each
// run, so it's the first thing to run when validating that a new
// install or a release branch works end-to-end.
//
// The agent is created with `responseMode: 'always'` and a one-line
// "reply with PONG" system prompt so the bot's reaction is
// deterministic and easy to assert.
//
// Run:
//
//   QA_BASE=https://app.chat-qa.ethora.com \
//   QA_API=https://api.chat-qa.ethora.com \
//   WIDGET_URL=https://widget.chat-qa.ethora.com/assistant.js \
//   APP_ID=646cc8dc96d4a4dc8f7b2f2d \
//   TEST_EMAIL=test18491@test.ethora.com \
//   TEST_PASSWORD='TestPass123!' \
//   node tests/diagnostics/widget-full-flow-probe.mjs

import { chromium } from 'playwright';
import { installConsoleCapture, drainCapture } from './lib/console-capture.mjs';
import { signupOrLogin } from './lib/auth.mjs';

const QA_API = process.env.QA_API || 'https://api.chat-qa.ethora.com';
const WIDGET_URL = process.env.WIDGET_URL || 'https://widget.chat-qa.ethora.com/assistant.js';
const APP_ID = process.env.APP_ID || '646cc8dc96d4a4dc8f7b2f2d';
const TEST_EMAIL = process.env.TEST_EMAIL || 'test18491@test.ethora.com';
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'TestPass123!';
const SCREENSHOT_PATH = process.env.SCREENSHOT_PATH || '/tmp/widget-full-flow-probe.png';
const TEST_MESSAGE = process.env.TEST_MESSAGE || 'ping-' + Date.now();
const SETTLE_MS = Number(process.env.SETTLE_MS || 10000);
const REPLY_WAIT_MS = Number(process.env.REPLY_WAIT_MS || 30000);
const SKIP_CLEANUP = process.env.SKIP_CLEANUP === '1';

console.log(`[step] target api=${QA_API} widget=${WIDGET_URL}`);

console.log('[step] login admin');
const auth = await signupOrLogin({
  apiBase: QA_API,
  appId: APP_ID,
  email: TEST_EMAIL,
  password: TEST_PASSWORD,
});
const token = auth?.data?.token || auth?.token;
if (!token) {
  console.error('[fatal] no token from login response');
  process.exit(1);
}

async function api(method, path, body, opts = {}) {
  const res = await fetch(`${QA_API}${path}`, {
    method,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(opts.headers || {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let parsed;
  try { parsed = JSON.parse(text); } catch { parsed = text; }
  if (!res.ok) {
    throw new Error(`${method} ${path} -> ${res.status}: ${text.slice(0, 400)}`);
  }
  return parsed;
}

// ---------- Step 1: provision app ----------
const stamp = Date.now().toString(36);
const appName = `Probe Full Flow ${stamp}`;
console.log(`[step] POST /v1/apps  (displayName="${appName}")`);
const createRes = await api('POST', '/v1/apps', {
  displayName: appName,
  // domainName auto-generated when omitted
  defaultAccessProfileOpen: true,
  defaultAccessAssetsOpen: true,
  usersCanFree: true,
  primaryColor: '#1976d2',
  coinSymbol: 'PRB',
  coinName: 'ProbeCoin',
});
const newApp = createRes.app || createRes.result || createRes;
const newAppId = newApp._id;
const widgetChatId = newApp.aiBot?.chatId;
const aiBotUserId = newApp.aiBot?.userId;
console.log(`[step] new app _id=${newAppId} aiBot.userId=${aiBotUserId} aiBot.chatId=${widgetChatId}`);
if (!widgetChatId || !aiBotUserId) {
  console.error('[fatal] freshly created app is missing aiBot.userId or aiBot.chatId — cannot wire agent');
  process.exit(1);
}

// ---------- Step 2: create agent ----------
console.log('[step] POST /v2/agents (responseMode=always, deterministic prompt)');
const agentRes = await api('POST', '/v2/agents', {
  displayName: `Probe Agent ${stamp}`,
  prompt:
    'You are a probe assistant. For ANY incoming message, reply with the single word "PONG" and nothing else. No punctuation, no greeting, no explanation.',
  responseMode: 'always',
  responseProbability: 1,
  cooldownSec: 0,
  isRAG: false,
  visibility: 'private',
  ownerAppId: newAppId,
});
const agent = agentRes.agent || agentRes.respData?.agent || agentRes;
const agentId = agent.id || agent._id;
console.log(`[step] new agent id=${agentId}`);

// ---------- Step 3: invite agent to widget chat (creates BotInstance) ----------
console.log(`[step] POST /v2/agents/${agentId}/invite-to-chat (appId=${newAppId} chatId=${widgetChatId})`);
const inviteRes = await api('POST', `/v2/agents/${agentId}/invite-to-chat`, {
  appId: newAppId,
  chatId: widgetChatId,
});
const botInstance = inviteRes.botInstance || inviteRes.respData?.botInstance;
const botInstanceId = botInstance?.id || botInstance?._id;
console.log(`[step] botInstance id=${botInstanceId} xmppUsername=${botInstance?.xmppUsername}`);

// ---------- Step 4: set default + bot status on ----------
console.log(`[step] PUT /v1/apps/${newAppId}  (defaultBotInstanceId, botStatus=on)`);
await api('PUT', `/v1/apps/${newAppId}`, {
  defaultBotInstanceId: botInstanceId,
  botStatus: 'on',
});

// Confirm the wiring stuck.
const reread = await api('GET', `/v1/apps/${newAppId}`);
const rereadApp = reread.result || reread;
console.log(
  `[verify] after wiring: aiBot.status=${rereadApp.aiBot?.status} defaultBotInstanceId=${rereadApp.defaultBotInstanceId}`
);

// ---------- Step 5: drive widget UI ----------
console.log('[step] launching headless chromium');
const browser = await chromium.launch({ headless: true, channel: 'chromium' });
const ctx = await browser.newContext({ ignoreHTTPSErrors: true });
await installConsoleCapture(ctx);
const page = await ctx.newPage();

const wsEvents = [];
let createdSession = null;
let visitorJid = '';

page.on('console', (m) => {
  const t = m.type();
  if (t === 'error' || t === 'warning' || t === 'log') {
    const txt = m.text();
    // Filter the noisy React stroke-width / customStyle warnings —
    // they are from the bundled chat-component and not relevant here.
    if (
      /Invalid DOM property|customStyle|non-boolean attribute|redux-persist localStorage|Selector unknown/i.test(txt)
    ) return;
    console.log(`[console.${t}] ${txt.slice(0, 250)}`);
  }
});
page.on('pageerror', (e) => console.log(`[pageerror] ${e.message}`));

page.on('response', async (r) => {
  if (/\/v[12]\/widget\/sessions/.test(r.url())) {
    try {
      createdSession = await r.json();
      visitorJid = createdSession.visitor?.jid || createdSession.visitor?.xmppUsername || '';
      console.log(
        `[session] visitor=${createdSession.visitor?.xmppUsername} room=${createdSession.room?.jid}`
      );
    } catch {}
  }
});

page.on('websocket', (ws) => {
  console.log(`[ws-open] ${ws.url()}`);
  ws.on('framesent', (data) => {
    const p = data.payload?.toString?.('utf-8') || String(data.payload);
    wsEvents.push({ type: 'tx', payload: p });
  });
  ws.on('framereceived', (data) => {
    const p = data.payload?.toString?.('utf-8') || String(data.payload);
    wsEvents.push({ type: 'rx', payload: p });
  });
});

// Synthetic host page on the widget origin so localStorage works.
const HOST_HTML = `<!doctype html><html><head><meta charset="utf-8"></head>
<body><h1>full-flow-probe</h1>
<script id="chat-content-assistant" src="${WIDGET_URL}"
        data-app-id="${newAppId}" data-api-base="${QA_API}"></script>
</body></html>`;
const HOST_URL = new URL('/__widget-full-flow-probe.html', WIDGET_URL).toString();
await page.route(HOST_URL, (route) =>
  route.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: HOST_HTML })
);

console.log(`[step] navigating to host page`);
await page.goto(HOST_URL, { waitUntil: 'domcontentloaded' });

console.log(`[step] waiting ${SETTLE_MS}ms for widget to bootstrap`);
await page.waitForTimeout(SETTLE_MS);

const opened = await page.evaluate(() => {
  const root = document.getElementById('chat-widget');
  if (!root) return { ok: false, reason: 'no #chat-widget' };
  const btn = root.querySelector('button, [role=button]') || root.firstElementChild;
  if (!btn) return { ok: false };
  btn.click();
  return { ok: true };
});
console.log(`[step] widget-open: ${JSON.stringify(opened)}`);

await page.waitForTimeout(2000);

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
  if (!input) return { ok: false, reason: 'no input found' };
  const proto = Object.getPrototypeOf(input);
  const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
  if (setter) setter.call(input, msg); else input.value = msg;
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.focus();
  // Single Enter — don't ALSO click a send-button fallback. Earlier
  // versions of this probe did both, which produced two stanzas on the
  // wire and two bubbles in the UI. Looks identical to the dedupe bug
  // so we'd hide it from ourselves. If Enter doesn't fire (e.g. the
  // widget changes its UX to require button clicks), we'll see
  // "no groupchat tx" in the verdict and revisit.
  input.dispatchEvent(
    new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true, cancelable: true })
  );
  return { ok: true, value: input.value };
}, TEST_MESSAGE);
console.log(`[step] widget-send: ${JSON.stringify(sent)}`);

console.log(`[step] waiting up to ${REPLY_WAIT_MS}ms for bot reply...`);
const startWait = Date.now();
let sawBotReply = false;
while (Date.now() - startWait < REPLY_WAIT_MS) {
  // Look for an inbound groupchat message NOT sent by us. Bot's nick
  // contains '-bot' (BotInstance xmppUsername convention), or simply
  // any incoming groupchat that isn't our own visitor JID.
  const found = wsEvents.some((e) => {
    if (e.type !== 'rx') return false;
    if (!/<message[^>]*type=['"]groupchat['"]/.test(e.payload)) return false;
    if (!/<body>/i.test(e.payload)) return false;
    // Self-reflected stanzas have from=...conference.../<our-localpart>
    const fromMatch = e.payload.match(/from=['"][^'"]*\/([^'"]+)['"]/);
    const senderNick = fromMatch?.[1] || '';
    if (visitorJid && senderNick && visitorJid.includes(senderNick)) return false;
    return true;
  });
  if (found) { sawBotReply = true; break; }
  await page.waitForTimeout(1000);
}

await page.screenshot({ path: SCREENSHOT_PATH, fullPage: true });
console.log(`[step] screenshot saved to ${SCREENSHOT_PATH}`);

const txGroupchat = wsEvents.filter((e) => e.type === 'tx' && /<message[^>]*type=['"]groupchat/.test(e.payload)).length;
const rxGroupchat = wsEvents.filter((e) => e.type === 'rx' && /<message[^>]*type=['"]groupchat/.test(e.payload) && /<body>/i.test(e.payload)).length;

// Distinct senders observed in groupchat rx (excluding the visitor's own self-reflect).
const sendersSeen = new Set();
for (const e of wsEvents) {
  if (e.type !== 'rx') continue;
  if (!/<message[^>]*type=['"]groupchat['"]/.test(e.payload)) continue;
  const m = e.payload.match(/from=['"][^'"]*\/([^'"]+)['"]/);
  if (m) sendersSeen.add(m[1]);
}

// ---------- Step 6: verify in MAM via admin endpoint ----------
let mamRows = [];
let mamUnavailable = false;
try {
  const r = await api('GET', `/v2/apps/${newAppId}/chats/${createdSession.room.chatId}/messages?limit=50`);
  mamRows = r.results || [];
  mamUnavailable = Boolean(r.mamUnavailable);
  console.log(`[mam] total=${r.total} returned=${mamRows.length} mamUnavailable=${mamUnavailable}`);
  for (const m of mamRows) {
    console.log(`  from=${m.from} body=${JSON.stringify((m.body || '').slice(0, 80))}`);
  }
} catch (e) {
  console.log(`[mam] ERROR: ${e.message}`);
}

const mamHasVisitor = mamRows.some((m) => m.body?.includes(TEST_MESSAGE));
const mamHasBot = mamRows.some((m) => /pong/i.test(m.body || ''));

console.log(
  `\n[summary] tx_groupchat=${txGroupchat} rx_groupchat_with_body=${rxGroupchat} sawBotReplyOnWS=${sawBotReply} sendersSeen=[${[...sendersSeen].join(', ')}] mam_visitor=${mamHasVisitor} mam_bot=${mamHasBot}`
);

if (txGroupchat === 0) {
  console.log('[verdict] WIDGET_DID_NOT_SEND — visitor groupchat never left the client. Re-check widget input automation or bundle wiring.');
} else if (!mamHasVisitor) {
  console.log('[verdict] VISITOR_NOT_ARCHIVED — message left the client but no MAM row. Check mod_mam config.');
} else if (sawBotReply || mamHasBot) {
  console.log('[verdict] FULL_FLOW_OK — agent created, wired as defaultBotInstance, widget visitor sent message, bot replied. Both sides archived.');
} else {
  console.log('[verdict] BOT_DID_NOT_REPLY — visitor message archived but no bot reply observed within the wait window. Likely causes: ai-service did not auto-join the visitor\'s persistent room, the BotInstance is bound to aiBot.chatId only (legacy room) and never sees widget rooms, or LLM call timed out. Inspect ai-service / push-worker logs and /v2/agents/:id/bot-instances/:botInstanceId/diag.');
}

await browser.close();

// ---------- Cleanup ----------
if (!SKIP_CLEANUP) {
  console.log(`\n[step] cleanup: turning off bot, deleting agent`);
  try {
    await api('PUT', `/v1/apps/${newAppId}`, { botStatus: 'off', defaultBotInstanceId: '' });
  } catch (e) {
    console.log(`[cleanup] disable failed: ${e.message}`);
  }
  try {
    await api('DELETE', `/v2/agents/${agentId}`);
  } catch (e) {
    console.log(`[cleanup] agent delete failed: ${e.message}`);
  }
  // We don't delete the app — there is no public delete endpoint and
  // the leftovers don't interfere with future runs (each run mints its
  // own fresh appId). Set SKIP_CLEANUP=1 to keep the agent for inspection.
  console.log(`[cleanup] done. Leftover app: ${newAppId}`);
} else {
  console.log(`\n[step] SKIP_CLEANUP=1 — leaving agent ${agentId} and app ${newAppId} in place for inspection.`);
}
