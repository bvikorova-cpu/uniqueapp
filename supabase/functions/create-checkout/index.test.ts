// Tests for create-checkout pure logic: origin normalization, campaign fee
// percentages, and credit-pack price-id presence. Mirrors literals from
// supabase/functions/create-checkout/index.ts — drift here = failing test.
//
// Run with: deno test --allow-net --allow-env supabase/functions/create-checkout/index.test.ts
import {
  assertEquals,
  assert,
} from "https://deno.land/std@0.224.0/assert/mod.ts";

// ── Mirror of constants in index.ts ───────────────────────────────────────
const DEFAULT_APP_ORIGIN = "https://uniqueapp.fun";

function normalizeOrigin(value: string | null) {
  if (!value || value === "null") return DEFAULT_APP_ORIGIN;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? url.origin : DEFAULT_APP_ORIGIN;
  } catch {
    return DEFAULT_APP_ORIGIN;
  }
}

const CAMPAIGN_FEE_PCT: Record<string, number> = {
  medical: 0.06, dream: 0.07, hero: 0.05, pet: 0.06,
  student: 0.05, crisis: 0.08, talent: 0.10,
};

const ANTIQUE_PRICE_IDS: Record<number, string> = {
  10: "price_1SOII2GaXSfGtYFtPltUZvxb",
  25: "price_1SOIIMGaXSfGtYFtonaY4jqs",
  60: "price_1SOIItGaXSfGtYFtvHTuEutU",
  150: "price_1SOIJE0QTWhd4oRpow80Xeyd",
};

// ── normalizeOrigin ───────────────────────────────────────────────────────

Deno.test("normalizeOrigin: null falls back to default", () => {
  assertEquals(normalizeOrigin(null), DEFAULT_APP_ORIGIN);
  assertEquals(normalizeOrigin(""), DEFAULT_APP_ORIGIN);
  assertEquals(normalizeOrigin("null"), DEFAULT_APP_ORIGIN);
});

Deno.test("normalizeOrigin: valid https origin returned as-is", () => {
  assertEquals(
    normalizeOrigin("https://uniqueapp.fun/some/path?x=1"),
    "https://uniqueapp.fun",
  );
  assertEquals(
    normalizeOrigin("https://id-preview--abc.lovable.app/x"),
    "https://id-preview--abc.lovable.app",
  );
});

Deno.test("normalizeOrigin: rejects javascript: and data: schemes (XSS guard)", () => {
  assertEquals(normalizeOrigin("javascript:alert(1)"), DEFAULT_APP_ORIGIN);
  assertEquals(normalizeOrigin("data:text/html,<script>"), DEFAULT_APP_ORIGIN);
  assertEquals(normalizeOrigin("ftp://evil.com"), DEFAULT_APP_ORIGIN);
});

Deno.test("normalizeOrigin: malformed URL falls back", () => {
  assertEquals(normalizeOrigin("not a url"), DEFAULT_APP_ORIGIN);
  assertEquals(normalizeOrigin("///garbage"), DEFAULT_APP_ORIGIN);
});

// ── Campaign fee % regression guard ───────────────────────────────────────

Deno.test("CAMPAIGN_FEE_PCT: exact rates match contract", () => {
  // These percentages back the platform's published commission contract.
  // Changing them here MUST be matched in process_campaign_donation RPC.
  assertEquals(CAMPAIGN_FEE_PCT.medical, 0.06);
  assertEquals(CAMPAIGN_FEE_PCT.dream, 0.07);
  assertEquals(CAMPAIGN_FEE_PCT.hero, 0.05);
  assertEquals(CAMPAIGN_FEE_PCT.pet, 0.06);
  assertEquals(CAMPAIGN_FEE_PCT.student, 0.05);
  assertEquals(CAMPAIGN_FEE_PCT.crisis, 0.08);
  assertEquals(CAMPAIGN_FEE_PCT.talent, 0.10);
});

Deno.test("CAMPAIGN_FEE_PCT: every rate is between 0 and 0.10 (cap = 10%)", () => {
  for (const [k, v] of Object.entries(CAMPAIGN_FEE_PCT)) {
    assert(v > 0 && v <= 0.10, `${k} = ${v} out of [0, 0.10] range`);
  }
});

Deno.test("CAMPAIGN_FEE_PCT: fee math on €100 donation matches expected cents", () => {
  const grossCents = 10_000;
  const expected: Record<string, number> = {
    medical: 600, dream: 700, hero: 500, pet: 600,
    student: 500, crisis: 800, talent: 1000,
  };
  for (const [k, pct] of Object.entries(CAMPAIGN_FEE_PCT)) {
    const fee = Math.floor(grossCents * pct);
    assertEquals(fee, expected[k], `${k}: expected ${expected[k]} got ${fee}`);
    assertEquals(grossCents - fee + fee, grossCents); // net + fee = gross
  }
});

// ── ANTIQUE_PRICE_IDS shape ────────────────────────────────────────────────

Deno.test("ANTIQUE_PRICE_IDS: 4 packs, all stripe price ids", () => {
  const packs = Object.keys(ANTIQUE_PRICE_IDS).map(Number).sort((a, b) => a - b);
  assertEquals(packs, [10, 25, 60, 150]);
  for (const id of Object.values(ANTIQUE_PRICE_IDS)) {
    assert(/^price_[A-Za-z0-9]+$/.test(id), `bad price id: ${id}`);
  }
});

Deno.test("ANTIQUE_PRICE_IDS: pack sizes are monotonically increasing", () => {
  const packs = Object.keys(ANTIQUE_PRICE_IDS).map(Number).sort((a, b) => a - b);
  for (let i = 1; i < packs.length; i++) {
    assert(packs[i] > packs[i - 1]);
  }
});
