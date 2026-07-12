// Public health check + edge-function probe.
//
// GET  /functions/v1/health-check
//   -> aggregated router ping (legacy behavior)
// POST /functions/v1/health-check { names: string[] }
//   -> server-side probe of each named edge function using service-role auth.
//      Returns { results: [{ name, code, ms, status, detail }] }
//
// Piggybacked onto health-check to avoid burning a second edge-function slot
// (project is at SUPABASE_MAX_FUNCTIONS_REACHED).

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const ROUTERS = ["nutrition-router", "horse-router", "video-ad-tools", "job-redirect"];

const EXPECTED = {
  "nutrition-router": [
    "coach_chat", "allergy_scanner", "barcode_scanner", "body_predictor",
    "grocery_optimizer", "hydration_coach", "meal_challenge",
    "supplement_advisor", "weekly_progress",
  ],
  "horse-router": [
    "create", "train", "join_race", "purchase_equipment",
    "championship_enroll", "claim_quest_reward",
  ],
  "video-ad-tools": ["scenes", "sfx", "tts", "voice_clone"],
};

const BASE = Deno.env.get("SUPABASE_URL") ?? "";
const ANON = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

// ---------------- probe ----------------
const ALIVE = new Set([200, 201, 202, 204, 400, 401, 403, 405, 409, 422, 429]);
function classify(code: number, bodySnippet = ""): { status: "ok" | "error"; detail: string } {
  if (code >= 200 && code < 300) return { status: "ok", detail: "handler OK" };
  if (ALIVE.has(code)) {
    if (code === 401 || code === 403) return { status: "ok", detail: `alive, gated (${code})` };
    if (code === 429) return { status: "ok", detail: "alive, rate-limited" };
    if (code === 405) return { status: "ok", detail: "alive, method guard" };
    return { status: "ok", detail: `alive, validation rejected (${code})` };
  }
  if (code === 404) return { status: "error", detail: "NOT DEPLOYED (404)" };
  if (code >= 500) {
    // Distinguish boot crash (HTML "BOOT_ERROR" / "WORKER_ERROR") from handler
    // returning a JSON error (function is alive, just rejected our probe body).
    const snip = bodySnippet.slice(0, 400);
    const isBootCrash =
      /BOOT_ERROR|WORKER_ERROR|WORKER_LIMIT|<html|<!DOCTYPE|failed to boot|InvalidWorker/i.test(snip);
    if (!isBootCrash && /"error"|"message"/.test(snip)) {
      return { status: "ok", detail: `alive, handler-error (${code})` };
    }
    return { status: "error", detail: `CRASH (${code})` };
  }
  if (code === 0) return { status: "error", detail: "network unreachable" };
  return { status: "error", detail: `unexpected ${code}` };
}

async function probeOne(name: string) {
  const t0 = performance.now();
  const key = SERVICE || ANON;
  try {
    const res = await fetch(`${BASE}/functions/v1/${name}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({ __probe: true }),
      signal: AbortSignal.timeout(8000),
    });
    let body = "";
    try { body = await res.text(); } catch { /* ignore */ }
    const { status, detail } = classify(res.status, body);
    return { name, code: res.status, ms: Math.round(performance.now() - t0), status, detail };
  } catch (e) {
    const msg = (e as Error).message ?? String(e);
    // Gateway-level rate limiting → the function is alive, we just got throttled.
    if (/rate limit/i.test(msg)) {
      return { name, code: 429, ms: Math.round(performance.now() - t0), status: "ok" as const, detail: "alive, gateway-throttled" };
    }
    return { name, code: 0, ms: Math.round(performance.now() - t0), status: "error" as const, detail: `network: ${msg}` };
  }
}

async function probeMany(names: string[]) {
  const capped = names.slice(0, 600);
  const CONCURRENCY = 4;                  // lowered to avoid gateway rate limiter
  const STAGGER_MS = 60;                  // per-request pacing per worker
  const results = new Array(capped.length);
  let cursor = 0;
  async function worker() {
    while (true) {
      const i = cursor++;
      if (i >= capped.length) return;
      results[i] = await probeOne(capped[i]);
      await new Promise((r) => setTimeout(r, STAGGER_MS));
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  return results;
}


// ---------------- legacy health check ----------------
async function runHealth() {
  const checks: any[] = [];
  for (const name of ROUTERS) {
    try {
      if (name === "job-redirect") {
        const r = await fetch(`${BASE}/functions/v1/job-redirect`, {
          headers: { apikey: ANON, Authorization: `Bearer ${ANON}` },
          redirect: "manual",
        });
        checks.push({ name, ok: r.status === 400, status: r.status });
        continue;
      }
      const r = await fetch(`${BASE}/functions/v1/${name}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: ANON, Authorization: `Bearer ${ANON}` },
        body: JSON.stringify({ action: "ping" }),
      });
      const data = await r.json().catch(() => ({}));
      const expected = (EXPECTED as any)[name] ?? [];
      const actions = Array.isArray(data?.actions) ? data.actions : [];
      const missing = expected.filter((a: string) => !actions.includes(a));
      checks.push({
        name,
        ok: r.ok && data?.ok === true && missing.length === 0,
        status: r.status,
        actions_count: actions.length,
        missing_actions: missing,
      });
    } catch (e: any) {
      checks.push({ name, ok: false, error: e?.message ?? "fetch failed" });
    }
  }
  const ok = checks.every((c) => c.ok);
  return { ok, checks, timestamp: new Date().toISOString() };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  // POST with { names } -> probe mode
  if (req.method === "POST") {
    const body = await req.json().catch(() => ({}));
    if (body?.__probe) {
      return new Response(JSON.stringify({ probe: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (Array.isArray(body?.names)) {
      const results = await probeMany(body.names.filter((n: unknown) => typeof n === "string"));
      return new Response(JSON.stringify({ results }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  // Default: legacy health aggregation
  const res = await runHealth();
  return new Response(JSON.stringify(res, null, 2), {
    status: res.ok ? 200 : 503,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
