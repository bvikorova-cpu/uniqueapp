/**
 * MegaTalent Watch Party — ANONYMOUS paywall + RLS gate.
 *
 * Verifies that for a logged-out visitor:
 *   1. /megatalent/music (category page that mounts MegatalentWatchParty)
 *      is gated by MegatalentGuard → redirect to /auth.
 *   2. Direct REST writes to megatalent_live_streams and
 *      megatalent_watch_party_messages are rejected by RLS (auth required).
 *   3. SELECT on both tables is allowed (public read), so the lobby can list
 *      streams to anonymous probes (UI itself is still behind the guard).
 */
import { test, expect } from "@playwright/test";

const SUPABASE_URL = "https://jufrdzeonywluwutvyxz.supabase.co";
const ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1ZnJkemVvbnl3bHV3dXR2eXh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMzU0MTgsImV4cCI6MjA3NDcxMTQxOH0.UOe-_WQoTeBGFmnezRHRcjFJaJd71a7rYlurDkI6h4Q";

test.describe("Watch Party — anonymous paywall + RLS", () => {
  test("category page redirects anon user to /auth", async ({ page }) => {
    await page.goto("/megatalent/music");
    await page.waitForURL(/\/auth(\b|\?|#|$)/, { timeout: 15_000 });
    // Watch Party UI must NOT be reachable.
    expect(await page.getByText(/Live & Watch Party/i).count()).toBe(0);
    expect(await page.getByRole("button", { name: /Go Live/i }).count()).toBe(0);
  });

  test("RLS blocks anon INSERT into megatalent_live_streams", async ({ request }) => {
    const res = await request.post(
      `${SUPABASE_URL}/rest/v1/megatalent_live_streams`,
      {
        headers: {
          apikey: ANON_KEY,
          Authorization: `Bearer ${ANON_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        data: {
          host_user_id: "00000000-0000-0000-0000-000000000000",
          category: "singing",
          title: "anon hack",
          status: "live",
          started_at: new Date().toISOString(),
        },
      },
    );
    expect(res.status(), `expected RLS deny, got ${res.status()}`).toBeGreaterThanOrEqual(401);
    expect(res.status()).toBeLessThan(500);
  });

  test("RLS blocks anon INSERT into megatalent_watch_party_messages", async ({ request }) => {
    const res = await request.post(
      `${SUPABASE_URL}/rest/v1/megatalent_watch_party_messages`,
      {
        headers: {
          apikey: ANON_KEY,
          Authorization: `Bearer ${ANON_KEY}`,
          "Content-Type": "application/json",
        },
        data: {
          stream_id: "00000000-0000-0000-0000-000000000000",
          user_id: "00000000-0000-0000-0000-000000000000",
          content: "anon hack",
        },
      },
    );
    expect(res.status()).toBeGreaterThanOrEqual(401);
    expect(res.status()).toBeLessThan(500);
  });

  test("SELECT on streams + messages is publicly readable", async ({ request }) => {
    const streams = await request.get(
      `${SUPABASE_URL}/rest/v1/megatalent_live_streams?select=id&limit=1`,
      { headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` } },
    );
    expect(streams.ok()).toBeTruthy();
    const msgs = await request.get(
      `${SUPABASE_URL}/rest/v1/megatalent_watch_party_messages?select=id&limit=1`,
      { headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` } },
    );
    expect(msgs.ok()).toBeTruthy();
  });
});
