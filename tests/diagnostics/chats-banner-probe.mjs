// Diagnostic probe for the context-aware chats banner. Logs in, visits
// /app/chat, captures the banner text + a screenshot, then if the test
// user owns child apps, switches into one and re-captures.
//
// Verdict line: one of BANNER_BASE_NO_APPS, BANNER_BASE_HAS_APPS,
// BANNER_OWN_NO_CHATS, BANNER_NONE.

import { chromium } from 'playwright';
import { signupOrLogin } from './lib/auth.mjs';

const QA_BASE = process.env.QA_BASE || 'https://app.chat-qa.ethora.com';
const QA_API = process.env.QA_API || 'https://api.chat-qa.ethora.com';
const APP_ID = process.env.APP_ID || '646cc8dc96d4a4dc8f7b2f2d';
const CHILD_APP_ID = process.env.CHILD_APP_ID || '69f8e08633663b6379591c71';
const TEST_EMAIL = process.env.TEST_EMAIL || 'test18491@test.ethora.com';
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'TestPass123!';
const OUT_DIR = process.env.OUT_DIR || '/tmp/qa-debug';

console.log(`[step] target=${QA_BASE} email=${TEST_EMAIL}`);
await signupOrLogin({ apiBase: QA_API, appId: APP_ID, email: TEST_EMAIL, password: TEST_PASSWORD });

const browser = await chromium.launch({ headless: true, channel: 'chromium' });
const ctx = await browser.newContext({ ignoreHTTPSErrors: true, viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();
page.on('pageerror', (e) => console.log(`[pageerror] ${e.message}`));

await page.goto(`${QA_BASE}/login`, { waitUntil: 'domcontentloaded' });
await page.fill('input[name="email"]', TEST_EMAIL);
await page.fill('input[name="password"]', TEST_PASSWORD);
await page.click('button[type="submit"]');
await page.waitForURL(/\/app\//, { timeout: 15000 }).catch(() => {});

const BANNER_PATTERNS = {
  BANNER_BASE_NO_APPS: /Explore as an end user or .*create your own App/,
  BANNER_BASE_HAS_APPS: /Use the drop-down selector above to switch/,
  BANNER_OWN_NO_CHATS: /no chats available yet.*App Settings.*Chats/,
};

async function inspect(label, urlSuffix = '/app/chat') {
  console.log(`[step] visiting ${urlSuffix} (${label})`);
  await page.goto(`${QA_BASE}${urlSuffix}`, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(2500);
  const screenshot = `${OUT_DIR}/chats-banner-${label}.png`;
  await page.screenshot({ path: screenshot, fullPage: false });
  console.log(`[step] screenshot: ${screenshot}`);
  const bodyText = await page.evaluate(() => document.body.innerText || '');
  let verdict = 'BANNER_NONE';
  for (const [name, re] of Object.entries(BANNER_PATTERNS)) {
    if (re.test(bodyText)) {
      verdict = name;
      break;
    }
  }
  console.log(`[verdict-${label}] ${verdict}`);
  return verdict;
}

await inspect('base-default');

// Try selecting a child app via the switcher dropdown
const hasSwitcher = await page.locator('select').count();
if (hasSwitcher > 0 && CHILD_APP_ID) {
  console.log(`[step] switching to child app ${CHILD_APP_ID}`);
  await page.selectOption('select', CHILD_APP_ID).catch((e) => {
    console.log(`[step] switcher selectOption failed: ${e.message}`);
  });
  await page.waitForTimeout(3000);
  await inspect('own-app-context');
}

await browser.close();
