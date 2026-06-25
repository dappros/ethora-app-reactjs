// Drives the /wp-setup wizard UI end-to-end against a local Vite dev server
// that's configured to talk to QA. Mocks window.opener so we can assert the
// postMessage envelope the wizard sends back to the WP plugin.
//
// Prereq: a Vite dev server on http://localhost:5173 with VITE_API and
// VITE_API_V2 pointed at chat-qa.ethora.com. The harness in this directory
// usually starts it for you; if running standalone, see the .env.local
// wp-setup-api-chain-probe writes during the run-all path.
//
// Run:
//
//   DEV_BASE=http://localhost:5173 \
//   QA_API=https://api.chat-qa.ethora.com \
//   APP_ID=646cc8dc96d4a4dc8f7b2f2d \
//   node tests/diagnostics/wp-setup-ui-probe.mjs

import { chromium } from 'playwright';
import { installConsoleCapture, drainCapture } from './lib/console-capture.mjs';

const DEV_BASE = process.env.DEV_BASE || 'http://localhost:5173';
const QA_API = process.env.QA_API || 'https://api.chat-qa.ethora.com';
const RETURN_ORIGIN = process.env.RETURN_ORIGIN || 'https://allreactnative.com';
const SITE_TITLE = process.env.SITE_TITLE || 'UI Probe Site';
const SITE_URL = process.env.SITE_URL || 'https://example.com';
const SCREENSHOT_DIR = process.env.SCREENSHOT_DIR || '/tmp/qa-debug';
const FRESH_EMAIL = `wpui-${Date.now()}@test.ethora.com`;
const PASSWORD = 'TestPass123!';

const wizardUrl = new URL(`${DEV_BASE}/wp-setup`);
wizardUrl.searchParams.set('site_title', SITE_TITLE);
wizardUrl.searchParams.set('site_url', SITE_URL);
wizardUrl.searchParams.set('return_origin', RETURN_ORIGIN);

console.log(`[step] target ${wizardUrl.toString()}`);
console.log(`[step] using fresh email ${FRESH_EMAIL}`);

const browser = await chromium.launch({ channel: 'chromium' });
const ctx = await browser.newContext();
const page = await ctx.newPage();
const cap = installConsoleCapture(page);

// Mock window.opener BEFORE the wizard's React tree mounts so the done-state
// useEffect can find it. We also capture every postMessage call into a list
// the probe can read back via page.evaluate.
await page.addInitScript(() => {
  window.__capturedMessages = [];
  Object.defineProperty(window, 'opener', {
    configurable: true,
    get() {
      return {
        postMessage(data, origin) {
          window.__capturedMessages.push({ data, origin });
        },
      };
    },
  });
});

await page.goto(wizardUrl.toString(), { waitUntil: 'networkidle' });
await page.waitForSelector('text=Set up your AI assistant', { timeout: 15000 });
console.log('[ok] wizard rendered');

// Step 1: account form
await page.fill('input[type=email]', FRESH_EMAIL);
await page.fill('input[type=password]', PASSWORD);
const inputs = await page.$$('input');
// First name + Last name come before email/password in the rendered form.
await inputs[0].fill('Probe');
await inputs[1].fill('User');
console.log('[step] submit account form');
await page.click('button:has-text("Continue")');

await page.waitForSelector('text=Confirm what your assistant should know', { timeout: 30000 });
console.log('[ok] account created + logged in -> configure step rendered');

// Step 2: configure (defaults are pre-filled from query params; just submit)
const appName = await page.$eval('input[value]', el => el.value).catch(() => '');
console.log(`[ok] app name pre-fill: ${JSON.stringify(appName)}`);
console.log('[step] submit configure form (Set up my AI)');
await page.click('button:has-text("Set up my AI")');

await page.waitForSelector('text=Setting things up', { timeout: 10000 });
console.log('[ok] provisioning step shown');

// Wait for done state. Site-crawl can take up to ~60s for the host's example.com
// page, but the wizard treats axios timeout as "still running" and continues.
await page.waitForSelector('text=Your AI assistant is ready', { timeout: 90000 });
console.log('[ok] done step shown');

await page.screenshot({ path: `${SCREENSHOT_DIR}/wp-setup-done.png`, fullPage: true });

const captured = await page.evaluate(() => window.__capturedMessages || []);
console.log(`[capture] postMessage calls: ${captured.length}`);
for (const m of captured) {
  console.log(`  origin=${m.origin}  data=${JSON.stringify(m.data)}`);
}

let appId = null;
let verdict = 'FAIL';
const valid = captured.find(
  m => m?.data?.type === 'ethora-wp-setup-complete' &&
       typeof m.data.appId === 'string' &&
       /^[a-f0-9]{24}$/i.test(m.data.appId) &&
       m.origin === RETURN_ORIGIN
);
if (valid) {
  appId = valid.data.appId;
  verdict = 'PASS';
}

console.log('');
console.log(`[verdict] ${verdict}`);
if (verdict === 'PASS') {
  console.log(`[verdict] appId delivered to opener: ${appId}`);
  console.log(`[verdict] origin matched return_origin: ${RETURN_ORIGIN}`);
} else {
  console.log('[verdict] no valid ethora-wp-setup-complete message captured');
  await drainCapture(cap).then(lines => {
    console.log('--- console output ---');
    console.log(lines.join('\n'));
  });
}

await browser.close();
process.exit(verdict === 'PASS' ? 0 : 1);
