import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const ANON = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;
const FN_URL = `${SUPABASE_URL}/functions/v1/admin-moderate-campaign`;

async function call(body: unknown, auth?: string) {
  const res = await fetch(FN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: ANON,
      ...(auth ? { Authorization: `Bearer ${auth}` } : {}),
    },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, json };
}

Deno.test("admin-moderate-campaign: rejects missing auth", async () => {
  const { status, json } = await call({ campaignType: "medical", campaignId: "x", action: "approve" });
  assertEquals(status, 401);
  assertEquals(typeof json.error, "string");
});

Deno.test("admin-moderate-campaign: rejects invalid token", async () => {
  const { status } = await call(
    { campaignType: "medical", campaignId: "x", action: "approve" },
    "not-a-real-jwt"
  );
  // either 401 (invalid auth) or 403 if downstream rejects — both are non-2xx
  assertEquals(status >= 400 && status < 500, true);
});

Deno.test("admin-moderate-campaign: CORS preflight OK", async () => {
  const res = await fetch(FN_URL, { method: "OPTIONS" });
  await res.text();
  assertEquals(res.status, 200);
});

Deno.test("admin-moderate-campaign: validates campaignType (with anon, blocked before validation by auth)", async () => {
  // Without admin, function should reject before action runs.
  const { status } = await call(
    { campaignType: "invalid_type", campaignId: "abc", action: "approve" },
    ANON
  );
  assertEquals(status >= 400 && status < 500, true);
});
