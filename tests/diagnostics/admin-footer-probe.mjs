// Diagnostic probe for the universal admin-panel support footer.
// Logs in, walks every admin sub-page + /app/help, screenshots each, and
// reports whether the "Need assistance? Visit our Help & Support page"
// link is present in the rendered DOM on every admin page (it should be)
// and that it points at /app/help.
//
// Verdict line classifies the result:
//   - FOOTER_OK         — footer present on every admin page screenshot
//   - FOOTER_MISSING_*  — footer missing on a specific page (page name in token)
//   - FOOTER_LINKS_WRONG — link href is not /app/help

import { chromium } from 'playwright';
import { signupOrLogin } from './lib/auth.mjs';

const QA_BASE = process.env.QA_BASE || 'https://app.chat-qa.ethora.com';
const QA_API = process.env.QA_API || 'https://api.chat-qa.ethora.com';
const APP_ID = process.env.APP_ID || '646cc8dc96d4a4dc8f7b2f2d';
const CHILD_APP_ID = process.env.CHILD_APP_ID || '69f8e08633663b6379591c71';
const TEST_EMAIL = process.env.TEST_EMAIL || 'test18491@test.ethora.com';
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'TestPass123!';
const OUT_DIR = process.env.OUT_DIR || '/tmp/qa-debug';

const FOOTER_TEXT = /Need assistance\?/;

console.log(`[step] target=${QA_BASE} email=${TEST_EMAIL}`);
console.log('[step] ensuring account exists');
await signupOrLogin({ apiBase: QA_API, appId: APP_ID, email: TEST_EMAIL, password: TEST_PASSWORD });

const browser = await chromium.launch({ headless: true, channel: 'chromium' });
const ctx = await browser.newContext({ ignoreHTTPSErrors: true, viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();
page.on('pageerror', (e) => console.log(`[pageerror] ${e.message}`));

console.log('[step] navigating to /login');
await page.goto(`${QA_BASE}/login`, { waitUntil: 'domcontentloaded' });
await page.fill('input[name="email"]', TEST_EMAIL);
await page.fill('input[name="password"]', TEST_PASSWORD);
await page.click('button[type="submit"]');
await page.waitForURL(/\/app\//, { timeout: 15000 }).catch(() => {});
console.log(`[step] post-login URL: ${page.url()}`);

const pages = [
  { name: 'admin-apps',     url: `${QA_BASE}/app/admin/apps` },
  { name: 'admin-agents',   url: `${QA_BASE}/app/admin/agents` },
  { name: 'app-settings',   url: `${QA_BASE}/app/admin/apps/${CHILD_APP_ID}/settings` },
  { name: 'app-users',      url: `${QA_BASE}/app/admin/apps/${CHILD_APP_ID}/users` },
  { name: 'app-statistics', url: `${QA_BASE}/app/admin/apps/${CHILD_APP_ID}/statistics` },
  { name: 'help',           url: `${QA_BASE}/app/help` },
];

const results = [];
for (const p of pages) {
  console.log(`[step] visiting ${p.name} -> ${p.url}`);
  await page.goto(p.url, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(800);
  const screenshot = `${OUT_DIR}/admin-footer-${p.name}.png`;
  await page.screenshot({ path: screenshot, fullPage: true });
  console.log(`[step] screenshot: ${screenshot}`);
  const body = await page.evaluate(() => document.body.innerText || '');
  const hasFooter = FOOTER_TEXT.test(body);
  const linkHref = await page.evaluate(() => {
    const link = Array.from(document.querySelectorAll('a, [href]')).find(
      (el) => /Help.*Support/.test(el.textContent || '')
    );
    return link ? link.getAttribute('href') : null;
  });
  results.push({ name: p.name, url: p.url, hasFooter, linkHref });
}

console.log('[step] summary');
for (const r of results) {
  console.log(`  ${r.hasFooter ? 'OK' : 'MISSING'}  ${r.name}  link=${r.linkHref || '(none)'}`);
}

const adminPages = results.filter((r) => r.name !== 'help');
const missing = adminPages.find((r) => !r.hasFooter);
const badLink = adminPages.find((r) => r.hasFooter && r.linkHref !== '/app/help');

if (missing) {
  console.log(`[verdict] FOOTER_MISSING_${missing.name.toUpperCase()} — '${missing.name}' has no "Need assistance?" footer`);
} else if (badLink) {
  console.log(`[verdict] FOOTER_LINKS_WRONG — '${badLink.name}' footer link is ${badLink.linkHref}, expected /app/help`);
} else {
  console.log('[verdict] FOOTER_OK — every admin page has the support footer pointing at /app/help');
}

await browser.close();
