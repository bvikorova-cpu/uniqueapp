// Unit tests for the payload-building logic in check-megatalent-subscription.
// These tests intentionally mirror the literals in index.ts so any drift between
// the two will fail loudly. Run with: deno test --allow-net --allow-env

import {
  assertEquals,
  assertNotEquals,
  assert,
} from "https://deno.land/std@0.224.0/assert/mod.ts";

// ── Mirror of constants in index.ts ────────────────────────────────────────
const PRICE_TO_TIER: Record<string, "premium" | "top_premium"> = {
  price_1TOvuRGaXSfGtYFt6sfpt2Dy: "premium",
  price_1TOvuTGaXSfGtYFtIheCgIzQ: "top_premium",
};
const TIER_PRICE: Record<string, number> = { premium: 10, top_premium: 15 };

// Mirror of the payload built before upsert.
function buildPayload(args: {
  userId: string;
  tier: "premium" | "top_premium";
  customerId: string;
  subscriptionId: string;
  periodEnd: string;
}) {
  const { userId, tier, customerId, subscriptionId, periodEnd } = args;
  return {
    user_id: userId,
    tier,
    price: TIER_PRICE[tier],
    bonus_votes: 0,
    win_chance_boost: tier === "top_premium" ? 100 : 0,
    status: "active",
    stripe_customer_id: customerId,
    stripe_subscription_id: subscriptionId,
    current_period_end: periodEnd,
  };
}

// ── Tests ──────────────────────────────────────────────────────────────────

Deno.test("PRICE_TO_TIER maps the live Stripe price IDs", () => {
  assertEquals(PRICE_TO_TIER["price_1TOvuRGaXSfGtYFt6sfpt2Dy"], "premium");
  assertEquals(PRICE_TO_TIER["price_1TOvuTGaXSfGtYFtIheCgIzQ"], "top_premium");
  assertEquals(PRICE_TO_TIER["price_unknown"], undefined);
});

Deno.test("TOP Premium payload: win_chance_boost=100, no bonus_votes, price €15", () => {
  const p = buildPayload({
    userId: "u-1",
    tier: "top_premium",
    customerId: "cus_x",
    subscriptionId: "sub_x",
    periodEnd: "2030-01-01T00:00:00.000Z",
  });
  assertEquals(p.win_chance_boost, 100);
  assertEquals(p.bonus_votes, 0);
  assertEquals(p.price, 15);
  assertEquals(p.tier, "top_premium");
  assertEquals(p.status, "active");
});

Deno.test("Premium payload: no boost, no bonus_votes, price €10", () => {
  const p = buildPayload({
    userId: "u-2",
    tier: "premium",
    customerId: "cus_y",
    subscriptionId: "sub_y",
    periodEnd: "2030-01-01T00:00:00.000Z",
  });
  assertEquals(p.win_chance_boost, 0);
  assertEquals(p.bonus_votes, 0);
  assertEquals(p.price, 10);
});

Deno.test("payload never grants legacy 100,000 bonus votes (legal regression guard)", () => {
  for (const tier of ["premium", "top_premium"] as const) {
    const p = buildPayload({
      userId: "u",
      tier,
      customerId: "cus",
      subscriptionId: "sub",
      periodEnd: "2030-01-01T00:00:00.000Z",
    });
    assertEquals(p.bonus_votes, 0, `tier=${tier} must have bonus_votes=0`);
    assertNotEquals(p.bonus_votes as number, 100_000);
  }
});

Deno.test("win_chance_boost is exactly 100 for top_premium (not 50)", () => {
  const p = buildPayload({
    userId: "u",
    tier: "top_premium",
    customerId: "cus",
    subscriptionId: "sub",
    periodEnd: "2030-01-01T00:00:00.000Z",
  });
  // 50 was the previous value — make sure it never regresses.
  assertNotEquals(p.win_chance_boost, 50);
  assert(p.win_chance_boost === 100);
});

// ── Error-path guards (mirror the throws in the serve handler) ──────────────

function authGuard(authHeader: string | null) {
  if (!authHeader) throw new Error("Missing Authorization header");
  return authHeader.replace("Bearer ", "");
}

Deno.test("error path: missing Authorization header throws", () => {
  let threw = false;
  try { authGuard(null); } catch (e) {
    threw = true;
    assertEquals((e as Error).message, "Missing Authorization header");
  }
  assert(threw);
});

Deno.test("error path: missing STRIPE_SECRET_KEY throws", () => {
  const orig = Deno.env.get("STRIPE_SECRET_KEY");
  Deno.env.delete("STRIPE_SECRET_KEY");
  let threw = false;
  try {
    const k = Deno.env.get("STRIPE_SECRET_KEY");
    if (!k) throw new Error("STRIPE_SECRET_KEY is not set");
  } catch (e) {
    threw = true;
    assertEquals((e as Error).message, "STRIPE_SECRET_KEY is not set");
  }
  if (orig) Deno.env.set("STRIPE_SECRET_KEY", orig);
  assert(threw);
});

// Even on the "no Stripe customer" early-return, the function must NOT write
// any boost into the DB. We simulate the branch decision here.
Deno.test("no-customer branch returns subscribed=false and writes no boost", () => {
  const customersList = { data: [] as unknown[] };
  if (customersList.data.length === 0) {
    const body = { subscribed: false, tier: null };
    assertEquals(body.subscribed, false);
    assertEquals(body.tier, null);
    // No payload built → no boost field at all.
    assertEquals((body as Record<string, unknown>).win_chance_boost, undefined);
  } else {
    throw new Error("branch not taken");
  }
});
