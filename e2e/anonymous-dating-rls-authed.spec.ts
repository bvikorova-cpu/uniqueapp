/**
 * E2E — RLS enforcement for authenticated users (Anonymous Dating)
 * -----------------------------------------------------------------
 * After login, an authenticated user must:
 *   1. See ONLY anonymous_dating_profiles rows for partners they share an
 *      active/revealed match with — never the entire table.
 *   2. NOT receive sensitive identity columns (email, phone, real names,
 *      auth user ids of unrelated users) via the public REST API.
 *   3. See ONLY anonymous_dating_matches rows where they are user1_id or
 *      user2_id — never another user's matches.
 *
 * The test auto-skips if E2E credentials/seed env vars are missing so it
 * never breaks default `bunx playwright test` runs. To execute:
 *
 *   E2E_TEST_USER_EMAIL=...           \
 *   E2E_TEST_USER_PASSWORD=...        \
 *   E2E_TEST_USER_ID=<uuid>           \
 *   E2E_TEST_PARTNER_USER_ID=<uuid>   \
 *   E2E_TEST_OUTSIDER_USER_ID=<uuid>  \
 *   SUPABASE_SERVICE_ROLE_KEY=<key>   \
 *     bunx playwright test e2e/anonymous-dating-rls-authed.spec.ts
 *
 * E2E_TEST_OUTSIDER_USER_ID must be a real anonymous_dating_profiles row
 * that the logged-in user does NOT share a match with — used as the
 * negative control. SUPABASE_SERVICE_ROLE_KEY is optional but recommended:
 * it lets the test seed the match + partner profile deterministically and
 * (if needed) seed the outsider profile.
 */
import { test, expect } from "@playwright/test";

const SUPABASE_URL = "https://jufrdzeonywluwutvyxz.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1ZnJkemVvbnl3bHV3dXR2eXh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMzU0MTgsImV4cCI6MjA3NDcxMTQxOH0.UOe-_WQoTeBGFmnezRHRcjFJaJd71a7rYlurDkI6h4Q";

const EMAIL = process.env.E2E_TEST_USER_EMAIL;
const PASSWORD = process.env.E2E_TEST_USER_PASSWORD;
const USER_ID = process.env.E2E_TEST_USER_ID;
const PARTNER_ID = process.env.E2E_TEST_PARTNER_USER_ID;
const OUTSIDER_ID = process.env.E2E_TEST_OUTSIDER_USER_ID;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const ALL_REQUIRED = EMAIL && PASSWORD && USER_ID && PARTNER_ID && OUTSIDER_ID;

test.describe("RLS enforcement — authenticated user, Anonymous Dating", () => {
  test.skip(
    !ALL_REQUIRED,
    "Set E2E_TEST_USER_EMAIL/PASSWORD/USER_ID/PARTNER_USER_ID/OUTSIDER_USER_ID to run.",
  );

  let createdMatchId: string | null = null;
  let createdPartnerProfile = false;

  test.beforeAll(async () => {
    if (!SERVICE_ROLE_KEY) return;
    const { createClient } = await import("@supabase/supabase-js");
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // Ensure partner profile exists (so the user has SOMETHING they're
    // legitimately allowed to see).
    const { data: existingPartner } = await admin
      .from("anonymous_dating_profiles")
      .select("user_id")
      .eq("user_id", PARTNER_ID!)
      .maybeSingle();

    if (!existingPartner) {
      await admin.from("anonymous_dating_profiles").insert({
        user_id: PARTNER_ID!,
        anonymous_name: "RLS Partner",
        age_range: "28-32",
        interests: ["rls", "tests"],
      });
      createdPartnerProfile = true;
    }

    // Make sure the logged-in user also has a profile (some flows require it).
    await admin
      .from("anonymous_dating_profiles")
      .upsert(
        { user_id: USER_ID!, anonymous_name: "RLS Tester", age_range: "25-30", interests: ["qa"] },
        { onConflict: "user_id" },
      );

    // Ensure an outsider profile exists (negative control).
    await admin
      .from("anonymous_dating_profiles")
      .upsert(
        {
          user_id: OUTSIDER_ID!,
          anonymous_name: "Outsider",
          age_range: "40-45",
          interests: ["should-not-be-visible"],
        },
        { onConflict: "user_id" },
      );

    // Seed an active match between USER and PARTNER if none exists.
    const { data: existingMatch } = await admin
      .from("anonymous_dating_matches")
      .select("id")
      .or(
        `and(user1_id.eq.${USER_ID},user2_id.eq.${PARTNER_ID}),and(user1_id.eq.${PARTNER_ID},user2_id.eq.${USER_ID})`,
      )
      .in("status", ["active", "revealed"])
      .maybeSingle();

    if (!existingMatch) {
      const { data } = await admin
        .from("anonymous_dating_matches")
        .insert({
          user1_id: USER_ID!,
          user2_id: PARTNER_ID!,
          status: "active",
          expires_at: new Date(Date.now() + 7 * 86400000).toISOString(),
        })
        .select("id")
        .single();
      createdMatchId = data?.id ?? null;
    }
  });

  test.afterAll(async () => {
    if (!SERVICE_ROLE_KEY) return;
    const { createClient } = await import("@supabase/supabase-js");
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    if (createdMatchId) {
      await admin.from("anonymous_dating_matches").delete().eq("id", createdMatchId);
    }
    if (createdPartnerProfile) {
      await admin.from("anonymous_dating_profiles").delete().eq("user_id", PARTNER_ID!);
    }
  });

  test("authenticated user sees ONLY allowed partner profile rows via RLS", async ({ page }) => {
    await page.goto("/");

    const result = await page.evaluate(
      async ({ url, key, email, password, partnerId, outsiderId }) => {
        const mod = await import("https://esm.sh/@supabase/supabase-js@2");
        const client = mod.createClient(url, key, {
          auth: { persistSession: false, autoRefreshToken: false },
        });

        const { data: signIn, error: authErr } = await client.auth.signInWithPassword({
          email: email!,
          password: password!,
        });
        if (authErr || !signIn?.user) {
          return { phase: "auth", error: authErr?.message ?? "no user" };
        }

        // 1. Broad SELECT — RLS must NOT return the entire profiles table.
        const broad = await client
          .from("anonymous_dating_profiles")
          .select("user_id, anonymous_name, age_range, interests")
          .limit(1000);

        // 2. Targeted read of an OUTSIDER profile (no shared match) must be empty.
        const outsider = await client
          .from("anonymous_dating_profiles")
          .select("user_id, anonymous_name, age_range, interests")
          .eq("user_id", outsiderId!);

        // 3. Targeted read of the PARTNER profile must succeed.
        const partner = await client
          .from("anonymous_dating_profiles")
          .select("user_id, anonymous_name, age_range, interests")
          .eq("user_id", partnerId!);

        // 4. Matches table — every returned row MUST involve the logged-in user.
        const matches = await client
          .from("anonymous_dating_matches")
          .select("id, user1_id, user2_id, status")
          .limit(1000);

        await client.auth.signOut().catch(() => {});

        return {
          phase: "ok",
          userId: signIn.user.id,
          broad: { rows: broad.data ?? [], error: broad.error?.message ?? null },
          outsider: { rows: outsider.data ?? [], error: outsider.error?.message ?? null },
          partner: { rows: partner.data ?? [], error: partner.error?.message ?? null },
          matches: { rows: matches.data ?? [], error: matches.error?.message ?? null },
        };
      },
      {
        url: SUPABASE_URL,
        key: SUPABASE_ANON_KEY,
        email: EMAIL,
        password: PASSWORD,
        partnerId: PARTNER_ID,
        outsiderId: OUTSIDER_ID,
      },
    );

    expect(result.phase, `auth failed: ${(result as any).error}`).toBe("ok");
    expect(result.userId).toBe(USER_ID);

    // --- profiles: outsider must be invisible ---
    expect(
      result.outsider!.rows.length,
      "RLS leak: user can read a profile of someone they don't share a match with",
    ).toBe(0);

    // --- profiles: partner must be visible ---
    expect(
      result.partner!.rows.length,
      "RLS too tight: user cannot read their matched partner's profile",
    ).toBeGreaterThan(0);
    expect(result.partner!.rows[0].user_id).toBe(PARTNER_ID);

    // --- profiles: broad SELECT must NOT contain the outsider ---
    const broadIds = new Set(result.broad!.rows.map((r: any) => r.user_id));
    expect(
      broadIds.has(OUTSIDER_ID),
      "RLS leak: broad SELECT exposes profiles outside the user's matches",
    ).toBe(false);

    // Every visible profile must be either self or a known partner from a match.
    const allowedIds = new Set<string>([USER_ID!]);
    for (const m of result.matches!.rows) {
      const other = m.user1_id === USER_ID ? m.user2_id : m.user1_id;
      if (other) allowedIds.add(other);
    }
    for (const row of result.broad!.rows) {
      expect(
        allowedIds.has(row.user_id),
        `RLS leak: profile ${row.user_id} returned but user has no match with them`,
      ).toBe(true);
    }

    // --- matches: every row must involve the current user ---
    for (const m of result.matches!.rows) {
      expect(
        m.user1_id === USER_ID || m.user2_id === USER_ID,
        `RLS leak: match ${m.id} returned but does not involve the current user`,
      ).toBe(true);
    }
  });

  test("sensitive identity columns are NOT selectable on profiles", async ({ page }) => {
    await page.goto("/");

    const result = await page.evaluate(
      async ({ url, key, email, password }) => {
        const mod = await import("https://esm.sh/@supabase/supabase-js@2");
        const client = mod.createClient(url, key, {
          auth: { persistSession: false, autoRefreshToken: false },
        });

        const { error: authErr } = await client.auth.signInWithPassword({
          email: email!,
          password: password!,
        });
        if (authErr) return { phase: "auth", error: authErr.message };

        // Try to pull columns that should not exist on the anonymous profile
        // table (real names, emails, phone). Postgres must reject with
        // "column does not exist" — proving the schema doesn't carry PII.
        const probes = ["email", "phone", "real_name", "full_name"];
        const results: Record<string, string | null> = {};
        for (const col of probes) {
          const { error } = await client
            .from("anonymous_dating_profiles")
            .select(col)
            .limit(1);
          results[col] = error?.message ?? null;
        }

        await client.auth.signOut().catch(() => {});
        return { phase: "ok", results };
      },
      { url: SUPABASE_URL, key: SUPABASE_ANON_KEY, email: EMAIL, password: PASSWORD },
    );

    expect(result.phase).toBe("ok");
    for (const [col, err] of Object.entries(result.results!)) {
      expect(
        err ?? "",
        `Sensitive column "${col}" appears to exist on anonymous_dating_profiles — anonymity broken`,
      ).toMatch(/does not exist|column .* does not exist/i);
    }
  });
});
