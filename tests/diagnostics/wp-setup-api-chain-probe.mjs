// Replays the API chain that /wp-setup composes, with no UI in the loop.
// Confirms that the five backend calls compose cleanly against the real
// QA backend: sign-up -> login -> create app (with createDefaultChat) ->
// update agent prompt -> site-crawl. Reports what fails and where.
//
// Run:
//
//   QA_API=https://api.chat-qa.ethora.com \
//   APP_ID=646cc8dc96d4a4dc8f7b2f2d \
//   SITE_TITLE="Probe Test Site" \
//   SITE_URL=https://example.com \
//   node tests/diagnostics/wp-setup-api-chain-probe.mjs

const QA_API = process.env.QA_API || 'https://api.chat-qa.ethora.com';
const HOST_APP_ID = process.env.APP_ID || '646cc8dc96d4a4dc8f7b2f2d';
const SITE_TITLE = process.env.SITE_TITLE || 'Probe Test Site';
const SITE_URL = process.env.SITE_URL || 'https://example.com';
const PASSWORD = process.env.TEST_PASSWORD || 'TestPass123!';

const email = `wpsetup-${Date.now()}@test.ethora.com`;
console.log(`[step] target ${QA_API}  fresh email ${email}`);

async function jpost(path, body, token) {
  const url = `${QA_API}${path}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let parsed;
  try { parsed = JSON.parse(text); } catch { parsed = text; }
  return { status: res.status, body: parsed };
}

async function jput(path, body, token) {
  const url = `${QA_API}${path}`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let parsed;
  try { parsed = JSON.parse(text); } catch { parsed = text; }
  return { status: res.status, body: parsed };
}

function fail(label, r) {
  console.error(`[fatal] ${label} -> ${r.status}`);
  console.error(JSON.stringify(r.body, null, 2));
  process.exit(1);
}

// 1. Sign up
console.log('[step] 1/5 sign up');
const signup = await jpost('/v2/users/sign-up-with-email', {
  appId: HOST_APP_ID,
  email,
  password: PASSWORD,
  firstName: 'Probe',
  lastName: 'User',
  cfToken: '',
});
if (signup.status !== 200) fail('signup', signup);
console.log(`  ok ${signup.status}`);

// 2. Log in
console.log('[step] 2/5 log in');
const login = await jpost('/v2/users/login-with-email', {
  appId: HOST_APP_ID,
  email,
  password: PASSWORD,
});
if (login.status !== 200) fail('login', login);
const token = login.body.token;
const userId = login.body.user?._id;
if (!token) fail('login: no token', login);
console.log(`  ok user=${userId}`);

// 3. Create app with createDefaultChat:true
console.log('[step] 3/5 create app');
const created = await jpost('/v1/apps', {
  displayName: SITE_TITLE,
  createDefaultChat: true,
}, token);
if (created.status !== 200) fail('create app', created);
const app = created.body.app;
const newAppId = app?._id;
const agentId = app?.aiBot?.savedAgentId;
console.log(`  ok appId=${newAppId} agentId=${agentId || '(none)'}  aiBot=${JSON.stringify(app?.aiBot ? Object.keys(app.aiBot) : null)}`);
if (!newAppId) fail('create app: no _id', created);
if (!agentId) {
  console.warn('[warn] no aiBot.savedAgentId on created app - the wizard will skip prompt update + crawl');
}

// 4. Update bot prompt (per-app aiBot override; user token, not app token)
console.log('[step] 4/5 update bot prompt');
const promptText = `You are the assistant for ${SITE_TITLE}. Answer using only information from the indexed pages. Be concise.`;
const upd = await jput(`/v2/apps/${newAppId}/bot`, { prompt: promptText }, token);
if (upd.status !== 200) fail('update bot', upd);
console.log(`  ok prompt updated`);

// 5. Trigger site crawl
if (agentId) {
  console.log('[step] 5/5 site crawl (sync; may take ~30s)');
  const crawl = await jpost(`/v2/apps/${newAppId}/sources/site-crawl`, {
    url: SITE_URL,
    followLink: true,
    agentId,
  }, token);
  if (crawl.status !== 200) {
    console.warn(`[warn] crawl returned ${crawl.status}; wizard treats this as "still running" and proceeds`);
    console.warn(JSON.stringify(crawl.body, null, 2));
  } else {
    const r = crawl.body;
    console.log(`  ok pages=${r.resultV2?.length ?? r.result?.length ?? 0} bytes=${r.totalSize ?? '?'} truncated=${r.truncated ? r.truncatedReason : 'no'}`);
  }
}

console.log('');
console.log('[verdict] OK');
console.log(`[verdict] new appId for wizard postMessage: ${newAppId}`);
console.log(`[verdict] credentials for re-login: ${email} / ${PASSWORD}`);
