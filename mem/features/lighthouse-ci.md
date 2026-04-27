---
name: lighthouse ci
description: Per-PR perf audit with LCP/CLS/TBT budgets, runs against vite preview, uploads reports to temporary public storage
type: feature
---

## What runs
- Workflow: `.github/workflows/lighthouse.yml` — on PR + push to main + manual dispatch.
- Builds the prod bundle, starts `vite preview` on port 4173, runs `lhci autorun`.
- Reports uploaded to **temporary-public-storage** (link printed in CI logs, kept ~7 days). Also archived as a GitHub artifact for 14 days.

## Routes audited
Unauthenticated only — Lighthouse can't log in without bespoke auth scripts.
- `/` (landing)
- `/auth`
- `/pricing`

When adding a new public marketing route, add it to `lighthouserc.cjs > collect.url`.

## Budgets (in `lighthouserc.cjs > assert.assertions`)

| Metric | Threshold | Severity |
|---|---|---|
| Performance score | ≥ 0.75 | warn |
| LCP | ≤ 2500 ms | warn |
| CLS | ≤ 0.1 | warn |
| TBT | ≤ 300 ms | warn |
| TTI | ≤ 4000 ms | warn |
| Speed Index | ≤ 4000 ms | warn |
| Total bytes | ≤ 4.5 MB | **error** (matches our bundle budget) |
| Unused JS | ≤ 250 KB | warn |
| Render-blocking | ≤ 600 ms | warn |

`total-byte-weight` is the only **hard fail** — it backstops the 350 KB first-load JS budget from `mem://features/bundle-size`. Everything else is `warn` so CI doesn't block on noisy CWV measurements until we've done a dedicated perf audit pass.

## Local usage
```
bun run build
bun run lh           # full autorun (collect + assert + upload)
bun run lh:collect   # just collect, no assertions/upload
```

## Do NOT
- Loosen `total-byte-weight` without first cutting code from the bundle (see `mem://features/bundle-size` non-lazy import rules).
- Add authenticated routes here — write a separate `lhci-auth.config.cjs` with a Puppeteer login script if needed.
- Set assertions to `error` en masse without first running 3+ baseline runs to verify variance — Lighthouse on GH Actions has ±10% noise on TBT.
