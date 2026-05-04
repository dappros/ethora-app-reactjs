# Tests

Two kinds of automated tests live here. They have different goals, run
differently, and target different environments — keep them separate.

## `tests/e2e/`

End-to-end smoke specs that run against a **local** Vite dev server with
mocked network responses. These are **assertion** tests using
`@playwright/test`: they check that pages render the expected content and
fail CI if they don't.

Run with:

```bash
npm run test:e2e             # all e2e specs
npx playwright test tests/e2e/smoke.spec.ts   # one spec
```

`playwright.config.ts` boots `npm run dev` automatically and points the
browser at it. No external service is touched.

## `tests/diagnostics/`

Scripted diagnostic harnesses that drive a **remote** environment (QA,
staging, prod) to reproduce a live bug, capture instrumentation, and dump
state. These are **investigation** tools — they don't assert pass/fail and
they don't run in CI. They're meant to be run by hand when something is
broken in a way that's hard to inspect from a normal browser.

Each diagnostic is a standalone `.mjs` script that uses the `playwright`
library directly (not `@playwright/test`). Why a script and not a spec?

- Diagnostics typically need long ad-hoc waits, in-page evaluate hooks,
  WebSocket inspection, redux-store walks via React fibers, and full
  console capture. Test specs are shaped around assertions; that gets in
  the way.
- Diagnostics often need to talk to the real backend (signup, login,
  fetch credentials) before navigating. A test spec's `beforeEach` flow
  is too rigid for that.
- Output is meant to be read, not green-checked.

See `tests/diagnostics/README.md` for the full list and how to run each.
