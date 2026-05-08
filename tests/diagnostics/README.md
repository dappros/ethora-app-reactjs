# Diagnostics

Scripted Playwright harnesses for investigating live bugs against a remote
deployment (QA, staging, prod). These are **investigation tools, not
assertions** — they don't run in CI.

## When to use these

When something is broken in a way that's hard to inspect from a normal
browser session:

- A page renders an indefinite loading state with no console errors.
- A WebSocket / XMPP connection is silently failing.
- The redux store ends up in an unexpected shape that's not visible in
  the UI.
- You need a reproducible, scripted set-up to share with a teammate.

For pass/fail tests of locally-built code, use `tests/e2e/` instead.

## Setup

```bash
cd ethora-app-reactjs
npm install                    # if not already
npx playwright install chromium

cp tests/diagnostics/.env.example tests/diagnostics/.env.local
# edit .env.local with your test account / target environment
```

`.env.local` is gitignored. Don't commit personal credentials or host names.

## Running

Each diagnostic is a self-contained `.mjs` script. Source the env file and
run with `node`:

```bash
set -a; source tests/diagnostics/.env.local; set +a
node tests/diagnostics/chat-spinner-probe.mjs
```

Or pass env vars inline:

```bash
TEST_EMAIL=test99@test.ethora.com node tests/diagnostics/chat-spinner-probe.mjs
```

## Available probes

### `chat-spinner-probe.mjs`

Logs in to the target frontend, navigates to `/app/chat`, captures
console output (with chat-component verbose logging force-enabled),
WebSocket frames, HTTP traffic, and a redux-store snapshot. Ends with a
`[verdict]` line:

- `CHAT CONNECTED` — XMPP is online, normal flow.
- `CHAT NEVER ATTEMPTED WS` — wedged before XmppClient init; check the
  store snapshot and the verbose `[InitPolicy]` logs.
- `CHAT TRIED WS BUT DID NOT REACH ONLINE` — auth / stream failure;
  check the WS frames for `<failure>` or stream errors.

Originally written to diagnose the c1d9469 regression (top-level
`<XmppProvider/>` lost its `config` prop, leaving the chat-component
permanently waiting on a parent bootstrap that never ran).

### `widget-history-probe.mjs`

Pure-HTTP probe for the AI Widget message-history pipeline. Logs in as
the admin, lists `widget` chats for an app, and pulls each conversation
through `GET /v2/apps/:appId/chats/:chatId/messages`. Verdict line
classifies the failure:

- `MAM_NOT_CONFIGURED` — backend has no `MAM_MYSQL_*` env vars.
- `MAM_EMPTY` — backend reaches MySQL but the archive has no rows for
  these rooms (mod_mam disabled / muc default not set / wrong domain).
- `VISITOR_ONLY` — visitor messages archived, no bot replies. AI bot
  isn't joining or isn't sending groupchat.
- `HISTORY_OK` — full pipeline works.

Use first when an operator reports "Widget Conversations modal shows no
messages." Doesn't drive a browser, so it's quick.

### `widget-full-flow-probe.mjs`

End-to-end provisioning + smoke test for a brand-new tenant App. Per
run it: creates an App, creates an AI Agent (`responseMode: always`,
deterministic prompt), invites the agent into the App's widget chat
(creating a BotInstance), sets that BotInstance as `defaultBotInstanceId`
and turns the bot on, then drives the widget UI as a visitor and
verifies both the visitor message and the bot reply landed in MAM.

Use this to validate a release branch end-to-end on a target stack,
or after touching any link in the chain (apps schema, agents flow,
widget bundle, MAM read-back). Each run leaves a fresh app + agent
on the target — set `SKIP_CLEANUP=1` to inspect the leftover artifacts;
otherwise the agent is deleted at the end (the app is left because
there is no public delete endpoint).

Verdict line:

- `WIDGET_DID_NOT_SEND` — visitor groupchat never left the client.
- `VISITOR_NOT_ARCHIVED` — message left the client but no MAM row.
- `FULL_FLOW_OK` — both sides archived.
- `BOT_DID_NOT_REPLY` — visitor archived but no bot reply seen.
  Likely ai-service didn't auto-join the visitor's persistent room.

### `widget-e2e-probe.mjs`

End-to-end probe for the full AI Widget pipeline. Hosts a synthetic
page on the widget origin (so localStorage works), injects the
production `assistant.js`, drives it as a visitor (open popup, type
test message, send), and reports what landed on XMPP and in MAM.

Verdict tree:

- `NO_SESSION` — `POST /v2/widget/sessions` never landed.
- `NO_WS` — session minted but bundle never opened a WebSocket
  (CORS, mixed content, hardcoded WS URL).
- `SASL_FAILED` — visitor password mismatch / wrong auth path.
- `NO_MUC_JOIN` — SASL OK but no MUC `<presence>` sent.
- `NO_SEND` — joined the room but no groupchat sent (input
  automation likely failed; check `widget-send` line).
- `SENT_BUT_NOT_ARCHIVED` — message left the client but MAM has no
  rows. Inspect `mod_mam` config / MUC service domain coverage.
- `ARCHIVED` — full pipeline works.

Originally written to diagnose the `ReduxWrapper.tsx` bug where the
widget overwrote the server-issued visitor JID with an `anon-<uuid>`
credential, causing `mod_ethora`'s per-app prefix guard to reject MUC
presence and leaving the Widget Conversations panel permanently empty.

## Reusable helpers (`tests/diagnostics/lib/`)

These are designed for other probes to import as-needed. Browser-side
helpers are exported as strings to be dropped into `page.evaluate`,
because production builds don't expose React DevTools.

- `console-capture.mjs` — `installConsoleCapture(ctx)` patches all
  `console.*` methods, the WebSocket constructor, and unhandled error
  listeners in every newly-created document. `drainCapture(page)`
  returns the buffered messages.
- `fiber-walker.mjs` — `findChatStoreSrc` (string, drop-in for
  `page.evaluate`), `enableChatVerboseLogging(page)`, and
  `snapshotChatStore(page)`. Walk React fibers from a known DOM node
  back to the root then BFS down to find the chat-component's redux
  store; useful for inspection or for dispatching actions into it from
  outside the running app.
- `auth.mjs` — direct API signup/login bypassing the UI form. Returns
  `{ token, refreshToken, user }`. Use when the UI signup flow is
  flaky or when the test cares about post-auth flows only.

## Adding a new probe

Keep one probe = one bug shape. Don't try to make a single probe handle
many failures with flags — write a new file. They're cheap.

Conventions to follow (look at `chat-spinner-probe.mjs` for the shape):

- Use `installConsoleCapture` so behavior is consistent across probes.
- Print `[step]` lines so the transcript is readable.
- Print a `[verdict]` line at the end with the most likely interpretation
  of what you observed. The next person reading the output shouldn't
  need to remember what each indicator means.
- Take a screenshot. They're cheap and often clarify what the UI was
  showing at the moment of capture.
