// Edge function warm-pool keeper.
// Hit by pg_cron every minute → fans out lightweight OPTIONS pings to the
// top-N hot edge functions, forcing Deno isolates to stay warm and
// eliminating ~200-500 ms cold-start latency for end users.
//
// No auth required — OPTIONS requests bypass JWT verification and only
// allocate an isolate. Cost is negligible (<2 vCPU-sec/min).

import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const HOT_FUNCTIONS = [
  "create-checkout",
  "verify-payment",
  "ai-chat",
  "ai-text-generator",
  "ai-image-generation",
  "rank-feed",
  "messenger-send",
  "notifications-fanout",
  "credits-deduct",
  "search-profiles",
];

const PROJECT_REF = Deno.env.get("SUPABASE_PROJECT_ID") ?? "jufrdzeonywluwutvyxz";
const BASE = `https://${PROJECT_REF}.supabase.co/functions/v1`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const startedAt = Date.now();
  const results = await Promise.allSettled(
    HOT_FUNCTIONS.map(async (name) => {
      const t0 = Date.now();
      try {
        const r = await fetch(`${BASE}/${name}`, {
          method: "OPTIONS",
          signal: AbortSignal.timeout(3000),
        });
        return { name, status: r.status, ms: Date.now() - t0 };
      } catch (e) {
        return { name, error: String(e instanceof Error ? e.message : e), ms: Date.now() - t0 };
      }
    })
  );

  const payload = {
    ok: true,
    pinged: HOT_FUNCTIONS.length,
    total_ms: Date.now() - startedAt,
    results: results.map((r) => (r.status === "fulfilled" ? r.value : { error: String(r.reason) })),
  };

  return new Response(JSON.stringify(payload), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: 200,
  });
});
