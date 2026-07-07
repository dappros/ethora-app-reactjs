import { chromium } from 'playwright';
const browser = await chromium.launch({ channel: 'chromium' });
const page = await browser.newPage();

const networkLog = [];
page.on('request', r => {
  const url = r.url();
  if (/ethora|chat-qa|widget|/.test(url) && !/wp-content|wp-includes|wp-json/.test(url)) {
    networkLog.push(`> ${r.method()} ${url}`);
  }
});
page.on('response', r => {
  const url = r.url();
  if (/ethora|chat-qa|widget/.test(url) && !/wp-content|wp-includes|wp-json/.test(url)) {
    networkLog.push(`< ${r.status()} ${url}`);
  }
});
page.on('console', m => {
  const t = m.text();
  if (/ethora|widget|sessions|error|failed|xmpp/i.test(t)) {
    console.log('[console]', m.type(), t.slice(0, 300));
  }
});
page.on('pageerror', e => console.log('[pageerror]', e.message.slice(0,300)));
page.on('requestfailed', r => console.log('[requestfailed]', r.url(), '->', r.failure()?.errorText));

await page.goto('http://localhost:8080/', { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(5000);

console.log('--- chat-widget div present? ---');
console.log(await page.$eval('#chat-widget', el => el.outerHTML.slice(0, 400)).catch(() => '(no #chat-widget div)'));

console.log('--- chat-content-assistant script tag ---');
console.log(await page.$eval('#chat-content-assistant', el => el.outerHTML).catch(() => '(no #chat-content-assistant)'));

console.log('--- network log (Ethora-related) ---');
networkLog.slice(0, 30).forEach(l => console.log(l));

await page.screenshot({ path: '/tmp/qa-debug/wp-front-after-setup.png', fullPage: true });
await browser.close();
