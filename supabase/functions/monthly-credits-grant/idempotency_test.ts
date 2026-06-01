import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals, assert } from "https://deno.land/std@0.224.0/assert/mod.ts";

const URL = Deno.env.get("VITE_SUPABASE_URL")!;
const KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;

async function invoke(body: Record<string, unknown>) {
  const res = await fetch(`${URL}/functions/v1/monthly-credits-grant`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: KEY,
      Authorization: `Bearer ${KEY}`,
    },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  return { status: res.status, json };
}

Deno.test("dry-run idempotency: second call for same month grants 0 new", async () => {
  // use a far-future month so no real grants exist
  const grantMonth = "2999-01-01";

  const first = await invoke({ grantMonth, dryRun: true });
  assertEquals(first.status, 200);
  assert(first.json.ok, `first call not ok: ${JSON.stringify(first.json)}`);
  console.log("first run:", first.json);

  // second run for same month — even with dryRun, prior dry-run rolled back,
  // so we test the real semantics by running a non-dry run twice on a
  // synthetic month and confirming the second skips everything.
  const realMonth = "2999-02-01";
  const r1 = await invoke({ grantMonth: realMonth });
  const r2 = await invoke({ grantMonth: realMonth });
  console.log("r1:", r1.json);
  console.log("r2:", r2.json);

  assertEquals(r2.json.granted, 0, "second run must not grant any credits");
  assertEquals(r2.json.skipped, r2.json.processed, "all users must be skipped on second run");
});
