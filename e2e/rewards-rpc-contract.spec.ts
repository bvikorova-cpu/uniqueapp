import { test, expect, request, APIRequestContext } from "@playwright/test";

/**
 * Comprehensive contract tests for ALL Rewards / XP / engagement RPCs.
 *
 * Goal: lock the server-side surface so we never again need manual seed-and-test
 * runs after a schema change. Every RPC must either:
 *   - reject anonymous callers (401/403/404), or
 *   - return a structured { ok: false, error: <code> } envelope.
 *
 * Anything that returns `ok: true` without an authenticated JWT is a security
 * regression and this suite will fail.
 *
 * We also probe argument shapes so a future signature change (like the
 * add_user_points 3→4 arg bug) is caught immediately: PostgREST returns
 * PGRST202 ("Could not find the function ... in the schema cache") when the
 * argument list doesn't match a deployed overload.
 */

const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL ?? "https://jufrdzeonywluwutvyxz.supabase.co";
const SUPABASE_ANON_KEY =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1ZnJkemVvbnl3bHV3dXR2eXh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMzU0MTgsImV4cCI6MjA3NDcxMTQxOH0.UOe-_WQoTeBGFmnezRHRcjFJaJd71a7rYlurDkI6h4Q";

const ZERO_UUID = "00000000-0000-0000-0000-000000000000";

let ctx: APIRequestContext;

test.beforeAll(async () => {
  ctx = await request.newContext();
});
test.afterAll(async () => {
  await ctx.dispose();
});

async function rpc(name: string, body: Record<string, unknown>) {
  const res = await ctx.post(`${SUPABASE_URL}/rest/v1/rpc/${name}`, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
    },
    data: body,
  });
  let json: any = null;
  try {
    json = await res.json();
  } catch {
    /* noop */
  }
  return { status: res.status(), json };
}

/**
 * A function is "gated" if it never grants a reward to an anon caller.
 * Acceptable outcomes:
 *   - HTTP 401/403/404
 *   - 200 with { ok: false, error: "..." }
 *   - 200 with null/empty (read-only listing)
 * Forbidden:
 *   - 200 with ok: true
 *   - PGRST202 (signature mismatch / function missing)
 */
function expectGated(label: string, status: number, json: any) {
  // Signature drift — fail loudly with a useful message.
  if (json?.code === "PGRST202") {
    throw new Error(
      `${label}: function not found / signature mismatch (PGRST202): ${json?.message}`
    );
  }
  if (status === 200) {
    if (json && typeof json === "object" && "ok" in json) {
      expect(json.ok, `${label} must not grant rewards anonymously`).toBeFalsy();
    }
    // listing-style RPCs (e.g. get_last_week_xp_winners) may return [] or rows
    return;
  }
  expect([400, 401, 403, 404]).toContain(status);
}

test.describe("Rewards / XP RPC contract — anonymous callers", () => {
  test("spin_lucky_wheel is gated", async () => {
    const { status, json } = await rpc("spin_lucky_wheel", {});
    expectGated("spin_lucky_wheel", status, json);
  });

  test("redeem_shop_item is gated", async () => {
    const { status, json } = await rpc("redeem_shop_item", {
      _item_code: "streak-shield",
    });
    expectGated("redeem_shop_item", status, json);
  });

  test("gift_xp is gated", async () => {
    const { status, json } = await rpc("gift_xp", {
      _recipient: ZERO_UUID,
      _amount: 10,
      _message: "e2e",
    });
    expectGated("gift_xp", status, json);
  });

  test("place_xp_bet is gated", async () => {
    const { status, json } = await rpc("place_xp_bet", {
      _challenge_type: "daily_xp",
      _target: 100,
      _amount: 20,
      _hours: 24,
    });
    expectGated("place_xp_bet", status, json);
  });

  test("claim_quest_node is gated and signature is current", async () => {
    const { status, json } = await rpc("claim_quest_node", {
      _path_id: ZERO_UUID,
      _node_index: 0,
    });
    expectGated("claim_quest_node", status, json);
  });

  test("claim_battle_pass_reward is gated", async () => {
    const { status, json } = await rpc("claim_battle_pass_reward", {
      _season_id: ZERO_UUID,
      _tier: 1,
      _track: "free",
    });
    expectGated("claim_battle_pass_reward", status, json);
  });

  test("claim_calendar_day is gated", async () => {
    const { status, json } = await rpc("claim_calendar_day", {
      _month_key: "2026-05",
      _day_number: 1,
    });
    expectGated("claim_calendar_day", status, json);
  });

  test("acquire_cosmetic_item is gated", async () => {
    const { status, json } = await rpc("acquire_cosmetic_item", {
      _item_id: ZERO_UUID,
    });
    expectGated("acquire_cosmetic_item", status, json);
  });

  test("get_last_week_xp_winners is callable (read-only)", async () => {
    const { status, json } = await rpc("get_last_week_xp_winners", {});
    // No "ok" envelope — just must not crash or report signature drift.
    if (json?.code === "PGRST202") {
      throw new Error(`get_last_week_xp_winners signature drift: ${json?.message}`);
    }
    expect([200, 401, 403]).toContain(status);
  });
});

/**
 * Signature contract for add_user_points — guards against the bug where the
 * 4-arg overload (p_meta) was missing and broke spin/redeem/gift/bet.
 * Anon callers can't insert, but PostgREST returns PGRST202 if the overload
 * is missing entirely — that's what we check.
 */
test.describe("add_user_points overloads exist", () => {
  test("3-arg overload is resolvable", async () => {
    const { json } = await rpc("add_user_points", {
      p_user_id: ZERO_UUID,
      p_points: 1,
      p_activity_type: "e2e_probe",
    });
    expect(
      json?.code,
      `3-arg add_user_points missing: ${json?.message ?? ""}`
    ).not.toBe("PGRST202");
  });

  test("4-arg overload (with meta) is resolvable", async () => {
    const { json } = await rpc("add_user_points", {
      p_user_id: ZERO_UUID,
      p_points: 1,
      p_activity_type: "e2e_probe",
      p_meta: "{}",
    });
    expect(
      json?.code,
      `4-arg add_user_points missing — this caused the spin/redeem/gift/bet outage: ${json?.message ?? ""}`
    ).not.toBe("PGRST202");
  });
});
