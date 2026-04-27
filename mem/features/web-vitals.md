---
name: web vitals telemetry
description: Real-user CWV (LCP/CLS/INP/FCP/TTFB) collection, vitals_log table, admin chart at /admin/vitals
type: feature
---

## Pipeline
1. **Reporter** — `src/utils/webVitals.ts` subscribes via `web-vitals` (LCP/CLS/INP/FCP/TTFB), batches samples and POSTs to `vitals-ingest` with `keepalive: true` (also flushes on `visibilitychange=hidden` + `pagehide`).
2. **Ingest edge fn** — `supabase/functions/vitals-ingest` (verify_jwt = false). Validates metric whitelist + finite numeric, clamps strings, accepts ≤20 samples per request. Inserts via service-role key (RLS denies anon writes by design).
3. **Storage** — `public.vitals_log` (route, device, connection, rating, p-values stored raw).
4. **Aggregation** — SQL `get_vitals_summary(days, route)` and `get_vitals_daily(days, metric)` are SECURITY DEFINER + `has_role(auth.uid(),'admin')` guard. EXECUTE revoked from PUBLIC/anon.
5. **Admin UI** — `/admin/vitals` (`AdminVitals.tsx`). 5 metric cards (click to switch chart), distribution table with p50/p75/p95 and good %, daily p75 line chart with good/poor reference lines.

## Init point
`installWebVitals()` is called from `src/main.tsx` BEFORE `<App />` mounts so we capture earliest paint metrics. Sampling is 100% (`SAMPLE_RATE = 1`) — drop to 0.1–0.25 if traffic exceeds ~50 req/min on the ingest function.

## Thresholds (Core Web Vitals)
| Metric | good | poor |
|---|---|---|
| LCP  | ≤ 2500 ms | > 4000 ms |
| INP  | ≤ 200 ms  | > 500 ms |
| CLS  | ≤ 0.1     | > 0.25 |
| FCP  | ≤ 1800 ms | > 3000 ms |
| TTFB | ≤ 800 ms  | > 1800 ms |

p75 is the score Google uses for CrUX/CWV. Use the daily-p75 chart to decide when to flip Lighthouse CI assertions in `lighthouserc.cjs` from `warn` to `error`.

## Do NOT
- Insert into `vitals_log` from the client — RLS blocks it. Always go through the ingest function.
- Add a SELECT policy that's not gated on `has_role(... 'admin')` — sample data leaks user paths.
- Increase batch size > 20 without rate-limiting; the ingest function has no per-IP cap yet.
