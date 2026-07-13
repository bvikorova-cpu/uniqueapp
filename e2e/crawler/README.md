# All-buttons crawler (pre-launch full audit)

Real Chromium (not iframe) walks every route in `src/utils/smokeTestRoutes.json`,
clicks every safe interactive element, and records evidence — page errors,
5xx/network failures, per-click outcome, screenshot on any failure.

## Run

```bash
# Uses the persisted QA session from e2e/.auth/authed-state.json.
bunx playwright test e2e/crawler/all-buttons-crawler.spec.ts \
  --project=chromium-authed --reporter=list

# Build report.html + summary.md from the raw JSON.
node e2e/crawler/generate-report.mjs
```

Outputs:

- `e2e/crawler-report/report.json` — one entry per route with full evidence.
- `e2e/crawler-report/report.html` — browsable, sorted by failure severity.
- `e2e/crawler-report/summary.md` — top failing routes (paste into PR).
- `e2e/crawler-report/screenshots/*.png` — one per failing route.

## Tunables

- `CRAWLER_ROUTE_LIMIT` — cap routes (default: all ~2800).
- `CRAWLER_START_INDEX` — resume from index.
- `CRAWLER_CLICKS_PER_ROUTE` — max clicks per route (default 40).
- `CRAWLER_ROUTE_TIMEOUT` — ms per `goto` (default 25 000).

Resume is automatic — the report is checkpointed every 5 routes, and rerunning
the spec skips routes already present in `report.json` (delete the file to
start fresh).

## What it does NOT do

- Never clicks destructive labels (delete, pay, checkout, withdraw, refund,
  logout, report, block, confirm, unsubscribe) — those need dedicated
  assertion-based tests in `e2e/authed/`.
- Doesn't drive multi-step wizards or verify DB state after a click. Use it
  as the pre-launch **smoke floor**: "no route throws, no click crashes,
  no backend 5xx". Then rely on targeted `authed/*.spec.ts` files for
  business-logic correctness (Stripe, credits, notifications, etc.).
