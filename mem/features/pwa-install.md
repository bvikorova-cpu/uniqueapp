---
name: pwa install + offline shell
description: vite-plugin-pwa (Workbox) config, guarded SW registration, install banner, iOS Share-sheet hint
type: feature
---

## Pieces
- `vite.config.ts` → `VitePWA({ registerType: "autoUpdate", injectRegister: null, filename: "sw.js", manifest: false })` — generates `dist/sw.js` at build time. Manifest is served manually from `public/manifest.webmanifest` (do not let the plugin emit one — we already have shortcuts + icons configured there).
- `public/service-worker.js` — kept only as a **kill-switch** for the old hand-written SW path some clients still request. Do not remove.
- `src/utils/registerSW.ts` — guarded registration using `workbox-window`. Registers `/sw.js` only when ALL are true:
  - `import.meta.env.PROD`
  - not in an iframe
  - hostname is NOT `id-preview--*`, `preview--*`, `*.lovableproject.com`, `*.lovableproject-dev.com`, `*.beta.lovable.dev`
  - URL does not have `?sw=off`
  Otherwise it **unregisters** any existing `/sw.js` or `/service-worker.js` so preview always loads fresh code.
- `src/hooks/useInstallPrompt.ts` — captures `beforeinstallprompt`, iOS returns `platform='ios'`, dismissal sticky 14 days.
- `src/components/pwa/InstallPromptBanner.tsx` — bottom card, 8s delay, hidden when standalone/dismissed.
- Wired in `src/main.tsx` after `<App />`.

## Cache strategy (Workbox runtimeCaching in vite.config.ts)
| Request | Strategy | Cache |
|---|---|---|
| HTML navigations | NetworkFirst (4s timeout) → cached shell | unique-html-v1 (24h) |
| Same-origin `/assets/*.{js,css,woff2}` | CacheFirst | unique-assets-v1 (30d) |
| Same-origin images | StaleWhileRevalidate | unique-images-v1 (14d) |
| Google Fonts | StaleWhileRevalidate | unique-fonts-v1 (1y) |
| Supabase / Stripe / GA / /functions/* | **Bypassed** (never cached) | — |

`navigateFallbackDenylist` excludes `/~oauth`, `/functions/*`, `/api/*`, `/auth/callback` from the SPA HTML fallback so those hit the network directly.

## Precache — kept small
`globPatterns: ["index.html", "assets/index-*.js", "assets/index-*.css", "assets/vendor-*.js", "*.webmanifest", "pwa-*.png", "favicon.ico"]`

~10 files / ~5 MB. Lazy route chunks and images are cached at runtime on first hit — avoids downloading tens of MB when the PWA is installed. Do NOT expand this pattern to `**/*.{js,css}` again (that grew to 22 MB / 808 files and made installs slow).

## Manifest — served manually
`public/manifest.webmanifest` is the source of truth (name, short_name, icons, shortcuts). Injected by a small script in `index.html` (skipped on Lovable preview hosts to avoid install prompts in the editor). Keep `manifest: false` in VitePWA config so the plugin doesn't emit a conflicting one.

## Do NOT
- Do NOT cache anything from `*.supabase.co`, `*.stripe.com`, ads, GA — breaks auth/payments/analytics.
- Do NOT hand-write `public/sw.js` — vite-plugin-pwa owns that filename at build time; a static file there would be overwritten anyway.
- Do NOT lower the 8s install-banner delay or 14d dismissal.
- Do NOT re-add the sitewide `unregister + caches.delete` loop that used to live in `index.html`. It was defeating the PWA cache and making the installed app slow. The only sanctioned unregister paths are: `?sw=off` (in `index.html`) and the guarded wrapper in `registerSW.ts` (hostile contexts).
- Do NOT change `filename` from `sw.js` without also updating the kill-switch path list in `registerSW.ts`.

## Escape hatch
Append `?sw=off` to any URL → the small inline script in `index.html` unregisters every SW registration for that origin. Useful when debugging a stuck cache without waiting for the auto-update flow.

## Testing checklist
1. `bun run build && bun run preview` → DevTools → Application → Service Workers shows `/sw.js` activated, workbox precache holds ~10 entries.
2. Throttle to **Offline**, hard-reload `/` → cached shell renders (blank body is OK — data calls fail, but the app boots).
3. Chromium: install banner shows after 8s if installability criteria met.
4. iOS Safari (real device): banner shows Share-sheet hint.
5. Deploy new version → open installed PWA → `controlling` event fires → auto reload → user sees new code.
