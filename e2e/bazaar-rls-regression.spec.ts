/**
 * Bazaar RLS Regression
 * ---------------------
 * Verifies that anonymous callers (public anon key, no session) can NEVER
 * read PII (email, phone, address) or internal notes (admin_note, buyer_notes,
 * shipping_address, admin_notes, resolution_note, details, evidence_urls)
 * from bazaar_* tables.
 *
 * Private tables — anon MUST get zero rows:
 *   - bazaar_orders
 *   - bazaar_order_messages
 *   - bazaar_messages
 *   - bazaar_disputes
 *   - bazaar_item_reports
 *   - bazaar_transactions
 *   - bazaar_seller_verifications (may allow limited public read; PII must be hidden)
 *
 * Public tables — reads allowed, but PII/internal fields must never appear:
 *   - bazaar_seller_ratings
 *
 * Run: bunx playwright test e2e/bazaar-rls-regression.spec.ts --project=chromium
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

const PII_KEYS = [
  "email",
  "buyer_email",
  "seller_email",
  "phone",
  "phone_number",
  "address",
  "shipping_address",
  "raw_location",
  "ip_address",
  "admin_note",
  "admin_notes",
  "buyer_notes",
  "resolution_note",
  "details",
  "description",
  "evidence_urls",
  "stripe_session_id",
  "stripe_payment_intent_id",
];

const PRIVATE_TABLES = [
  "bazaar_orders",
  "bazaar_order_messages",
  "bazaar_messages",
  "bazaar_disputes",
  "bazaar_item_reports",
  "bazaar_transactions",
];

test.describe("Bazaar RLS — anon must NOT read private order/message tables", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  for (const table of PRIVATE_TABLES) {
    test(`${table}: anon SELECT returns zero rows`, async ({ page }) => {
      const res = await anonSelect(page, table, "*", 5);

      // Table must still exist in schema (catch drift early).
      expect(res.errorCode, `schema drift on ${table}: ${res.errorMessage}`)
        .not.toBe("PGRST205");
      expect(res.errorCode, `table missing: ${table}`).not.toBe("42P01");

      expect(
        res.rows.length,
        `LEAK: anon received ${res.rows.length} row(s) from ${table}`,
      ).toBe(0);
    });
  }
});

test.describe("Bazaar RLS — public tables must not leak PII / internal notes", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("bazaar_seller_ratings does not expose PII or internal fields", async ({ page }) => {
    const res = await anonSelect(page, "bazaar_seller_ratings", "*", 5);
    expect(res.errorCode, `unexpected error: ${res.errorMessage}`).toBeNull();
    for (const row of res.rows as Array<Record<string, unknown>>) {
      for (const forbidden of PII_KEYS) {
        expect(
          row[forbidden],
          `LEAK: bazaar_seller_ratings exposed ${forbidden}`,
        ).toBeUndefined();
      }
    }
  });

  test("bazaar_seller_verifications does not expose admin_note or PII", async ({ page }) => {
    const res = await anonSelect(page, "bazaar_seller_verifications", "*", 5);
    // Either RLS hides the row entirely (rows === 0) or public view strips PII.
    for (const row of res.rows as Array<Record<string, unknown>>) {
      for (const forbidden of PII_KEYS) {
        expect(
          row[forbidden],
          `LEAK: bazaar_seller_verifications exposed ${forbidden}`,
        ).toBeUndefined();
      }
    }
  });

  test("bazaar_seller_ratings: targeted PII columns are rejected outright", async ({ page }) => {
    // Requesting an explicit PII column must fail at the API layer, not silently return null.
    for (const col of ["admin_note", "buyer_notes", "shipping_address", "email", "phone"]) {
      const res = await anonSelect(page, "bazaar_seller_ratings", col, 1);
      expect(
        res.errorCode,
        `bazaar_seller_ratings should reject select of ${col} (got rows=${res.rows.length})`,
      ).not.toBeNull();
    }
  });
});
