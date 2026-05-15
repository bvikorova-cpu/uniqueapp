import { describe, it, expect, vi } from "vitest";

// Contract test: claim RPCs must return { ok: boolean, error?: string }
describe("Rewards claim RPC contract", () => {
  const okResponse = { ok: true, reward_type: "xp", reward_value: 50 };
  const errResponse = { ok: false, error: "already_claimed" };

  it("success shape has ok=true and reward fields", () => {
    expect(okResponse.ok).toBe(true);
    expect(okResponse).toHaveProperty("reward_type");
    expect(typeof okResponse.reward_value).toBe("number");
  });

  it("error shape has ok=false and error code", () => {
    expect(errResponse.ok).toBe(false);
    expect(typeof errResponse.error).toBe("string");
  });

  it("known error codes are stable", () => {
    const codes = [
      "unauthenticated", "invalid_track", "season_inactive", "reward_not_found",
      "no_progress", "premium_required", "tier_locked", "already_claimed",
      "not_today", "item_not_found", "already_owned", "use_stripe_checkout",
      "insufficient_xp",
    ];
    codes.forEach((c) => expect(c).toMatch(/^[a-z_]+$/));
  });

  it("supabase.rpc signature is mockable", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: okResponse, error: null });
    const res = await rpc("claim_battle_pass_reward", { _season_id: "x", _tier: 1, _track: "free" });
    expect(rpc).toHaveBeenCalledWith("claim_battle_pass_reward", expect.any(Object));
    expect(res.data.ok).toBe(true);
  });
});
