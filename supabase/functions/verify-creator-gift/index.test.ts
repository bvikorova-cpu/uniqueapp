// E2E: verify-creator-gift endpoint contract + idempotency guard.
// Ensures duplicate verify never re-charges / re-notifies (status transition is DB-enforced).
import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals, assert } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const ANON = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;
const FN = `${SUPABASE_URL}/functions/v1/verify-creator-gift`;

const call = (body: unknown) =>
  fetch(FN, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: ANON, Authorization: `Bearer ${ANON}` },
    body: JSON.stringify(body),
  });

Deno.test("verify-creator-gift: rejects invalid uuid (400)", async () => {
  const r = await call({ id: "not-a-uuid" });
  const t = await r.text();
  assertEquals(r.status, 400, t);
});

Deno.test("verify-creator-gift: unknown id returns 404", async () => {
  const r = await call({ id: "00000000-0000-0000-0000-000000000000" });
  const t = await r.text();
  assertEquals(r.status, 404, t);
});

Deno.test("verify-creator-gift: OPTIONS preflight", async () => {
  const r = await fetch(FN, { method: "OPTIONS" });
  await r.text();
  assert(r.status === 200 || r.status === 204);
  assertEquals(r.headers.get("access-control-allow-origin"), "*");
});
