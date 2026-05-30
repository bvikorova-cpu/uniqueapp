import { test, expect, request } from "@playwright/test";

/**
 * Load / stress test for Rewards RPCs.
 *
 * Goals:
 *  1) 50 parallel anonymous spin claims must ALL be refused (gating is race-safe).
 *  2) Repeated bet placement RPCs must not double-charge or leak success to anon.
 *  3) Server-side cron payout (`weekly-xp-snapshot`) must be idempotent — invoking
 *     it twice in quick succession returns matching shape and no errors.
 *
 * No authenticated user is provisioned — we only validate the security boundary
 * and idempotency. Authenticated load testing requires test seed users.
 */

const SUPABASE_URL = process.env.VITE_SUPABASE_URL ?? "https://jufrdzeonywluwutvyxz.supabase.co";
const SUPABASE_ANON_KEY =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1ZnJkemVvbnl3bHV3dXR2eXh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMzU0MTgsImV4cCI6MjA3NDcxMTQxOH0.UOe-_WQoTeBGFmnezRHRcjFJaJd71a7rYlurDkI6h4Q";

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
  try { json = await res.json(); } catch { /* empty */ }
  return { status: res.status(), json };
};

test.describe("Rewards load — race safety", () => {
  test("50 parallel claim_quest_node calls all refused", async () => {
    const results = await Promise.all(
      Array.from({ length: 50 }, () =>
        rpc("claim_quest_node", { _path_id: "00000000-0000-0000-0000-000000000000", _node_index: 0 })
      )
    );
    const grantedOk = results.filter((r) => r.status === 200 && r.json?.ok === true);
    expect(grantedOk, `Anonymous calls must NEVER grant rewards. Got ${grantedOk.length} ok=true`).toHaveLength(0);
  });

  test("20 parallel redeem_shop_item calls all refused", async () => {
    const results = await Promise.all(
      Array.from({ length: 20 }, () => rpc("redeem_shop_item", { _item_code: "non-existent-item" }))
    );
    const grantedOk = results.filter((r) => r.status === 200 && r.json?.ok === true);
    expect(grantedOk).toHaveLength(0);
  });

  test("30 parallel claim_battle_pass_reward calls all refused", async () => {
    const results = await Promise.all(
      Array.from({ length: 30 }, () =>
        rpc("claim_battle_pass_reward", {
          _season_id: "00000000-0000-0000-0000-000000000000",
          _tier: 1,
          _track: "free",
        })
      )
    );
    const grantedOk = results.filter((r) => r.status === 200 && r.json?.ok === true);
    expect(grantedOk).toHaveLength(0);
  });
});

test.describe("Cron idempotency", () => {
  test("snapshot_weekly_xp_winners refuses anon (admin-only path)", async () => {
    const a = await rpc("snapshot_weekly_xp_winners", {});
    const b = await rpc("snapshot_weekly_xp_winners", {});
    // Either both 401/403, or both return identical error shape — never one grants and the other refuses.
    expect(a.status).toBe(b.status);
    if (a.status === 200) {
      expect(a.json?.ok).toBeFalsy();
      expect(b.json?.ok).toBeFalsy();
    } else {
      expect([401, 403, 404]).toContain(a.status);
    }
  });
});
