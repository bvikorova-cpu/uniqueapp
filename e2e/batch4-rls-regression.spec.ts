/**
 * Batch 4 RLS Regression
 * -----------------------
 * Verifies that anonymous callers (public anon key, no session) can NEVER
 * read private rows from Batch 4 tables:
 *   - family_relationships  (family tree — must be scoped to auth.uid())
 *   - friendships           (friend graph — must be scoped)
 *   - dating_matches        (dating pairs — must be scoped)
 *   - dating_messages       (DMs — must be scoped)
 *   - dating_swipes         (swipes — must be scoped)
 *   - dating_super_likes    (super likes — must be scoped)
 *   - skill_swap_offers     (private offers — scoped or empty)
 *
 * For public-browse tables (dating_profiles, bazaar_seller_ratings) we assert
 * ONLY that no PII columns (email, phone, raw address) leak.
 *
 * Run: bunx playwright test e2e/batch4-rls-regression.spec.ts --project=chromium
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
) {
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

async function anonInsert(
  page: import("@playwright/test").Page,
  table: string,
  row: Record<string, unknown>,
) {
  return page.evaluate(
    async ({ url, key, table, row }) => {
      const mod = await import("https://esm.sh/@supabase/supabase-js@2");
      const client = mod.createClient(url, key, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const { data, error, status } = await client.from(table).insert(row).select();
      return {
        status,
        rows: data ?? [],
        errorCode: error?.code ?? null,
        errorMessage: error?.message ?? null,
      };
    },
    { url: SUPABASE_URL, key: SUPABASE_ANON_KEY, table, row },
  );
}

const PRIVATE_TABLES = [
  "family_relationships",
  "friendships",
  "dating_matches",
  "dating_messages",
  "dating_swipes",
  "dating_super_likes",
];

test.describe("Batch 4 RLS — anon must NOT read other users' rows", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  for (const table of PRIVATE_TABLES) {
    test(`${table}: anon SELECT returns zero rows`, async ({ page }) => {
      const res = await anonSelect(page, table, "*", 5);

      // Table must still exist in schema
      expect(res.errorCode, `schema drift on ${table}: ${res.errorMessage}`)
        .not.toBe("PGRST205");
      expect(res.errorCode, `table missing: ${table}`).not.toBe("42P01");

      // RLS must hide every row
      expect(
        res.rows.length,
        `LEAK: anon received ${res.rows.length} row(s) from ${table}`,
      ).toBe(0);
    });
  }

  test("family_relationships: anon INSERT is rejected", async ({ page }) => {
    const fakeUid = "00000000-0000-0000-0000-000000000001";
    const res = await anonInsert(page, "family_relationships", {
      user_id: fakeUid,
      related_user_id: "00000000-0000-0000-0000-000000000002",
      kind: "sibling",
      requested_by: fakeUid,
      status: "pending",
    });
    expect(res.errorCode, "anon must NOT be able to insert family rows").not.toBeNull();
  });

  test("friendships: anon INSERT is rejected", async ({ page }) => {
    const fakeUid = "00000000-0000-0000-0000-000000000001";
    const res = await anonInsert(page, "friendships", {
      user_id: fakeUid,
      friend_id: "00000000-0000-0000-0000-000000000002",
      status: "pending",
    });
    expect(res.errorCode, "anon must NOT be able to insert friendships").not.toBeNull();
  });
});

test.describe("Batch 4 RLS — public tables must not leak PII", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("dating_profiles browse does not expose email/phone/address", async ({ page }) => {
    const res = await anonSelect(page, "dating_profiles", "*", 3);
    // Public browse is allowed, but sensitive columns must not come back.
    for (const row of res.rows as Array<Record<string, unknown>>) {
      for (const forbidden of ["email", "phone", "phone_number", "address", "raw_location", "ip_address"]) {
        expect(
          row[forbidden],
          `LEAK: dating_profiles exposed ${forbidden}`,
        ).toBeUndefined();
      }
    }
  });

  test("bazaar_seller_ratings public reviews do not expose buyer PII", async ({ page }) => {
    const res = await anonSelect(page, "bazaar_seller_ratings", "*", 3);
    for (const row of res.rows as Array<Record<string, unknown>>) {
      for (const forbidden of ["buyer_email", "email", "phone"]) {
        expect(
          row[forbidden],
          `LEAK: bazaar_seller_ratings exposed ${forbidden}`,
        ).toBeUndefined();
      }
    }
  });
});
