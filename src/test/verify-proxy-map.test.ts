import { describe, it, expect } from "vitest";
import { resolveProxy } from "@/integrations/supabase/proxyMap";

const CASES: Array<[string, string]> = [
  ["verify-bazaar-payment", "bazaar"],
  ["verify-brain-duel-payment", "brain_duel"],
  ["verify-coupon-payment", "coupon"],
  ["verify-donation", "donation"],
  ["verify-emotion-credits-payment", "emotion_credits"],
  ["verify-gift-payment", "gift"],
  ["verify-lead-boost-payment", "lead_boost"],
  ["verify-learning-payment", "learning"],
  ["verify-multiverse-payment", "multiverse"],
  ["verify-tip-purchase", "tip"],
];

describe("VERIFY_PROXY_MAP", () => {
  it.each(CASES)("%s -> verify-payment product_type=%s", (name, expected) => {
    const r = resolveProxy(name, { session_id: "sess_test" });
    expect(r).not.toBeNull();
    expect(r!.target).toBe("verify-payment");
    expect(r!.body.product_type).toBe(expected);
    expect(r!.body.session_id).toBe("sess_test");
  });
});
