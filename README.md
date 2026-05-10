![GitHub watchers](https://img.shields.io/github/watchers/dappros/ethora-app-reactjs) ![GitHub forks](https://img.shields.io/github/forks/dappros/ethora-app-reactjs) ![GitHub Repo stars](https://img.shields.io/github/stars/dappros/ethora-app-reactjs) ![GitHub repo size](https://img.shields.io/github/repo-size/dappros/ethora-app-reactjs) ![GitHub language count](https://img.shields.io/github/languages/count/dappros/ethora-app-reactjs) ![GitHub top language](https://img.shields.io/github/languages/top/dappros/ethora-app-reactjs) <a href="https://codeclimate.com/github/dappros/ethora-app-reactjs/maintainability"><img src="https://api.codeclimate.com/v1/badges/715c6f3ffb08de5ca621/maintainability" /></a> ![GitHub commit activity (branch)](https://img.shields.io/github/commit-activity/m/dappros/ethora-app-reactjs/dev) ![GitHub issues](https://img.shields.io/github/issues/dappros/ethora-app-reactjs) ![GitHub closed issues](https://img.shields.io/github/issues-closed-raw/dappros/ethora-app-reactjs) ![GitHub](https://img.shields.io/github/license/dappros/ethora-app-reactjs) <!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-13-orange.svg?style=flat-square)](#contributors)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=flat&logo=javascript&logoColor=%23F7DF1E) ![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=flat&logo=typescript&logoColor=white) ![React](https://img.shields.io/badge/react-%2320232a.svg?style=flat&logo=react&logoColor=%2361DAFB) ![JWT](https://img.shields.io/badge/JWT-black?style=flat&logo=JSON%20web%20tokens)

[![Discord](https://img.shields.io/badge/%3Cethora%3E-%237289DA.svg?style=flat&logo=discord&logoColor=white)](https://discord.gg/Sm6bAHA3ZC) [![Twitter URL](https://img.shields.io/twitter/url?url=https%3A%2F%2Fgithub.com%2Fdappros%2Fethora)](https://twitter.com/intent/tweet?url=https%3A%2F%2Fgithub.com%2Fdappros%2Fethora%2F&via=tarasfilatov&text=check%20out%20Ethora%20%23web3%20%23social%20app%20engine&hashtags=lowcode%2Creactnative%2Copensource%2Cnocode) [![Website](https://img.shields.io/website?url=https%3A%2F%2Fethora.com%2F)](https://ethora.com/) [![YouTube Channel Subscribers](https://img.shields.io/youtube/channel/subscribers/UCRvrXwMOU0WBkRZyFlU7V_g)](https://www.youtube.com/channel/UCRvrXwMOU0WBkRZyFlU7V_g)

# Ethora engine for React.js

Full Ethora app engine, React.js version.

**Part of the [Ethora SDK ecosystem](https://github.com/dappros/ethora#ecosystem)** — see all SDKs, tools, and sample apps. Follow cross-SDK updates in the [Release Notes](https://github.com/dappros/ethora/blob/main/RELEASE-NOTES.md).

## About

This repository contains the React.js frontend for Ethora. It is the main web client used for Ethora-powered apps and includes authentication, chat and messaging flows, AI-related UI surfaces, admin/app settings, widgets, and integrations used by the wider platform.

This project was previously tracked in the Ethora monorepo under the `client-web` folder. It was moved into its own repository in November 2024.

This frontend is built on top of the Ethora chat component package:

- [`@ethora/chat-component` on npm](https://www.npmjs.com/package/@ethora/chat-component)
- [`dappros/ethora-chat-component`](https://github.com/dappros/ethora-chat-component)

## Branches

- `dev` is the main default branch used by the team for ongoing frontend development and review.
- `main` is kept as a stable/public branch and may lag behind current team work.
- Feature and review branches should normally branch from `dev` and open PRs back into `dev` unless there is a specific reason to do otherwise.

## Development

Typical local workflow:

```bash
npm install
npm run dev
```

Useful commands:

```bash
npm run build
npm run typecheck
npm run lint
```

## Browser Smoke Tests

This repo also contains a Playwright e2e layer for browser-visible
public routes and for the chat-component flows that mount under
`/app/chat`. To list or run the suite:

```bash
npm run test:e2e -- --list
npm run test:e2e
```

### What's covered

| Spec | Tests | Notes |
|------|-------|-------|
| `tests/e2e/smoke.spec.ts` | Public-page renders (login, register, 404) | Mocks `/v1/apps/get-config` |
| `tests/e2e/auth-flows.spec.ts` | Host login form validation + POST body shape | Mocks login endpoint; doesn't need full bootstrap |
| `tests/e2e/chat-flows.spec.ts` | Chat-component room list, send-text, attach button | `test.fixme` stubs until post-login bootstrap mocks land |

### Cross-platform testing overview

This repo is the Layer 2 (browser e2e) home for chat-component. The
testid constants in `tests/e2e/_chatComponentTestIds.ts` mirror the
public testIds exported by `@ethora/chat-component` and match the
Compose `testTag` / SwiftUI `accessibilityIdentifier` strings used
by the mobile SDKs and their Maestro flows.

| Layer 1 (hermetic) | Layer 2 (E2E) |
|--------------------|----------------|
| [`ethora-chat-component`](https://github.com/dappros/ethora-chat-component) — Vitest + RTL + `data-testid` | `ethora-app-reactjs/tests/e2e/` — Playwright (this repo) |
| [`ethora-sdk-android`](https://github.com/dappros/ethora-sdk-android) — Compose UI tests | [`ethora-sample-android/.maestro/`](https://github.com/dappros/ethora-sample-android) — 19 Maestro flows |
| [`ethora-sdk-swift`](https://github.com/dappros/ethora-sdk-swift) — XCTest + accessibility-id markers | [`ethora-sample-swift/.maestro/`](https://github.com/dappros/ethora-sample-swift) — same 19 Maestro flows on iOS Simulator |

A Playwright spec using `[data-testid="chat_input"]` and a Maestro
flow using `id: "chat_input"` resolve the same intent — one selector
contract across all four runtime targets.
