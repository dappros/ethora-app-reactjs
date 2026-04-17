![GitHub watchers](https://img.shields.io/github/watchers/dappros/ethora-app-reactjs) ![GitHub forks](https://img.shields.io/github/forks/dappros/ethora-app-reactjs) ![GitHub Repo stars](https://img.shields.io/github/stars/dappros/ethora-app-reactjs) ![GitHub repo size](https://img.shields.io/github/repo-size/dappros/ethora-app-reactjs) ![GitHub language count](https://img.shields.io/github/languages/count/dappros/ethora-app-reactjs) ![GitHub top language](https://img.shields.io/github/languages/top/dappros/ethora-app-reactjs) <a href="https://codeclimate.com/github/dappros/ethora-app-reactjs/maintainability"><img src="https://api.codeclimate.com/v1/badges/715c6f3ffb08de5ca621/maintainability" /></a> ![GitHub commit activity (branch)](https://img.shields.io/github/commit-activity/m/dappros/ethora-app-reactjs/dev) ![GitHub issues](https://img.shields.io/github/issues/dappros/ethora-app-reactjs) ![GitHub closed issues](https://img.shields.io/github/issues-closed-raw/dappros/ethora-app-reactjs) ![GitHub](https://img.shields.io/github/license/dappros/ethora-app-reactjs) <!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-13-orange.svg?style=flat-square)](#contributors)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=flat&logo=javascript&logoColor=%23F7DF1E) ![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=flat&logo=typescript&logoColor=white) ![React](https://img.shields.io/badge/react-%2320232a.svg?style=flat&logo=react&logoColor=%2361DAFB) ![JWT](https://img.shields.io/badge/JWT-black?style=flat&logo=JSON%20web%20tokens)

[![Discord](https://img.shields.io/badge/%3Cethora%3E-%237289DA.svg?style=flat&logo=discord&logoColor=white)](https://discord.gg/Sm6bAHA3ZC) [![Twitter URL](https://img.shields.io/twitter/url?url=https%3A%2F%2Fgithub.com%2Fdappros%2Fethora)](https://twitter.com/intent/tweet?url=https%3A%2F%2Fgithub.com%2Fdappros%2Fethora%2F&via=tarasfilatov&text=check%20out%20Ethora%20%23web3%20%23social%20app%20engine&hashtags=lowcode%2Creactnative%2Copensource%2Cnocode) [![Website](https://img.shields.io/website?url=https%3A%2F%2Fethora.com%2F)](https://ethora.com/) [![YouTube Channel Subscribers](https://img.shields.io/youtube/channel/subscribers/UCRvrXwMOU0WBkRZyFlU7V_g)](https://www.youtube.com/channel/UCRvrXwMOU0WBkRZyFlU7V_g)

# Ethora engine for React.js

The React.js web frontend that powers Ethora Cloud. Sign up, create apps, manage chats and AI bots, configure widgets, and use the same UI/UX that runs on `app.chat.ethora.com`.

**Part of the [Ethora SDK ecosystem](https://github.com/dappros/ethora#ecosystem)** — see all SDKs, tools, and sample apps. Follow cross-SDK updates in the [Release Notes](https://github.com/dappros/ethora/blob/main/RELEASE-NOTES.md).

## Live instances

| Environment | URL | Notes |
|-------------|-----|-------|
| **Production** | [app.chat.ethora.com](https://app.chat.ethora.com) | Public Ethora Cloud — sign up, create apps, get API credentials. |
| **QA** | [chat-qa.ethora.com](https://chat-qa.ethora.com) | Pre-production environment used for release validation. |
| **SDK Playground** | [playground.chat.ethora.com](https://playground.chat.ethora.com) | Live `@ethora/chat-component` playground (separate repo: [ethora-sdk-playground](https://github.com/dappros/ethora-sdk-playground)). |
| **Status / uptime** | [uptime.chat.ethora.com](https://uptime.chat.ethora.com) | Public uptime + journey checks. |

## What is this?

This repository contains the **React.js frontend** for Ethora — the same code base running at [app.chat.ethora.com](https://app.chat.ethora.com). It includes:

- **Authentication** — email/password, social SSO, JWT exchange.
- **Chat & messaging** — built on `@ethora/chat-component`, with rooms, threads, push, AI bots.
- **App admin** — create and manage tenant apps, users, chats, app tokens, billing, and Stripe integration.
- **AI widget surfaces** — configure AI bots, manage prompts and indexed sources, generate embed snippets that customers paste into their own sites.
- **Profile, wallet, gamification** — user profile, ERC-20/721 wallet UI, coins/referrals.

This project was previously tracked in the Ethora monorepo under the `client-web` folder. It was moved into its own repository in November 2024.

The frontend is built on top of the Ethora chat component package:

- [`@ethora/chat-component` on npm](https://www.npmjs.com/package/@ethora/chat-component)
- [`dappros/ethora-chat-component`](https://github.com/dappros/ethora-chat-component) — source

## Default backend endpoints

The app talks to the canonical Ethora Cloud endpoints by default:

| Purpose | Default value |
|---------|---------------|
| API base URL | `https://api.chat.ethora.com/v1` (legacy), `https://api.chat.ethora.com/v2` (current) |
| Swagger / API docs | [api.chat.ethora.com/api-docs/#/](https://api.chat.ethora.com/api-docs/#/) |
| XMPP WebSocket | `wss://xmpp.chat.ethora.com:5443/ws` |
| XMPP host | `xmpp.chat.ethora.com` |
| XMPP MUC (conference) | `conference.xmpp.chat.ethora.com` |

All of the above can be overridden via environment variables — see `.env-example` for the full list (`VITE_API`, `VITE_API_V2`, `VITE_APP_XMPP_SERVICE`, `VITE_XMPP_HOST`, `VITE_XMPP_SERVICE`, etc.). To target QA, point `VITE_API` and the XMPP variables at `chat-qa.ethora.com` instead.

## Branches

- `dev` is the main default branch used by the team for ongoing frontend development and review.
- `main` is kept as a stable/public branch and may lag behind current team work.
- Feature and review branches should normally branch from `dev` and open PRs back into `dev` unless there is a specific reason to do otherwise.

## Development

Prerequisites: **Node.js 18+** (project uses Vite 5 + React 18) and npm.

```bash
git clone https://github.com/dappros/ethora-app-reactjs.git
cd ethora-app-reactjs
cp .env-example .env
npm install
npm run dev
```

Open http://localhost:5173. The app will connect to `https://api.chat.ethora.com` and `wss://xmpp.chat.ethora.com:5443/ws` by default; edit `.env` to point at a different backend (for example self-hosted or QA).

Useful commands:

```bash
npm run build       # production build (Vite)
npm run typecheck   # TypeScript-only check
npm run lint        # ESLint
```

## Browser Smoke Tests

This repo also contains a minimal Playwright smoke layer for browser-visible public routes. To list or run the suite:

```bash
npm run test:e2e -- --list
npm run test:e2e
```

## Related repositories

- [`@ethora/chat-component`](https://github.com/dappros/ethora-chat-component) — React chat SDK consumed by this app.
- [`@ethora/sdk-backend`](https://github.com/dappros/ethora-sdk-backend-integration) — Node.js backend SDK and integration guide.
- [`@ethora/setup`](https://github.com/dappros/ethora-setup) — `npx @ethora/setup` to bootstrap an Ethora app and config files.
- [`ethora-mcp-cli`](https://github.com/dappros/ethora-mcp-cli) — MCP server for IDE / AI agent integration.
- [Ethora monorepo](https://github.com/dappros/ethora) — full ecosystem entry point.

## License

AGPL. See [LICENSE](./LICENSE).
