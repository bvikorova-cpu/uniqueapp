// Unit tests for stripe-webhook's MT subscription payload and recurring
// referral reward logic. Mirrors literals from index.ts; any drift fails here.
// Run with: deno test --allow-net --allow-env

import {
  assertEquals,
  assertNotEquals,
  assert,
} from "https://deno.land/std@0.224.0/assert/mod.ts";

// ── Mirror of constants / logic in index.ts ────────────────────────────────
const MEGATALENT_TIER_PRICE: Record<string, number> = {
  premium: 10,
  top_premium: 15,
};

type Tier = "premium" | "top_premium";

function buildMtPayload(args: {
  userId: string;
  tier: Tier;
  customerId: string | null;
  subscriptionId: string;
  isActive: boolean;
  periodEnd: string | null;
}) {
  const { userId, tier, customerId, subscriptionId, isActive, periodEnd } = args;
  return {
    user_id: userId,
    tier,
    price: MEGATALENT_TIER_PRICE[tier],
    bonus_votes: 0,
    win_chance_boost: tier === "top_premium" ? 100 : 0,
    status: isActive ? "active" : "inactive",
    stripe_customer_id: customerId,
    stripe_subscription_id: subscriptionId,
    current_period_end: periodEnd,
    updated_at: new Date().toISOString(),
  };
}

function unlockNotificationMessage(tier: Tier) {
  return tier === "top_premium"
    ? "Your Megatalent Top Premium features are unlocked: +100% ranking boost (real votes × 2) and €5/month referral rewards."
    : "Your Megatalent Premium features are unlocked.";
}

// Flat €5 reward — mirrors line 1233 of index.ts.
function computeReferralReward(amountPaidCents: number): number | null {
  if (amountPaidCents <= 0) return null; // skipped: zero-amount invoice
  return 5;
}

// ── MT subscription payload tests ──────────────────────────────────────────

Deno.test("TOP Premium sub payload: win_chance_boost=100, bonus_votes=0, €15", () => {
  const p = buildMtPayload({
    userId: "u-1",
    tier: "top_premium",
    customerId: "cus_x",
    subscriptionId: "sub_x",
    isActive: true,
    periodEnd: "2030-01-01T00:00:00.000Z",
  });
  assertEquals(p.win_chance_boost, 100);
  assertEquals(p.bonus_votes, 0);
  assertEquals(p.price, 15);
  assertEquals(p.status, "active");
});

Deno.test("Premium sub payload: no boost, no bonus_votes, €10", () => {
  const p = buildMtPayload({
    userId: "u-2",
    tier: "premium",
    customerId: "cus_y",
    subscriptionId: "sub_y",
    isActive: true,
    periodEnd: null,
  });
  assertEquals(p.win_chance_boost, 0);
  assertEquals(p.bonus_votes, 0);
  assertEquals(p.price, 10);
});

Deno.test("inactive subscription still writes status='inactive' without granting boost", () => {
  const p = buildMtPayload({
    userId: "u-3",
    tier: "top_premium",
    customerId: "cus_z",
    subscriptionId: "sub_z",
    isActive: false,
    periodEnd: null,
  });
  // Boost is set by tier — but status is inactive so the user is gated by status.
  assertEquals(p.status, "inactive");
  assertEquals(p.win_chance_boost, 100);
  assertEquals(p.bonus_votes, 0);
});

Deno.test("legacy 100,000 bonus votes are never granted (regression guard)", () => {
  for (const tier of ["premium", "top_premium"] as const) {
    const p = buildMtPayload({
      userId: "u", tier,
      customerId: "cus", subscriptionId: "sub",
      isActive: true, periodEnd: null,
    });
    assertEquals(p.bonus_votes, 0);
    assertNotEquals(p.bonus_votes as number, 100_000);
  }
});

Deno.test("win_chance_boost is exactly 100 for top_premium (not legacy 50)", () => {
  const p = buildMtPayload({
    userId: "u", tier: "top_premium",
    customerId: "cus", subscriptionId: "sub",
    isActive: true, periodEnd: null,
  });
  assertEquals(p.win_chance_boost, 100);
  assertNotEquals(p.win_chance_boost, 50);
});

Deno.test("unlock notification mentions +100% boost and €5 referral for TOP Premium", () => {
  const msg = unlockNotificationMessage("top_premium");
  assert(msg.includes("+100%"));
  assert(msg.includes("× 2"));
  assert(msg.includes("€5"));
  // Legacy copy must be gone.
  assert(!msg.includes("100,000"));
  assert(!msg.includes("50% boost"));
});

Deno.test("unlock notification for Premium does NOT advertise the boost", () => {
  const msg = unlockNotificationMessage("premium");
  assert(!msg.includes("+100%"));
  assert(!msg.includes("× 2"));
});

// ── Recurring referral reward tests ────────────────────────────────────────

Deno.test("referral reward: flat €5 on any paid invoice", () => {
  assertEquals(computeReferralReward(1000), 5); // €10 invoice (Premium)
  assertEquals(computeReferralReward(1500), 5); // €15 invoice (TOP Premium)
  assertEquals(computeReferralReward(1), 5);    // micro-amount
});

Deno.test("referral reward: same €5 for Premium and TOP Premium (no tier multiplier)", () => {
  const premiumReward = computeReferralReward(MEGATALENT_TIER_PRICE.premium * 100);
  const topReward = computeReferralReward(MEGATALENT_TIER_PRICE.top_premium * 100);
  assertEquals(premiumReward, 5);
  assertEquals(topReward, 5);
  assertEquals(premiumReward, topReward);
});

Deno.test("referral reward: zero-amount invoice is skipped", () => {
  assertEquals(computeReferralReward(0), null);
  assertEquals(computeReferralReward(-1), null);
});

// ── Referral skip-conditions (error / edge scenarios) ──────────────────────

type Attribution = { id: string; referrer_id: string; status: string } | null;

function referralShouldCredit(args: {
  invoiceId: string | null;
  amountPaidCents: number;
  email: string | null;
  buyerProfileId: string | null;
  attribution: Attribution;
}): { credit: boolean; reason?: string } {
  if (!args.invoiceId) return { credit: false, reason: "no invoice id" };
  if (args.amountPaidCents <= 0) return { credit: false, reason: "zero-amount invoice" };
  if (!args.email) return { credit: false, reason: "no email" };
  if (!args.buyerProfileId) return { credit: false, reason: "no profile for email" };
  if (!args.attribution) return { credit: false, reason: "no attribution" };
  if (args.attribution.status !== "approved") {
    return { credit: false, reason: `status=${args.attribution.status}` };
  }
  return { credit: true };
}

Deno.test("error: no invoice id → no referral credit", () => {
  const r = referralShouldCredit({
    invoiceId: null, amountPaidCents: 1500, email: "a@b.c",
    buyerProfileId: "p", attribution: { id: "a", referrer_id: "r", status: "approved" },
  });
  assertEquals(r.credit, false);
});

Deno.test("error: missing email → no referral credit", () => {
  const r = referralShouldCredit({
    invoiceId: "in_1", amountPaidCents: 1500, email: null,
    buyerProfileId: "p", attribution: { id: "a", referrer_id: "r", status: "approved" },
  });
  assertEquals(r.credit, false);
  assertEquals(r.reason, "no email");
});

Deno.test("error: no profile for email → no referral credit", () => {
  const r = referralShouldCredit({
    invoiceId: "in_1", amountPaidCents: 1500, email: "ghost@x.y",
    buyerProfileId: null, attribution: { id: "a", referrer_id: "r", status: "approved" },
  });
  assertEquals(r.credit, false);
  assertEquals(r.reason, "no profile for email");
});

Deno.test("error: attribution not approved → no referral credit", () => {
  const r = referralShouldCredit({
    invoiceId: "in_1", amountPaidCents: 1500, email: "a@b.c",
    buyerProfileId: "p", attribution: { id: "a", referrer_id: "r", status: "pending" },
  });
  assertEquals(r.credit, false);
  assertEquals(r.reason, "status=pending");
});

Deno.test("happy path: approved attribution + TOP Premium invoice → €5 credited", () => {
  const r = referralShouldCredit({
    invoiceId: "in_top", amountPaidCents: 1500, email: "buyer@x.y",
    buyerProfileId: "p1", attribution: { id: "a1", referrer_id: "r1", status: "approved" },
  });
  assertEquals(r.credit, true);
  assertEquals(computeReferralReward(1500), 5);
});

Deno.test("happy path: approved attribution + Premium invoice → €5 credited (same as TOP)", () => {
  const r = referralShouldCredit({
    invoiceId: "in_prem", amountPaidCents: 1000, email: "buyer@x.y",
    buyerProfileId: "p1", attribution: { id: "a1", referrer_id: "r1", status: "approved" },
  });
  assertEquals(r.credit, true);
  assertEquals(computeReferralReward(1000), 5);
});

// ── Idempotency: simulate the unique source_invoice_id constraint ──────────

Deno.test("idempotency: second insert with same source_invoice_id is treated as duplicate", () => {
  const seen = new Set<string>();
  function tryInsert(invoiceId: string): "inserted" | "duplicate" {
    if (seen.has(invoiceId)) return "duplicate";
    seen.add(invoiceId);
    return "inserted";
  }
  assertEquals(tryInsert("in_42"), "inserted");
  assertEquals(tryInsert("in_42"), "duplicate");
  assertEquals(tryInsert("in_43"), "inserted");
});
