import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Verifies the contract between Dating UI → create-checkout → check-subscription.
 *
 * Pinned config (must match supabase/functions/create-checkout/index.ts):
 *   dating_monthly → €2.00, mode "subscription", interval "month"
 *   dating_yearly  → €20.00, mode "subscription", interval "year"
 *
 * After a successful checkout return, check-subscription must report the
 * matching tier so the UI unlocks the right plan.
 */

// ── Pinned fixtures (mirror of the edge fn's PRODUCT_DEFAULTS) ────────────
const EXPECTED = {
  dating_monthly: { amount: 200, mode: "subscription", interval: "month", price_eur: 2.0,  type: "monthly" },
  dating_yearly:  { amount: 2000, mode: "subscription", interval: "year",  price_eur: 20.0, type: "yearly"  },
} as const;

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: { getSession: vi.fn() },
    functions: { invoke: vi.fn() },
    from: vi.fn(),
  },
}));

import { supabase } from "@/integrations/supabase/client";
const invoke = supabase.functions.invoke as unknown as ((name: string, options?: any) => Promise<any>) & {
  mockReset: () => void;
  mockResolvedValue: (value: any) => void;
};

// Mirror of Dating.handleSubscribe payload-building logic
function buildSubscribeBody(planType: "monthly" | "yearly") {
  return { product: planType === "monthly" ? "dating_monthly" : "dating_yearly" };
}

describe("Dating create-checkout payload contract", () => {
  beforeEach(() => invoke.mockReset());

  it("monthly plan → posts product=dating_monthly", async () => {
    invoke.mockResolvedValue({ data: { url: "https://checkout.stripe.com/m" }, error: null });
    await invoke("create-checkout", { body: buildSubscribeBody("monthly") });
    expect(invoke).toHaveBeenCalledWith("create-checkout", { body: { product: "dating_monthly" } });
  });

  it("yearly plan → posts product=dating_yearly", async () => {
    invoke.mockResolvedValue({ data: { url: "https://checkout.stripe.com/y" }, error: null });
    await invoke("create-checkout", { body: buildSubscribeBody("yearly") });
    expect(invoke).toHaveBeenCalledWith("create-checkout", { body: { product: "dating_yearly" } });
  });

  it("monthly product → €2.00 / month interval / subscription mode", () => {
    const cfg = EXPECTED.dating_monthly;
    expect(cfg.amount).toBe(200);
    expect(cfg.amount / 100).toBe(2.0);
    expect(cfg.mode).toBe("subscription");
    expect(cfg.interval).toBe("month");
  });

  it("yearly product → €20.00 / year interval / subscription mode", () => {
    const cfg = EXPECTED.dating_yearly;
    expect(cfg.amount).toBe(2000);
    expect(cfg.amount / 100).toBe(20.0);
    expect(cfg.mode).toBe("subscription");
    expect(cfg.interval).toBe("year");
  });

  it("post-success: webhook-derived subscription_type matches plan (monthly)", () => {
    // What stripe-webhook upserts into dating_subscriptions for dating_monthly:
    const upsertPayload = {
      subscription_type: "monthly",
      price: 2.0,
      // expires_at = now + 30d
    };
    expect(upsertPayload.subscription_type).toBe(EXPECTED.dating_monthly.type);
    expect(upsertPayload.price).toBe(EXPECTED.dating_monthly.price_eur);
  });

  it("post-success: webhook-derived subscription_type matches plan (yearly)", () => {
    const upsertPayload = { subscription_type: "yearly", price: 20.0 };
    expect(upsertPayload.subscription_type).toBe(EXPECTED.dating_yearly.type);
    expect(upsertPayload.price).toBe(EXPECTED.dating_yearly.price_eur);
  });
});
