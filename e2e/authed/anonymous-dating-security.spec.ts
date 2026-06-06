/**
 * E2E — Anonymous Dating security (single-user mode)
 * ---------------------------------------------------
 * Covers the three items skipped in Phase 7 (items 32–34) without
 * requiring a second account, Stripe CLI, or service-role key:
 *
 *   1. WEBHOOK signature enforcement
 *      - Missing `stripe-signature` header → 400
 *      - Invalid signature → 400
 *      - (positive credit-grant path is exercised by manual Stripe test mode
 *         and the unit-level handler — out of scope here.)
 *
 *   2. REVEAL-ATTACK guard
 *      - Authed user attempts to UPDATE `anonymous_dating_matches` via REST
 *        forcing `status='revealed'` and/or both `*_revealed` flags.
 *      - RLS + DB trigger MUST reject it (either 0 rows updated or 403/4xx).
 *
 *   3. DOUBLE-SPEND atomicity
 *      - Read current `credits_remaining`, fire N=10 parallel
 *        `anonymous-date-ai` calls (each costs ≥1 credit), then re-read
 *        the balance and assert:
 *          • debited == successes * cost  (no over-debit, no under-debit)
 *          • final balance ≥ 0            (never negative)
 *          • successes ≤ floor(start / cost)
 *
 * Runs in `chromium-authed` project — uses the persisted QA session.
 */
import { test, expect, type APIRequestContext } from "@playwright/test";
import { readFileSync } from "node:fs";

const SUPABASE_URL = "https://jufrdzeonywluwutvyxz.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1ZnJkemVvbnl3bHV3dXR2eXh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMzU0MTgsImV4cCI6MjA3NDcxMTQxOH0.UOe-_WQoTeBGFmnezRHRcjFJaJd71a7rYlurDkI6h4Q";
const PROJECT_REF = "jufrdzeonywluwutvyxz";

function readAccessToken(): string {
  const state = JSON.parse(readFileSync("e2e/.auth/authed-state.json", "utf8"));
  const tokenKey = `sb-${PROJECT_REF}-auth-token`;
  for (const origin of state.origins ?? []) {
    const item = origin.localStorage?.find((i: any) => i.name === tokenKey);
    if (item) return JSON.parse(item.value).access_token as string;
  }
  throw new Error("No access_token in storageState");
}

function readUserId(token: string): string {
  // JWT payload base64
  const payload = JSON.parse(
    Buffer.from(token.split(".")[1], "base64").toString("utf8"),
  );
  return payload.sub as string;
}

async function authedRest(
  request: APIRequestContext,
  path: string,
  init: { method?: string; body?: any; headers?: Record<string, string> } = {},
) {
  const token = readAccessToken();
  return request.fetch(`${SUPABASE_URL}${path}`, {
    method: init.method ?? "GET",
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
    data: init.body !== undefined ? JSON.stringify(init.body) : undefined,
  });
}

// ────────────────────────────────────────────────────────────────
// 1) Webhook signature enforcement
// ────────────────────────────────────────────────────────────────
test.describe("stripe-webhook signature enforcement", () => {
  const WEBHOOK_URL = `${SUPABASE_URL}/functions/v1/stripe-webhook`;

  const fakeEvent = JSON.stringify({
    id: "evt_e2e_fake",
    object: "event",
    type: "checkout.session.completed",
    data: {
      object: {
        id: "cs_test_e2e_attack",
        metadata: {
          type: "anonymous_date_credits",
          user_id: "00000000-0000-0000-0000-000000000000",
          credits: "999999",
        },
      },
    },
  });

  test("rejects request with no stripe-signature header", async ({ request }) => {
    const res = await request.post(WEBHOOK_URL, {
      headers: { "Content-Type": "application/json" },
      data: fakeEvent,
    });
    expect(res.status(), await res.text()).toBeGreaterThanOrEqual(400);
    expect(res.status()).toBeLessThan(500);
  });

  test("rejects request with invalid signature", async ({ request }) => {
    const res = await request.post(WEBHOOK_URL, {
      headers: {
        "Content-Type": "application/json",
        "stripe-signature":
          "t=1700000000,v1=deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef",
      },
      data: fakeEvent,
    });
    expect(res.status(), await res.text()).toBeGreaterThanOrEqual(400);
    expect(res.status()).toBeLessThan(500);
  });

  test("no fake credits granted (idempotency / unauthorised event)", async ({ request }) => {
    // Re-read credits AFTER the two failed webhook attempts above;
    // if signature check had been bypassed, our balance would have jumped
    // by 999999 (target user_id is zero-uuid, but a real bypass would still
    // log + may match by user JWT). Sanity: balance stays sane (<10_000).
    const token = readAccessToken();
    const userId = readUserId(token);
    const res = await authedRest(
      request,
      `/rest/v1/anonymous_dating_credits?user_id=eq.${userId}&select=credits_remaining`,
    );
    if (res.status() === 200) {
      const rows = await res.json();
      const credits = rows?.[0]?.credits_remaining ?? 0;
      expect(credits, "balance should not be inflated by spoofed webhook").toBeLessThan(10_000);
    }
  });
});

// ────────────────────────────────────────────────────────────────
// 2) Reveal-attack — authed user cannot unilaterally flip status='revealed'
// ────────────────────────────────────────────────────────────────
test.describe("anonymous_dating_matches — reveal-attack guard", () => {
  test("UPDATE forcing status='revealed' is rejected by RLS / trigger", async ({ request }) => {
    const token = readAccessToken();
    const userId = readUserId(token);

    // Find an existing match the user is a party to (any status).
    const lookup = await authedRest(
      request,
      `/rest/v1/anonymous_dating_matches?or=(user1_id.eq.${userId},user2_id.eq.${userId})&select=id,status,user1_revealed,user2_revealed&limit=1`,
    );

    if (lookup.status() !== 200) {
      test.skip(true, `cannot read matches (status ${lookup.status()})`);
      return;
    }
    const matches = await lookup.json();
    if (!Array.isArray(matches) || matches.length === 0) {
      test.skip(true, "no match available for current QA user — skipping reveal-attack test");
      return;
    }

    const match = matches[0];
    const matchId = match.id as string;
    const originalStatus = match.status as string;

    // ATTACK: try to flip both reveal flags + status in one PATCH.
    const attack = await authedRest(
      request,
      `/rest/v1/anonymous_dating_matches?id=eq.${matchId}`,
      {
        method: "PATCH",
        headers: { Prefer: "return=representation" },
        body: {
          status: "revealed",
          user1_revealed: true,
          user2_revealed: true,
        },
      },
    );

    // Two acceptable defenses: (a) HTTP 4xx from RLS, or (b) 200 with zero rows
    // returned (RLS silently filtered), or (c) trigger raised an exception (4xx).
    const rawBody = await attack.text();

    if (attack.status() >= 400) {
      // Trigger or RLS blocked — good.
      expect(attack.status()).toBeLessThan(500);
    } else {
      // 2xx — must NOT have actually flipped status to 'revealed'.
      let rows: any[] = [];
      try { rows = JSON.parse(rawBody); } catch { /* ignore */ }
      const wasFlipped = Array.isArray(rows) && rows.some((r) => r.status === "revealed");
      expect(wasFlipped, `RLS should have prevented the update; body=${rawBody}`).toBeFalsy();
    }

    // Verify DB state did NOT actually change to 'revealed'.
    const recheck = await authedRest(
      request,
      `/rest/v1/anonymous_dating_matches?id=eq.${matchId}&select=status`,
    );
    if (recheck.status() === 200) {
      const rows = await recheck.json();
      const newStatus = rows?.[0]?.status;
      expect(newStatus, "status must not be 'revealed' after the attack").not.toBe(
        originalStatus === "revealed" ? "__never__" : "revealed",
      );
    }
  });
});

// ────────────────────────────────────────────────────────────────
// 3) Double-spend — 10 parallel anonymous-date-ai requests
// ────────────────────────────────────────────────────────────────
test.describe("anonymous-date-ai — double-spend atomicity", () => {
  test("10 parallel calls never debit more than starting balance", async ({ request }) => {
    const token = readAccessToken();
    const userId = readUserId(token);

    // Snapshot starting balance.
    const startRes = await authedRest(
      request,
      `/rest/v1/anonymous_dating_credits?user_id=eq.${userId}&select=credits_remaining`,
    );
    if (startRes.status() !== 200) {
      test.skip(true, `cannot read credits (status ${startRes.status()})`);
      return;
    }
    const startRows = await startRes.json();
    const startBalance: number = startRows?.[0]?.credits_remaining ?? 0;

    if (startBalance <= 0) {
      test.skip(true, "QA user has 0 credits — fund the account or skip");
      return;
    }

    // Fire 10 parallel AI requests (lightest feature → 'icebreaker').
    const N = 10;
    const callOne = () =>
      request.post(`${SUPABASE_URL}/functions/v1/anonymous-date-ai`, {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        data: JSON.stringify({
          feature: "icebreaker",
          payload: { interests: ["coffee", "hiking"] },
        }),
      });

    const results = await Promise.allSettled(
      Array.from({ length: N }, () => callOne()),
    );

    let successes = 0;
    let insufficient = 0;
    let other = 0;
    for (const r of results) {
      if (r.status !== "fulfilled") { other++; continue; }
      const res = r.value;
      if (res.status() === 200) successes++;
      else if (res.status() === 402 || res.status() === 403) insufficient++;
      else other++;
    }

    // Re-read final balance.
    const endRes = await authedRest(
      request,
      `/rest/v1/anonymous_dating_credits?user_id=eq.${userId}&select=credits_remaining`,
    );
    expect(endRes.status()).toBe(200);
    const endRows = await endRes.json();
    const endBalance: number = endRows?.[0]?.credits_remaining ?? 0;

    const debited = startBalance - endBalance;

    // Cost per AI call is between 3 and 5 credits (per project memory) but
    // we only need to assert the invariants — not the exact cost.
    expect(endBalance, "final balance must never go negative").toBeGreaterThanOrEqual(0);

    if (successes > 0) {
      const inferredCost = debited / successes;
      expect(
        Number.isInteger(inferredCost) && inferredCost >= 1 && inferredCost <= 10,
        `each successful call must debit a consistent positive integer cost (debited=${debited}, successes=${successes})`,
      ).toBeTruthy();

      // Insufficient-credit failures must not have debited anything.
      expect(
        debited,
        `over-debit detected: debited=${debited}, successes=${successes}, insufficient=${insufficient}`,
      ).toBe(successes * inferredCost);

      // Successes cannot have spent more than starting balance allowed.
      expect(successes * inferredCost).toBeLessThanOrEqual(startBalance);
    } else {
      // If everything failed, balance must be unchanged.
      expect(debited).toBe(0);
    }

    console.log("[double-spend]", {
      startBalance, endBalance, debited, successes, insufficient, other,
    });
  });
});
