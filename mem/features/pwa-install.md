---
name: pwa install + offline shell
description: Service worker for offline shell + cache, beforeinstallprompt capture, install banner, iOS Share-sheet hint
type: feature
---

## Pieces
- `public/sw.js` — service worker. Network-first navigations, stale-while-revalidate same-origin assets, never-cache list for Supabase / Stripe / ads / GA. Pre-caches app shell + `/offline.html`. Bump `CACHE_VERSION` when shell changes.
- `public/offline.html` — branded offline fallback page (used when navigation request fails and no cached copy exists).
- `src/utils/registerSW.ts` — registers `/sw.js` after `load`. Skipped on dev unless `?sw=1` is set, to avoid Vite HMR conflicts. Reloads page on `controllerchange` so users always get the latest after SW update.
- `src/hooks/useInstallPrompt.ts` — captures `beforeinstallprompt`, exposes `promptInstall()`, detects iOS (no event there → return `canInstall=true` with `platform='ios'`). Dismissal is sticky for **14 days** via `localStorage`.
- `src/components/pwa/InstallPromptBanner.tsx` — bottom-anchored card. Shows after 8s delay, hidden when standalone or dismissed.
- Wired in `src/main.tsx` after `<App />`.

## Cache strategy
| Request | Strategy |
|---|---|
| Navigations (HTML) | network-first → cache → `/offline.html` |
| Same-origin static (js/css/img/font) | stale-while-revalidate |
| Supabase / Stripe / ads / GA | bypass entirely (NEVER cache) |
| POST/PUT/DELETE | bypass (only GET is touched) |

The "never cache" list lives in `NEVER_CACHE_HOST_PATTERNS` in `sw.js` — keep it in sync with any new auth/payment provider.

## iOS handling
Safari doesn't fire `beforeinstallprompt`. The hook returns `canInstall=true` + `platform='ios'` when not in standalone, and the banner shows the **Share → Add to Home Screen** instruction with a Share icon (no programmatic install button).

## Do NOT
- Cache anything from `*.supabase.co`, `*.stripe.com`, ads, or GA — would break auth, payments and analytics.
- Lower the 8s show delay or 14d dismissal — both were chosen to avoid nagging.
- Register SW in Vite dev (`import.meta.env.DEV`) without the `?sw=1` query — it breaks HMR.
- Forget to bump `CACHE_VERSION` in `sw.js` when changing shell URLs or strategy; otherwise old clients keep stale assets indefinitely.

## Testing checklist
1. `bun run build && bun run preview` → DevTools Application → Service Workers shows `sw.js` activated.
2. Throttle to **Offline** in DevTools, hard-reload `/` → branded offline page appears.
3. On Chromium, the install banner shows after 8s if site meets installability criteria.
4. On iOS Safari (real device), banner shows the Share-sheet hint.
