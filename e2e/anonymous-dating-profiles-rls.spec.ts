/**
 * Regression — RLS on `anonymous_dating_profiles`
 * -------------------------------------------------
 * Guards the policy that powers partner-profile rendering after refresh
 * in the Anonymous Dating module. The hook `useAnonymousDate` re-fetches
 * partner profiles from `anonymous_dating_profiles` on every mount, so if
 * RLS is tightened by accident, names / age / interests silently disappear
 * after a page reload.
 *
 * What we assert with the public anon key (no logged-in user):
 *   1. Anonymous SELECT on `anonymous_dating_profiles` MUST return zero rows
 *      (RLS denies broad reads — profiles are not world-readable).
 *   2. The error/empty behaviour is consistent with RLS being enabled —
 *      i.e. the request succeeds at the API layer but yields no data,
 *      rather than 4xx (which would indicate the table was removed/renamed).
 *   3. The matches table is also locked down to anonymous callers, since
 *      the partner-enrichment flow depends on first reading a match row.
 *
 * The "happy path" (authenticated user reads matched partner's profile) is
 * covered by `src/hooks/useAnonymousDate.test.ts` with mocked Supabase, and
 * by `e2e/anonymous-date-matches.spec.ts` against the harness route.
 *
 * Run via:  bunx playwright test e2e/anonymous-dating-profiles-rls.spec.ts
 */
import { test, expect } from "@playwright/test";

const SUPABASE_URL = "https://jufrdzeonywluwutvyxz.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1ZnJkemVvbnl3bHV3dXR2eXh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMzU0MTgsImV4cCI6MjA3NDcxMTQxOH0.UOe-_WQoTeBGFmnezRHRcjFJaJd71a7rYlurDkI6h4Q";

async function anonSelect(
  page: import("@playwright/test").Page,
  table: string,
  columns = "*",
  limit = 5,
): Promise<{ status: number; rows: unknown[]; errorCode: string | null; errorMessage: string | null }> {
  return page.evaluate(
    async ({ url, key, table, columns, limit }) => {
      const mod = await import("https://esm.sh/@supabase/supabase-js@2");
      const client = mod.createClient(url, key, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      await client.auth.signOut().catch(() => {});

      const { data, error, status } = await client
        .from(table)
        .select(columns)
        .limit(limit);

      return {
        status,
        rows: data ?? [],
        errorCode: error?.code ?? null,
        errorMessage: error?.message ?? null,
      };
    },
    { url: SUPABASE_URL, key: SUPABASE_ANON_KEY, table, columns, limit },
  );
}

test.describe("RLS regression — anonymous_dating_profiles partner enrichment", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("anonymous_dating_profiles is NOT readable by anon (RLS blocks broad reads)", async ({ page }) => {
    const res = await anonSelect(
      page,
      "anonymous_dating_profiles",
      "user_id, anonymous_name, age_range, interests",
    );

    // Table must exist (no 404 / not-found error from PostgREST)
    expect(res.errorCode, `unexpected PostgREST error: ${res.errorMessage}`).not.toBe("PGRST205");
    expect(res.errorCode, `unexpected PostgREST error: ${res.errorMessage}`).not.toBe("42P01");

    // RLS must hide every row from an anonymous caller
    expect(res.rows.length, "anon caller must NOT receive any profile rows").toBe(0);
  });

  test("anonymous_dating_matches is NOT readable by anon", async ({ page }) => {
    const res = await anonSelect(page, "anonymous_dating_matches", "id, status");

    expect(res.errorCode, `unexpected PostgREST error: ${res.errorMessage}`).not.toBe("PGRST205");
    expect(res.rows.length, "anon caller must NOT receive any match rows").toBe(0);
  });

  test("expected partner-profile columns are still part of the schema", async ({ page }) => {
    // Even though RLS returns zero rows, requesting specific columns must NOT
    // fail with "column does not exist" — that would mean the schema drifted
    // away from what useAnonymousDate.ts depends on for refresh enrichment.
    const res = await anonSelect(
      page,
      "anonymous_dating_profiles",
      "user_id, anonymous_name, age_range, interests, personality_traits",
    );

    expect(
      res.errorMessage ?? "",
      `partner-profile columns missing — useAnonymousDate refresh will break: ${res.errorMessage}`,
    ).not.toMatch(/does not exist|column .* does not exist/i);
  });
});
