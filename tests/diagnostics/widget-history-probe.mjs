// Diagnostic probe for the AI Widget message-history pipeline.
//
// Walks: login as admin -> list widget conversations for a target app ->
// for each conversation, GET /v2/apps/:appId/chats/:chatId/messages and
// dump the result. The verdict line tells you which of the common
// failure modes is currently in play:
//
//   - MAM_NOT_CONFIGURED on the backend (response.mamUnavailable=true)
//   - MAM is configured but no rows exist for the room (visitor never
//     spoke, or mod_mam isn't archiving groupchat for widget rooms)
//   - Only visitor rows present (bot never joined / never replied)
//   - Both sides present (history pipeline is working)
//
// The probe makes NO browser calls — it's pure HTTP against the admin
// API. Pair with a separate UI probe if you need to drive the widget
// itself.
//
// Run:
//
//   QA_API=https://api.chat-qa.ethora.com \
//   APP_ID=646cc8dc96d4a4dc8f7b2f2d \
//   TEST_EMAIL=test18491@test.ethora.com \
//   TEST_PASSWORD='TestPass123!' \
//   node tests/diagnostics/widget-history-probe.mjs
//
// To probe a specific child app, set TARGET_APP_ID. Defaults to APP_ID.

import { signupOrLogin } from './lib/auth.mjs';

const QA_API = process.env.QA_API || 'https://api.chat-qa.ethora.com';
const APP_ID = process.env.APP_ID || '646cc8dc96d4a4dc8f7b2f2d';
const TARGET_APP_ID = process.env.TARGET_APP_ID || APP_ID;
const TEST_EMAIL = process.env.TEST_EMAIL || 'test18491@test.ethora.com';
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'TestPass123!';
const MAX_CONVOS = Number(process.env.MAX_CONVOS || 5);

console.log(`[step] api=${QA_API} appId=${TARGET_APP_ID} email=${TEST_EMAIL}`);

console.log('[step] login (signup if missing)');
const auth = await signupOrLogin({
  apiBase: QA_API,
  appId: APP_ID,
  email: TEST_EMAIL,
  password: TEST_PASSWORD,
});
const token = auth?.data?.token || auth?.token;
if (!token) {
  console.error('[fatal] no token from login response:', JSON.stringify(auth).slice(0, 500));
  process.exit(1);
}
console.log(`[step] got token (len=${token.length})`);

async function api(path, opts = {}) {
  const url = `${QA_API}${path}`;
  const res = await fetch(url, {
    ...opts,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(opts.headers || {}),
    },
  });
  const text = await res.text();
  let body;
  try { body = JSON.parse(text); } catch { body = text; }
  return { status: res.status, body };
}

console.log(`[step] GET /v2/apps/${TARGET_APP_ID}/widget/conversations`);
const convoResp = await api(`/v2/apps/${TARGET_APP_ID}/widget/conversations?limit=20`);
console.log(`[response] ${convoResp.status}`);
if (convoResp.status !== 200) {
  console.log('[fatal] conversations fetch failed:', JSON.stringify(convoResp.body).slice(0, 500));
  process.exit(1);
}
const convos = convoResp.body?.results || [];
console.log(`[step] found ${convos.length} widget conversation(s)`);

if (convos.length === 0) {
  console.log('[verdict] NO_CONVERSATIONS — no widget chats archived in Mongo for this app. Either nobody has used the widget yet, or the visitor-session provisioner is failing earlier.');
  process.exit(0);
}

let totalRows = 0;
let totalVisitorRows = 0;
let totalBotRows = 0;
let mamUnavailableCount = 0;
let chatsWithMessages = 0;
let chatsWithBotReply = 0;

for (const c of convos.slice(0, MAX_CONVOS)) {
  const chatId = c._id;
  const visJid = c.visitor?.xmppUsername || '';
  console.log(`\n[step] chat ${chatId} (room=${c.name}) visitor=${visJid}`);
  const r = await api(`/v2/apps/${TARGET_APP_ID}/chats/${chatId}/messages?limit=200`);
  if (r.status !== 200) {
    console.log(`  [error] ${r.status} ${JSON.stringify(r.body).slice(0, 300)}`);
    continue;
  }
  const data = r.body || {};
  const rows = data.results || [];
  console.log(`  total=${data.total} mamUnavailable=${data.mamUnavailable} returned=${rows.length}`);
  if (data.mamUnavailable) mamUnavailableCount++;
  if (rows.length === 0) continue;
  chatsWithMessages++;
  let visitorRows = 0;
  let botRows = 0;
  for (const m of rows) {
    const isVisitor = visJid && (m.from === visJid || m.from.startsWith(`${visJid}@`) || m.nick === visJid);
    if (isVisitor) visitorRows++;
    else botRows++;
  }
  totalRows += rows.length;
  totalVisitorRows += visitorRows;
  totalBotRows += botRows;
  if (botRows > 0) chatsWithBotReply++;
  console.log(`  visitor=${visitorRows} bot/other=${botRows}`);
  // Show the first/last message bodies as a sanity check.
  const first = rows[0];
  const last = rows[rows.length - 1];
  console.log(`  first: from=${first.from} nick=${first.nick} ts=${new Date(first.ts).toISOString()} body=${JSON.stringify((first.body || '').slice(0, 120))}`);
  if (rows.length > 1) {
    console.log(`  last:  from=${last.from} nick=${last.nick} ts=${new Date(last.ts).toISOString()} body=${JSON.stringify((last.body || '').slice(0, 120))}`);
  }
}

console.log(`\n[summary] convos_inspected=${Math.min(convos.length, MAX_CONVOS)} chats_with_messages=${chatsWithMessages} chats_with_bot_reply=${chatsWithBotReply} totalRows=${totalRows} visitorRows=${totalVisitorRows} botRows=${totalBotRows} mamUnavailable=${mamUnavailableCount}`);

if (mamUnavailableCount > 0) {
  console.log('[verdict] MAM_NOT_CONFIGURED — backend has no MAM_MYSQL_* env vars. Re-render env from deploy/templates/backend.env.template (or check the deploy.yml ↔ setup-env.sh wiring) and pm2 restart backend.');
} else if (totalRows === 0) {
  console.log('[verdict] MAM_EMPTY — backend reaches MySQL fine but the archive table has no rows for any of these rooms. Either mod_mam is disabled, the muc.* domain is excluded from archiving, or the rooms were created before MAM was configured. Check ejabberd.yml `modules: mod_mam:` for `default: always` and `muc_default: always` (or equivalent).');
} else if (totalBotRows === 0) {
  console.log('[verdict] VISITOR_ONLY — visitor messages are archived but no bot replies. Either the bot is not joining the room (check `mod_ethora` JID-prefix guard logs) or the bot is joining but not sending groupchat. Inspect the AI bot service logs and ejabberd MUC presence for the bot JID.');
} else {
  console.log('[verdict] HISTORY_OK — both sides archived. If the UI modal still shows "no messages", suspect a frontend render bug (check the modal selectedRow.chatId vs the URL, and inspect the network response in devtools).');
}
