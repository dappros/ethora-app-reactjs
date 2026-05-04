// Inject a console wrapper into every page in the context BEFORE any other
// script runs. Captures every call to console.log/info/warn/error/debug/trace
// into `window.__captureLogs` (an array of strings) and also routes them to
// the original methods so Playwright's `page.on('console')` still works.
//
// Why both? Two reasons:
//
//   1. `page.on('console')` reports the message text, but if a page navigation
//      replaces the document mid-capture you can lose the buffer. The in-page
//      array survives until you read it via `page.evaluate`.
//   2. We can also capture WebSocket constructor calls and unhandled errors
//      here, putting everything in one ordered stream. Useful when you want
//      to know whether a log arrived BEFORE or AFTER a WebSocket attempt.
//
// Usage:
//
//   import { installConsoleCapture, drainCapture } from './lib/console-capture.mjs';
//   await installConsoleCapture(ctx);
//   // ... drive the page ...
//   const lines = await drainCapture(page);
//
// The wrapper is idempotent per-page-load (it pushes a sentinel on init so
// you can verify it ran).

export async function installConsoleCapture(ctx) {
  await ctx.addInitScript(() => {
    window.__captureLogs = window.__captureLogs || [];
    window.__captureLogs.push('[wrapper] init-script executed at ' + new Date().toISOString());

    for (const m of ['log', 'info', 'warn', 'error', 'debug', 'trace']) {
      const orig = window.console[m];
      window.console[m] = function (...args) {
        try {
          window.__captureLogs.push(`[${m}] ` + args.map((a) => {
            try { return typeof a === 'string' ? a : JSON.stringify(a); } catch { return String(a); }
          }).join(' '));
        } catch {}
        try { orig.apply(window.console, args); } catch {}
      };
    }

    window.addEventListener('error', (e) => {
      try { window.__captureLogs.push('[unhandled-error] ' + (e.message || e.error?.message || String(e))); } catch {}
    });
    window.addEventListener('unhandledrejection', (e) => {
      try { window.__captureLogs.push('[unhandled-promise] ' + String(e.reason)); } catch {}
    });

    if (window.WebSocket) {
      const OrigWS = window.WebSocket;
      window.WebSocket = function (...args) {
        try { window.__captureLogs.push('[WebSocket-new] ' + JSON.stringify(args)); } catch {}
        const ws = new OrigWS(...args);
        ws.addEventListener('open', () => {
          try { window.__captureLogs.push('[WebSocket-open] ' + args[0]); } catch {}
        });
        ws.addEventListener('error', (e) => {
          try { window.__captureLogs.push('[WebSocket-error] ' + (e?.message || 'unknown')); } catch {}
        });
        ws.addEventListener('close', (e) => {
          try { window.__captureLogs.push('[WebSocket-close] code=' + e.code + ' reason=' + e.reason); } catch {}
        });
        return ws;
      };
      Object.setPrototypeOf(window.WebSocket, OrigWS);
      for (const k of ['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED']) {
        Object.defineProperty(window.WebSocket, k, { value: OrigWS[k] });
      }
    }

    try { window.console.log('[wrapper] sentinel-after-patch'); } catch {}
  });
}

export async function drainCapture(page) {
  return await page.evaluate(() => window.__captureLogs || []);
}
