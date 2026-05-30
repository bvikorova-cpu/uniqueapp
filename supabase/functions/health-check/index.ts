// Public health check for consolidated routers + proxyMap coverage.
// GET /functions/v1/health-check
// Returns: { ok, checks: [{ name, ok, actions, error }], timestamp }
//
// Each router exposes a `ping` action that bypasses auth/credits and
// returns its own action list. We aggregate them so a single curl shows
// which router is broken without scraping logs.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ROUTERS = ["nutrition-router", "horse-router", "video-ad-tools", "job-redirect"];

// Expected proxyMap coverage — kept in sync with src/integrations/supabase/proxyMap.ts.
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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const base = Deno.env.get("SUPABASE_URL") ?? "";
  const anon = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  const checks: any[] = [];

  for (const name of ROUTERS) {
    try {
      if (name === "job-redirect") {
        // job-redirect: validate it 400s on missing id (proves function is live).
        const r = await fetch(`${base}/functions/v1/job-redirect`, {
          headers: { apikey: anon, Authorization: `Bearer ${anon}` },
          redirect: "manual",
        });
        checks.push({ name, ok: r.status === 400, status: r.status });
        continue;
      }

      const r = await fetch(`${base}/functions/v1/${name}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: anon,
          Authorization: `Bearer ${anon}`,
        },
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
  return new Response(
    JSON.stringify({ ok, checks, timestamp: new Date().toISOString() }, null, 2),
    {
      status: ok ? 200 : 503,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    },
  );
});
