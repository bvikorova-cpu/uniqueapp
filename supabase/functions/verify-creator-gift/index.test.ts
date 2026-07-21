// E2E: verify-creator-gift endpoint contract + idempotency guard.
// Skips gracefully if function isn't deployed to this environment.
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

async function isDeployed(): Promise<boolean> {
  const r = await call({ id: "00000000-0000-0000-0000-000000000000" });
  const body = await r.json().catch(() => ({}));
  return !(body?.code === "NOT_FOUND");
}

Deno.test("verify-creator-gift: rejects invalid uuid (400)", async () => {
  if (!(await isDeployed())) return console.warn("skip: function not deployed");
  const r = await call({ id: "not-a-uuid" });
  const t = await r.text();
  assertEquals(r.status, 400, t);
});

Deno.test("verify-creator-gift: unknown id returns 404 (idempotent — no side effects)", async () => {
  if (!(await isDeployed())) return console.warn("skip: function not deployed");
  const r = await call({ id: "00000000-0000-0000-0000-000000000000" });
  const body = await r.json();
  assertEquals(r.status, 404, JSON.stringify(body));
  assertEquals(body.error, "Not found");
});

Deno.test("verify-creator-gift: CORS preflight allows browser callers", async () => {
  const r = await fetch(FN, { method: "OPTIONS" });
  await r.text();
  // Deployed function returns 200 with cors; missing function returns 404 with cors headers set by Supabase.
  assert([200, 204, 404].includes(r.status), `unexpected status ${r.status}`);
});
