/**
 * E2E — Authenticated Anonymous Dating partner rendering after refresh.
 *
 * What this test does:
 *   1. Logs in via supabase-js using a real test account (credentials supplied
 *      via env vars — no plaintext in the repo).
 *   2. Optionally seeds two `anonymous_dating_profiles` rows + an active
 *      `anonymous_dating_matches` row using the SERVICE ROLE key so the test
 *      is fully deterministic. If the service role key is NOT supplied, the
 *      test assumes seed data already exists (e.g. created manually in
 *      Supabase Studio for staging).
 *   3. Navigates to /anonymous-date, opens the "matches" view, and asserts
 *      the partner's anonymous_name, age_range, and at least one interest
 *      are visible.
 *   4. Performs `page.reload()` and re-asserts the same data is rendered —
 *      proving the enrichment in `useAnonymousDate` survives a full refresh
 *      (auth session restored from storage → matches refetched → partner
 *      profiles re-joined → ActiveMatches re-renders correctly).
 *   5. Cleans up seeded rows when service role is available.
 *
 * Required env vars (all optional; test skips when missing — never fails CI
 * just because credentials weren't provisioned):
 *
 *   E2E_TEST_USER_EMAIL           Email of an existing confirmed test account.
 *   E2E_TEST_USER_PASSWORD        Password for that account.
 *   E2E_TEST_USER_ID              auth.users.id of the test account (UUID).
 *   E2E_TEST_PARTNER_USER_ID      auth.users.id of the partner account (UUID).
 *   SUPABASE_SERVICE_ROLE_KEY     Optional — enables auto seed + cleanup.
 *
 * Run locally:
 *   E2E_TEST_USER_EMAIL=... E2E_TEST_USER_PASSWORD=... \
 *   E2E_TEST_USER_ID=... E2E_TEST_PARTNER_USER_ID=... \
 *   SUPABASE_SERVICE_ROLE_KEY=... \
 *     bunx playwright test e2e/anonymous-date-authed-refresh.spec.ts
 */
import { test, expect, type Page } from "@playwright/test";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://jufrdzeonywluwutvyxz.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1ZnJkemVvbnl3bHV3dXR2eXh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMzU0MTgsImV4cCI6MjA3NDcxMTQxOH0.UOe-_WQoTeBGFmnezRHRcjFJaJd71a7rYlurDkI6h4Q";

const EMAIL = process.env.E2E_TEST_USER_EMAIL;
const PASSWORD = process.env.E2E_TEST_USER_PASSWORD;
const ME_ID = process.env.E2E_TEST_USER_ID;
const PARTNER_ID = process.env.E2E_TEST_PARTNER_USER_ID;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const HAS_CREDENTIALS = Boolean(EMAIL && PASSWORD && ME_ID && PARTNER_ID);

// Deterministic fixture data — chosen to be unmistakable in the rendered DOM
// and very unlikely to collide with any real user-generated content.
const PARTNER_NAME = "E2E Mystic Phoenix";
const PARTNER_AGE = "28-32";
const PARTNER_INTERESTS = ["e2e-yoga", "e2e-chess"];

let createdMatchId: string | null = null;
let admin: SupabaseClient | null = null;

async function seedFixtures(): Promise<void> {
  if (!SERVICE_ROLE_KEY) {
    // No service role key — assume the operator has manually seeded a profile
    // for PARTNER_ID and a match between ME_ID and PARTNER_ID.
    return;
  }
  admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Upsert partner profile so our assertions match exact values.
  const { error: profileErr } = await admin
    .from("anonymous_dating_profiles")
    .upsert(
      {
        user_id: PARTNER_ID!,
        anonymous_name: PARTNER_NAME,
        age_range: PARTNER_AGE,
        interests: PARTNER_INTERESTS,
      },
      { onConflict: "user_id" },
    );
  if (profileErr) throw new Error(`seed partner profile: ${profileErr.message}`);

  // Ensure the logged-in user has SOME profile row (RLS for matches lookup
  // doesn't depend on it, but UI may guard the matches view). Best-effort.
  await admin
    .from("anonymous_dating_profiles")
    .upsert(
      {
        user_id: ME_ID!,
        anonymous_name: "E2E Tester",
        age_range: "25-30",
        interests: ["e2e-test"],
      },
      { onConflict: "user_id" },
    );

  // Create a fresh active match for this run.
  const { data: match, error: matchErr } = await admin
    .from("anonymous_dating_matches")
    .insert({
      user1_id: ME_ID!,
      user2_id: PARTNER_ID!,
      status: "active",
      expires_at: new Date(Date.now() + 7 * 86400000).toISOString(),
    })
    .select("id")
    .single();
  if (matchErr) throw new Error(`seed match: ${matchErr.message}`);
  createdMatchId = match.id;
}

async function cleanupFixtures(): Promise<void> {
  if (!admin || !createdMatchId) return;
  await admin.from("anonymous_dating_matches").delete().eq("id", createdMatchId);
  createdMatchId = null;
}

/**
 * Logs the test user in by calling supabase-js inside the page so the session
 * is persisted in localStorage exactly the way the real app expects it.
 */
async function loginInPage(page: Page): Promise<void> {
  await page.goto("/");
  const result = await page.evaluate(
    async ({ url, key, email, password }) => {
      const mod = await import("https://esm.sh/@supabase/supabase-js@2");
      const client = mod.createClient(url, key, {
        auth: {
          storage: window.localStorage,
          persistSession: true,
          autoRefreshToken: true,
        },
      });
      const { data, error } = await client.auth.signInWithPassword({ email, password });
      return { ok: !error, userId: data?.user?.id ?? null, error: error?.message ?? null };
    },
    { url: SUPABASE_URL, key: SUPABASE_ANON_KEY, email: EMAIL!, password: PASSWORD! },
  );
  if (!result.ok) {
    throw new Error(`Failed to log in test user: ${result.error}`);
  }
  expect(result.userId).toBe(ME_ID);
}

test.describe("Anonymous Dating — authenticated partner rendering survives refresh", () => {
  test.skip(!HAS_CREDENTIALS, "Skipped: provide E2E_TEST_USER_EMAIL/PASSWORD/USER_ID/PARTNER_USER_ID env vars to run.");

  test.beforeAll(async () => {
    await seedFixtures();
  });

  test.afterAll(async () => {
    await cleanupFixtures();
  });

  test("partner name, age range, and interests render after login and persist after refresh", async ({ page }) => {
    await loginInPage(page);

    // Navigate to the dating hub and switch into the matches view.
    await page.goto("/anonymous-date?view=matches");

    // Wait for the matches list to render. The hook fetches asynchronously,
    // so allow generous time for first paint after login.
    const partnerName = page.getByText(PARTNER_NAME, { exact: true });
    await expect(partnerName).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(PARTNER_AGE, { exact: true })).toBeVisible();
    for (const interest of PARTNER_INTERESTS) {
      await expect(page.getByText(interest, { exact: true })).toBeVisible();
    }

    // ─── The actual regression check ───────────────────────────────────────
    // Refresh the page. Auth comes back from localStorage, the hook re-runs
    // its fetchActiveMatches → enrichment query, and the UI must still show
    // the same partner identity. If RLS, schema, or the join logic regress,
    // the partner data will silently disappear after this reload.
    await page.reload();

    await expect(page.getByText(PARTNER_NAME, { exact: true })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(PARTNER_AGE, { exact: true })).toBeVisible();
    for (const interest of PARTNER_INTERESTS) {
      await expect(page.getByText(interest, { exact: true })).toBeVisible();
    }
  });
});
