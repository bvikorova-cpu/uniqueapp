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

## Authenticated tests (opt-in via env vars)

`anonymous-date-authed-refresh.spec.ts` logs in as a real test user, seeds
an `anonymous_dating_matches` row + partner profile, and verifies the
partner's name / age / interests render after a full page refresh.

It auto-skips when the required env vars are missing, so it never breaks
default `bunx playwright test` runs. To execute it:

```bash
E2E_TEST_USER_EMAIL=tester@example.com \
E2E_TEST_USER_PASSWORD='...'           \
E2E_TEST_USER_ID=<uuid>                \
E2E_TEST_PARTNER_USER_ID=<uuid>        \
SUPABASE_SERVICE_ROLE_KEY=<key>        \
  bunx playwright test e2e/anonymous-date-authed-refresh.spec.ts
```

`SUPABASE_SERVICE_ROLE_KEY` is optional — without it the test assumes the
match + partner profile already exist in the DB (manual seed) and skips
cleanup. Never commit any of these values.

### RLS enforcement test

`anonymous-dating-rls-authed.spec.ts` logs in as a real user and asserts
that Row-Level Security only exposes:

- the user's own profile,
- profiles of partners they share an active/revealed match with,
- matches where they are `user1_id` or `user2_id`.

It also probes for sensitive PII columns (`email`, `phone`, `real_name`,
`full_name`) and fails if any of them exist on `anonymous_dating_profiles`.

Requires one extra env var on top of the authed-refresh test:

```bash
E2E_TEST_OUTSIDER_USER_ID=<uuid of a profile the test user has NO match with>
```

Auto-skips when any required env var is missing.

### Cross-user (A ↔ B) Rewards test

`authed/friend-quest-cross-user.spec.ts` overuje skutočný cross-user flow
medzi dvomi rôznymi účtami: User A (z perzistovanej session) pošle
friend quest invite User B (REST sign-in), B akceptuje cez RPC a test
overí, že DB triggery vytvoria správne notifikácie pre obe strany
(`friend_quest_invite` pre B, `friend_quest_accepted` pre A) s
`related_id=invite.id` a `action_url=/rewards?tab=friend-quests`.

Auto-skips bez druhého účtu. Spustenie:

```bash
E2E_TEST_EMAIL_B=second.tester@example.com \
E2E_TEST_PASSWORD_B='...'                  \
  bunx playwright test e2e/authed/friend-quest-cross-user.spec.ts
```

Druhý účet musí byť reálne registrovaný (potvrdený email) v Supabase.

## Why this is not in `bun run test`

Vitest (`src/**/*.test.ts`) is fast, headless, and runs in CI on every push.
Playwright needs browser binaries (~200 MB) and a running web server, so it's
opt-in: developers run it before merging large UI changes, and a separate CI
job can be added later when needed.
