# End-to-End Tests (Playwright)

Smoke tests that verify the public app loads without JavaScript errors and key
routes are reachable. These run in a real browser (Chromium) against a running
dev server or any deployed URL.

## First-time setup

```bash
bunx playwright install --with-deps chromium
```

## Run locally (against `bun run dev`)

```bash
bunx playwright test
```

Playwright will boot Vite on `http://localhost:8080` automatically (see
`playwright.config.ts` → `webServer`).

## Run against a deployed environment

```bash
PLAYWRIGHT_BASE_URL=https://uniqueapp.fun bunx playwright test
```

When `PLAYWRIGHT_BASE_URL` is set, the local dev server is skipped.

## What's covered

`e2e/smoke.spec.ts`:

- Homepage renders, has a non-empty body, and a sensible title.
- `/auth` route exposes auth controls (button or password input).
- `/marketplace`, `/jobs`, `/games`, `/dating` load with no uncaught
  JS errors (`pageerror` listener is empty).
- Unknown route falls through to the SPA's NotFound view.

## Adding new tests

Place `*.spec.ts` files inside `e2e/`. Use `test.describe` to group flows.
Avoid tests that require a real authenticated user or paid Stripe flows
in this folder — those belong in a separate gated suite.

## Why this is not in `bun run test`

Vitest (`src/**/*.test.ts`) is fast, headless, and runs in CI on every push.
Playwright needs browser binaries (~200 MB) and a running web server, so it's
opt-in: developers run it before merging large UI changes, and a separate CI
job can be added later when needed.
