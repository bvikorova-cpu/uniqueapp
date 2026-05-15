import { test, expect, request } from "@playwright/test";

/**
 * E2E for the rewards claim flow.
 *
 * Two layers:
 *  1) UI: /rewards renders without JS errors and shows the main hub sections.
 *  2) Server contract: claim RPCs are gated — anonymous calls must NOT grant
 *     a reward. They return an error envelope (or HTTP 401) but never `ok: true`.
 *
 * We deliberately avoid logging in (no test user provisioned in CI) and instead
 * exercise the public surface + the security gate on the server-side functions.
 */

const SUPABASE_URL = process.env.VITE_SUPABASE_URL ?? "https://jufrdzeonywluwutvyxz.supabase.co";
const SUPABASE_ANON_KEY =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1ZnJkemVvbnl3bHV3dXR2eXh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMzU0MTgsImV4cCI6MjA3NDcxMTQxOH0.UOe-_WQoTeBGFmnezRHRcjFJaJd71a7rYlurDkI6h4Q";

test.describe("Rewards page renders", () => {
  test("/rewards loads without JS errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(String(e)));
    await page.goto("/rewards");
    await page.waitForLoadState("domcontentloaded");
    expect(errors, `JS errors: ${errors.join("\n")}`).toEqual([]);
  });
});

test.describe("Claim RPCs are server-side gated", () => {
  const rpc = async (name: string, body: Record<string, unknown>) => {
    const ctx = await request.newContext();
    const res = await ctx.post(`${SUPABASE_URL}/rest/v1/rpc/${name}`, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
      },
      data: body,
    });
    let json: any = null;
    try { json = await res.json(); } catch { /* may be empty */ }
    return { status: res.status(), json };
  };

  test("claim_quest_node refuses anonymous caller", async () => {
    const { status, json } = await rpc("claim_quest_node", { _node_id: "00000000-0000-0000-0000-000000000000" });
    // Either a 401/403 from PostgREST, or a structured ok:false envelope.
    if (status === 200) {
      expect(json?.ok).toBeFalsy();
    } else {
      expect([401, 403, 404]).toContain(status);
    }
  });

  test("claim_battle_pass_reward refuses anonymous caller", async () => {
    const { status, json } = await rpc("claim_battle_pass_reward", {
      _season_id: "00000000-0000-0000-0000-000000000000",
      _tier: 1,
      _track: "free",
    });
    if (status === 200) expect(json?.ok).toBeFalsy();
    else expect([401, 403, 404]).toContain(status);
  });

  test("claim_calendar_day refuses anonymous caller", async () => {
    const { status, json } = await rpc("claim_calendar_day", {
      _month_key: "2026-05",
      _day_number: 1,
    });
    if (status === 200) expect(json?.ok).toBeFalsy();
    else expect([401, 403, 404]).toContain(status);
  });

  test("acquire_cosmetic_item refuses anonymous caller", async () => {
    const { status, json } = await rpc("acquire_cosmetic_item", {
      _item_id: "00000000-0000-0000-0000-000000000000",
    });
    if (status === 200) expect(json?.ok).toBeFalsy();
    else expect([401, 403, 404]).toContain(status);
  });
});
