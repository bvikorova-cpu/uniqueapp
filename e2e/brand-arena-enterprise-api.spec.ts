import { test, expect } from "@playwright/test";

/**
 * Brand Arena — Enterprise REST API (X-API-Key flow on brand-arena-router).
 *
 * Coverage:
 *  1. No X-API-Key + no JWT  → 401 Unauthorized (falls through to JWT branch).
 *  2. Invalid X-API-Key (ba_live_...) → 401 invalid_api_key.
 *  3. Valid X-API-Key (env BRAND_ARENA_ENTERPRISE_API_KEY) →
 *       - GET ?action=me     → 200 { sponsor: { tier:"enterprise", subscription_status:"active" } }
 *       - GET ?action=votes  → 200 { brand_id, days, total, series:[] }
 *       - GET ?action=rank   → 200 { rank, total, total_votes }
 *     Skips gracefully when env var is missing so default CI runs stay green.
 */

const SUPABASE_URL =
  process.env.E2E_SUPABASE_URL ?? "https://jufrdzeonywluwutvyxz.supabase.co";
const SUPABASE_ANON_KEY =
  process.env.E2E_SUPABASE_ANON_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1ZnJkemVvbnl3bHV3dXR2eXh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMzU0MTgsImV4cCI6MjA3NDcxMTQxOH0.UOe-_WQoTeBGFmnezRHRcjFJaJd71a7rYlurDkI6h4Q";
const FN_URL = `${SUPABASE_URL}/functions/v1/brand-arena-router`;
const ENTERPRISE_KEY = process.env.BRAND_ARENA_ENTERPRISE_API_KEY;

test.describe("Brand Arena Enterprise API — auth gating", () => {
  test("rejects request with no X-API-Key and no JWT (401)", async ({ request }) => {
    const res = await request.get(`${FN_URL}?action=me`, {
      headers: { apikey: SUPABASE_ANON_KEY },
    });
    expect(res.status()).toBe(401);
    const body = await res.json().catch(() => ({}));
    expect(String(body.error ?? "")).toMatch(/unauthor/i);
  });

  test("rejects unknown ba_live_ key with invalid_api_key (401)", async ({ request }) => {
    const res = await request.get(`${FN_URL}?action=me`, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        "X-API-Key": "ba_live_definitely_not_a_real_key_000000",
      },
    });
    expect(res.status()).toBe(401);
    const body = await res.json().catch(() => ({}));
    expect(body.error).toBe("invalid_api_key");
  });

  test("rejects non-prefixed key by falling through to JWT branch (401)", async ({ request }) => {
    // Keys that don't start with ba_live_ skip the API-key branch entirely.
    const res = await request.get(`${FN_URL}?action=me`, {
      headers: { apikey: SUPABASE_ANON_KEY, "X-API-Key": "wrong_prefix_xyz" },
    });
    expect(res.status()).toBe(401);
  });
});

test.describe("Brand Arena Enterprise API — valid key (env-gated)", () => {
  test.skip(
    !ENTERPRISE_KEY,
    "BRAND_ARENA_ENTERPRISE_API_KEY not set — skipping live API checks",
  );

  const headers = () => ({
    apikey: SUPABASE_ANON_KEY,
    "X-API-Key": ENTERPRISE_KEY!,
  });

  test("action=me returns active enterprise sponsor", async ({ request }) => {
    const res = await request.get(`${FN_URL}?action=me`, { headers: headers() });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.sponsor).toBeTruthy();
    expect(body.sponsor.tier).toBe("enterprise");
    expect(body.sponsor.subscription_status).toBe("active");
    expect(body.sponsor.id).toBeTruthy();
  });

  test("action=votes returns series array + total", async ({ request }) => {
    const res = await request.get(`${FN_URL}?action=votes&days=7`, { headers: headers() });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.days).toBe(7);
    expect(typeof body.total).toBe("number");
    expect(Array.isArray(body.series)).toBe(true);
    expect(body.brand_id).toBeTruthy();
  });

  test("action=rank returns numeric ranking payload", async ({ request }) => {
    const res = await request.get(`${FN_URL}?action=rank`, { headers: headers() });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty("rank");
    expect(typeof body.total).toBe("number");
    expect(typeof body.total_votes).toBe("number");
  });

  test("days param is clamped to 90 max", async ({ request }) => {
    const res = await request.get(`${FN_URL}?action=votes&days=9999`, { headers: headers() });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.days).toBeLessThanOrEqual(90);
  });
});
