import { test, expect, request, APIRequestContext } from "@playwright/test";

/**
 * Megatalent — contract / beta E2E tests.
 *
 * Locks the public surface for the Megatalent module so it cannot silently
 * regress. No paid Stripe flow, no service-role seeding, no logged-in user
 * required → safe for every CI run.
 *
 * Three layers:
 *   1) Pages render with no JS errors (paywall is allowed; we just check load).
 *   2) Server-side RPC contract: signatures stay stable + writes never succeed
 *      for an anonymous caller.
 *   3) RLS contract on monetised tables: anon writes are rejected, public
 *      reads return only data flagged as publicly visible.
 *
 * For the authenticated "pay then unlock" flow, see
 * `megatalent-voting-paywall.spec.ts` which auto-skips without secrets.
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
    /* */
  }
  return { status: res.status(), json };
}

async function restPost(table: string, row: Record<string, unknown>) {
  const res = await ctx.post(`${SUPABASE_URL}/rest/v1/${table}`, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    data: row,
  });
  return { status: res.status(), body: await res.text() };
}

async function restGet(table: string, query = "select=*&limit=5") {
  const res = await ctx.get(`${SUPABASE_URL}/rest/v1/${table}?${query}`, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
  });
  let json: any = null;
  try {
    json = await res.json();
  } catch {
    /* */
  }
  return { status: res.status(), json };
}

function assertNoSigDrift(label: string, json: any) {
  if (json?.code === "PGRST202") {
    throw new Error(
      `${label}: function not found / signature mismatch (PGRST202): ${json?.message}`,
    );
  }
}

// ---------------------------------------------------------------------------
// 1. Public pages load without JS errors
// ---------------------------------------------------------------------------
test.describe("Megatalent pages render", () => {
  const routes = [
    "/megatalent",
    "/megatalent/singers",
    "/megatalent/battle-results",
  ];
  for (const r of routes) {
    test(`${r} has no uncaught JS errors`, async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(String(e)));
      await page.goto(r);
      await page.waitForLoadState("domcontentloaded");
      expect(errors, `JS errors on ${r}:\n${errors.join("\n")}`).toEqual([]);
    });
  }
});

// ---------------------------------------------------------------------------
// 2. RPC contract — signatures + anonymous gating
// ---------------------------------------------------------------------------
test.describe("Megatalent RPC contract", () => {
  test("has_active_megatalent_subscription signature is current", async () => {
    const { status, json } = await rpc("has_active_megatalent_subscription", {
      _user_id: ZERO_UUID,
    });
    assertNoSigDrift("has_active_megatalent_subscription", json);
    // May require auth (401) or return boolean; never grant a true to anon for an unknown id.
    expect([200, 401, 403]).toContain(status);
    if (status === 200) expect(json).toBeFalsy();
  });

  test("is_megatalent_vip signature is current", async () => {
    const { status, json } = await rpc("is_megatalent_vip", {
      _user_id: ZERO_UUID,
    });
    assertNoSigDrift("is_megatalent_vip", json);
    expect([200, 401, 403]).toContain(status);
    if (status === 200) expect(json).toBeFalsy();
  });

  test("get_megatalent_challenge_progress signature is current", async () => {
    const { json } = await rpc("get_megatalent_challenge_progress", {
      _user_id: ZERO_UUID,
    });
    assertNoSigDrift("get_megatalent_challenge_progress", json);
  });

  test("get_megatalent_tip_stats signature is current", async () => {
    const { json } = await rpc("get_megatalent_tip_stats", {
      _creator_id: ZERO_UUID,
    });
    assertNoSigDrift("get_megatalent_tip_stats", json);
  });

  test("get_megatalent_bracket signature is current", async () => {
    const { json } = await rpc("get_megatalent_bracket", {
      _category: "singers",
    });
    assertNoSigDrift("get_megatalent_bracket", json);
  });

  test("generate_megatalent_bracket refuses anonymous caller", async () => {
    const { status, json } = await rpc("generate_megatalent_bracket", {
      _category: "singers",
    });
    assertNoSigDrift("generate_megatalent_bracket", json);
    // Should either reject (403/4xx) or fail safely; never silently create rows.
    if (status === 200) {
      // accepted shapes: null / { ok: false } / error envelope
      if (json && typeof json === "object" && "ok" in json) {
        expect(json.ok).toBeFalsy();
      }
    } else {
      expect([400, 401, 403, 404]).toContain(status);
    }
  });

  test("advance_megatalent_bracket refuses anonymous caller", async () => {
    const { status, json } = await rpc("advance_megatalent_bracket", {
      _bracket_id: ZERO_UUID,
    });
    assertNoSigDrift("advance_megatalent_bracket", json);
    if (status === 200) {
      if (json && typeof json === "object" && "ok" in json) {
        expect(json.ok).toBeFalsy();
      }
    } else {
      expect([400, 401, 403, 404]).toContain(status);
    }
  });
});

// ---------------------------------------------------------------------------
// 3. RLS contract — anonymous writes are blocked
// ---------------------------------------------------------------------------
test.describe("Megatalent table RLS — anon writes blocked", () => {
  const writes: Array<{ table: string; row: Record<string, unknown> }> = [
    {
      table: "talent_votes",
      row: { submission_id: ZERO_UUID, voter_id: ZERO_UUID, vote_type: "like" },
    },
    {
      table: "talent_comments",
      row: { submission_id: ZERO_UUID, user_id: ZERO_UUID, body: "anon test" },
    },
    {
      table: "talent_submissions",
      row: {
        user_id: ZERO_UUID,
        category: "singers",
        title: "anon",
        media_url: "https://example.com/x.mp4",
      },
    },
    {
      table: "megatalent_tips",
      row: { sender_id: ZERO_UUID, recipient_id: ZERO_UUID, amount: 1 },
    },
    {
      table: "megatalent_subscriptions",
      row: { user_id: ZERO_UUID, status: "active", tier: "premium" },
    },
    {
      table: "megatalent_boosts",
      row: { user_id: ZERO_UUID, submission_id: ZERO_UUID, amount: 1 },
    },
    {
      table: "talent_reports",
      row: { reporter_id: ZERO_UUID, submission_id: ZERO_UUID, reason: "spam" },
    },
  ];

  for (const w of writes) {
    test(`INSERT into ${w.table} as anon is rejected`, async () => {
      const { status } = await restPost(w.table, w.row);
      // RLS violation / unauthorized / schema mismatch all OK — never 2xx.
      expect(
        status,
        `Anon was able to write to ${w.table} (status ${status})`,
      ).toBeGreaterThanOrEqual(400);
    });
  }
});

// ---------------------------------------------------------------------------
// 4. RLS contract — public reads stay sanitized
// ---------------------------------------------------------------------------
test.describe("Megatalent table RLS — anon reads stay sanitized", () => {
  test("megatalent_subscriptions is not enumerable by anon", async () => {
    const { status, json } = await restGet("megatalent_subscriptions");
    if (status === 200) {
      expect(
        Array.isArray(json) ? json.length : 0,
        "Anonymous callers must not be able to list subscriber rows",
      ).toBe(0);
    } else {
      expect([401, 403, 404]).toContain(status);
    }
  });

  test("talent_reports is not readable by anon", async () => {
    const { status, json } = await restGet("talent_reports");
    if (status === 200) {
      expect(Array.isArray(json) ? json.length : 0).toBe(0);
    } else {
      expect([401, 403, 404]).toContain(status);
    }
  });

  test("talent_submissions read is allowed but never exposes private fields", async () => {
    const { status, json } = await restGet("talent_submissions", "select=*&limit=3");
    expect([200, 401, 403]).toContain(status);
    if (status === 200 && Array.isArray(json) && json.length > 0) {
      const forbidden = ["email", "phone", "real_name", "stripe_customer_id"];
      for (const row of json) {
        for (const k of forbidden) {
          expect(row, `talent_submissions exposes ${k}`).not.toHaveProperty(k);
        }
      }
    }
  });
});
