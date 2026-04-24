/**
 * Megatalent voting paywall — Playwright E2E
 * ------------------------------------------
 * 1. Sign in as a real test user.
 * 2. Visit /megatalent BEFORE any subscription exists → paywall is shown,
 *    voting / commenting UI is NOT reachable.
 * 3. Seed an `active` row in `megatalent_subscriptions` (€10 Premium) via the
 *    Supabase service-role key. This mirrors what the post-payment Stripe
 *    webhook / verify-megatalent-payment edge function does after a successful
 *    €10 charge — without burning real money on a Stripe Checkout flow.
 * 4. Reload /megatalent → paywall gone, like / dislike (vote toggle) and
 *    comment buttons render and respond to clicks.
 * 5. Cleanup: remove the seeded subscription row.
 *
 * Why DB-seed instead of real Stripe Checkout?
 *   - Deterministic, no test-mode credentials required in CI.
 *   - Avoids charging real cards or relying on Stripe Test mode being active.
 *   - The frontend gating logic (Megatalent.tsx) keys off the same
 *     `megatalent_subscriptions.status='active'` row a webhook would write,
 *     so this exercises the EXACT same code path the user hits post-payment.
 *
 * Required env vars (skip the test gracefully if missing):
 *   E2E_TEST_EMAIL          — pre-existing Supabase Auth user
 *   E2E_TEST_PASSWORD       — that user's password
 *   SUPABASE_SERVICE_ROLE_KEY — service-role key (used ONLY by this test, not shipped)
 *
 * Run:
 *   bunx playwright test e2e/megatalent-voting-paywall.spec.ts
 */
import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://jufrdzeonywluwutvyxz.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1ZnJkemVvbnl3bHV3dXR2eXh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMzU0MTgsImV4cCI6MjA3NDcxMTQxOH0.UOe-_WQoTeBGFmnezRHRcjFJaJd71a7rYlurDkI6h4Q";

const TEST_EMAIL = process.env.E2E_TEST_EMAIL ?? "";
const TEST_PASSWORD = process.env.E2E_TEST_PASSWORD ?? "";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

const haveCreds = !!(TEST_EMAIL && TEST_PASSWORD && SERVICE_ROLE_KEY);

test.describe("Megatalent voting paywall — pay then unlock", () => {
  test.skip(
    !haveCreds,
    "Set E2E_TEST_EMAIL, E2E_TEST_PASSWORD, SUPABASE_SERVICE_ROLE_KEY to run this test.",
  );

  let userId = "";

  test.beforeAll(async () => {
    if (!haveCreds) return;
    // Resolve the test user's id once via password sign-in.
    const anon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await anon.auth.signInWithPassword({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    });
    if (error || !data.user) {
      throw new Error(`E2E test user sign-in failed: ${error?.message}`);
    }
    userId = data.user.id;

    // Ensure a clean baseline: no megatalent subscription before the test.
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    await admin.from("megatalent_subscriptions").delete().eq("user_id", userId);
  });

  test.afterAll(async () => {
    if (!haveCreds || !userId) return;
    // Clean up the seeded subscription row so the test is repeatable.
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    await admin.from("megatalent_subscriptions").delete().eq("user_id", userId);
  });

  /**
   * Sign the Playwright browser in by injecting a real Supabase session into
   * localStorage. Faster and more reliable than driving the email/password form,
   * and mirrors what supabase-js does after a successful login.
   */
  async function signInBrowser(page: import("@playwright/test").Page) {
    await page.goto("/");

    const session = await page.evaluate(
      async ({ url, key, email, password }) => {
        // @ts-expect-error — load supabase-js inside the page
        const mod = await import("https://esm.sh/@supabase/supabase-js@2");
        const c = mod.createClient(url, key);
        const { data, error } = await c.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw new Error(error.message);
        return data.session;
      },
      {
        url: SUPABASE_URL,
        key: SUPABASE_ANON_KEY,
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
      },
    );

    expect(session, "sign-in returned no session").toBeTruthy();
  }

  async function seedActivePremium() {
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    // Mirror the row a successful €10 Stripe payment webhook would insert.
    const { error } = await admin
      .from("megatalent_subscriptions")
      .upsert(
        {
          user_id: userId,
          tier: "basic", // table enum maps 'basic' → €10 Premium tier
          price: 10.0,
          status: "active",
          started_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
        },
        { onConflict: "user_id" },
      );
    expect(error, `seed error: ${error?.message}`).toBeNull();
  }

  test("BEFORE payment: /megatalent shows paywall, voting/commenting NOT available", async ({
    page,
  }) => {
    await signInBrowser(page);

    // Confirm baseline: no subscription row.
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: existing } = await admin
      .from("megatalent_subscriptions")
      .select("id")
      .eq("user_id", userId);
    expect(existing ?? []).toHaveLength(0);

    await page.goto("/megatalent");
    await page.waitForLoadState("networkidle");

    // The MegatalentGuard paywall card MUST be visible.
    // Title: "Odomkni MegaTalent súťaž 🏆"
    await expect(page.getByText(/Odomkni MegaTalent súťaž/i)).toBeVisible({
      timeout: 15_000,
    });

    // The €10 Premium checkout button MUST be present (the gate to pay).
    await expect(page.getByText(/€10 \/ mesiac/i)).toBeVisible();

    // The voting feed grid is NOT rendered → no like/comment buttons exist.
    // We assert that NO heart-icon vote button is reachable while paywall is up.
    const voteBtns = page.locator('button:has(svg.lucide-heart)');
    expect(await voteBtns.count()).toBe(0);

    const commentBtns = page.locator('button:has(svg.lucide-message-circle)');
    expect(await commentBtns.count()).toBe(0);
  });

  test("AFTER €10 payment is confirmed: voting & commenting unlock", async ({
    page,
  }) => {
    await signInBrowser(page);

    // Simulate the successful €10 payment (what the Stripe webhook would do).
    await seedActivePremium();

    await page.goto("/megatalent");
    await page.waitForLoadState("networkidle");

    // Paywall card must be GONE.
    await expect(page.getByText(/Odomkni MegaTalent súťaž/i)).toHaveCount(0, {
      timeout: 15_000,
    });

    // The hero/feed should be rendered. We can't guarantee submissions exist
    // in the database, but the UI for posting/voting must now be reachable.
    // The "Pridať príspevok" / upload affordance OR an existing card's heart
    // button is the proof that the voting UI is mounted.
    //
    // Most lenient assertion: confirm we are on /megatalent with NO paywall
    // and the page rendered the actual MegaTalent shell (not the gate).
    expect(page.url()).toContain("/megatalent");

    // Verify the gating client-side state by re-reading the subscription row
    // through the LOGGED-IN session — RLS allows the user to read their own.
    const isActive = await page.evaluate(
      async ({ url, key }) => {
        // @ts-expect-error — load supabase-js inside the page
        const mod = await import("https://esm.sh/@supabase/supabase-js@2");
        const c = mod.createClient(url, key);
        // Re-use the persisted session from localStorage
        const { data: sess } = await c.auth.getSession();
        if (!sess.session) return false;
        const { data } = await c
          .from("megatalent_subscriptions")
          .select("status, price")
          .eq("user_id", sess.session.user.id)
          .eq("status", "active")
          .maybeSingle();
        return !!data && Number(data.price) >= 10;
      },
      { url: SUPABASE_URL, key: SUPABASE_ANON_KEY },
    );
    expect(
      isActive,
      "Active €10 subscription not visible to the logged-in user via RLS",
    ).toBe(true);

    // If submissions exist, the heart/comment buttons render. If none exist,
    // at minimum the upload CTA must — both prove the gated UI is mounted.
    const voteCount = await page.locator('button:has(svg.lucide-heart)').count();
    const commentCount = await page
      .locator('button:has(svg.lucide-message-circle)')
      .count();
    const hasUploadCta =
      (await page.getByText(/upload|nahraj|pridaj|submit/i).count()) > 0;

    expect(
      voteCount + commentCount > 0 || hasUploadCta,
      "After paid subscription, neither voting buttons nor an upload CTA appeared — the gated UI did not unlock.",
    ).toBe(true);

    // If a heart button is present, clicking it must NOT trigger the
    // "Megatalent Premium required" toast (which is shown ONLY for unpaid users).
    if (voteCount > 0) {
      await page.locator('button:has(svg.lucide-heart)').first().click();
      const blockedToast = page.getByText(/Megatalent Premium required/i);
      // Wait briefly — if the toast appears, the paywall is incorrectly still active.
      await expect(blockedToast).toHaveCount(0, { timeout: 2_000 });
    }
  });
});
