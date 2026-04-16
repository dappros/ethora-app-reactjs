# Performance Audit: ethora-app-reactjs

**Date:** 2026-04-16  
**Status:** Pending implementation  
**Branch:** dev-tf (reviewed), findings apply to dev as well

---

## Summary

The web app at https://app.chat.ethora.com/ feels slow — spinners appear frequently, admin panel / dashboard navigation is sluggish. This audit identifies low-hanging optimizations in the React frontend.

---

## Findings (ranked by impact)

### P0 — Artificial 1-second delay on every app load

**File:** `src/actions.ts:71`

```ts
await sleep(1000);
httpTokens.appJwt = result.appToken;
```

Every user stares at the `<Loading>` spinner for at least 1 full second after config fetch, even if the API responds in 50ms. This `sleep` appears to be leftover debug/workaround code.

**Fix:** Remove the `sleep(1000)` call entirely.

---

### P1 — `AppStatistics` and `Chat` are not lazy-loaded

**File:** `src/router.tsx:5,9`

```ts
import { AppStatistics } from './pages/AppStatistics';
import Chat from './pages/Chat';
```

These are statically imported, meaning their heavy dependency trees (`react-date-range`, `luxon`, `recharts`, `@ethora/chat-component` with XMPP, etc.) are bundled into the **main chunk** downloaded by every user — even if they never visit those pages.

All other admin pages are already `lazy()`. These two should be too.

**Fix:** Convert to `const AppStatistics = lazy(() => import('./pages/AppStatistics'))` and same for `Chat`.

---

### P1 — Whole-store Zustand subscription causes unnecessary re-renders

**File:** `src/pages/Chat.tsx:98`

```ts
const { currentUser } = useAppStore((s) => s);
```

`useAppStore((s) => s)` subscribes to the **entire store**. Any change to any store property (apps list, AI widget values, etc.) triggers a re-render of `ChatPage` and its heavy child tree.

**Fix:** Use a narrow selector: `useAppStore((s) => s.currentUser)`.

---

### P2 — `console.log` calls ship to production

Vite does **not** strip `console.log` from production builds by default. These log on every render / connection event:

| File | Line | Output |
|------|------|--------|
| `src/pages/AdminApps.tsx` | 176 | `console.log('newShowModal', newShowModal)` — fires every render |
| `src/hooks/useCentrifuge.ts` | 32 | `console.log('[centrifuge] getToken CALLED!')` |
| `src/hooks/useCentrifuge.ts` | 63 | `console.log('[centrifuge] connected')` |

**Fix:** Remove these calls, or add `esbuild: { drop: ['console'] }` to `vite.config.ts` build config.

---

### P2 — No vendor chunk splitting in Vite config

**File:** `vite.config.ts`

There is no `manualChunks` configuration, so Rollup packs all vendor code into one or two large files. Heavy libraries (`firebase`, `ethers`, `@mui/*`, `recharts`, `react-syntax-highlighter`) all end up together.

**Fix:** Add `manualChunks` to split vendor code by domain (UI framework, Web3, charts, etc.), enabling better browser caching.

---

### P2 — Suspense fallback is `null` — blank screen during chunk loads

**File:** `src/AppLayout.tsx:19`

```tsx
<Suspense fallback={null}>
```

When lazy-loaded chunks are downloading, users see a blank screen instead of a spinner.

**Fix:** Use `<Suspense fallback={<Loading />}>`.

---

### P3 — Duplicate Web3 libraries

**File:** `package.json`

Both `ethers` v6 and `@ethersproject/providers` v5 are listed. These overlap significantly (ethers v6 includes its own providers).

**Fix:** Consolidate to one if possible, remove unused package.

---

### P3 — Heavy dependencies loaded unconditionally

- `react-syntax-highlighter` + Prism theme is imported from the AI widget code tab — inflates whatever chunk it lands in
- `firebase` is initialized on every app load even if user doesn't use Firebase auth
- `@stripe/stripe-js` loads Stripe's external JS regardless of whether user visits billing

**Fix:** Dynamic `import()` for these, loading them only when the relevant feature is accessed.

---

### P3 — No API response caching

There is no React Query, SWR, or any caching layer. Every navigation re-fetches data from the server, showing spinners each time.

**Fix:** Consider adding React Query or SWR for stale-while-revalidate caching to make navigation feel instant.

---

## Quick Reference

| Priority | Fix | Expected Impact |
|----------|-----|-----------------|
| **P0** | Remove `sleep(1000)` from `actions.ts:71` | Saves 1 full second on every page load |
| **P1** | Lazy-load `AppStatistics` and `Chat` in `router.tsx` | Reduces initial bundle by ~200-400KB |
| **P1** | Fix `useAppStore((s) => s)` in `Chat.tsx:98` to narrow selector | Eliminates cascading re-renders |
| **P2** | Remove production `console.log` calls | Cleaner perf, less GC pressure |
| **P2** | Add `manualChunks` in Vite config for vendor splitting | Better caching, smaller initial load |
| **P2** | Add `<Loading />` as Suspense fallback | Better perceived performance |
| **P3** | Add `drop: ['console']` to Vite build config | Strips all console in production |
| **P3** | Remove `@ethersproject/providers` if unused | Smaller bundle |
| **P3** | Consider React Query / SWR for API caching | Eliminates redundant fetches |

---

## Notes on browser console logs

The vast majority of console output observed at https://app.chat.ethora.com/ comes from the **1Password browser extension** (`background.js`, `chunk-WGV2DF5U.js`) — `NmLockState`, `Theme`, `SignInWith`, `Fill` messages. These are unrelated to Ethora and can be safely ignored.
