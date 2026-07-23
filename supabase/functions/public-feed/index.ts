// Public cached feed + leaderboard reader.
// Uses Cache-Control: s-maxage so Supabase/Cloudflare edge can serve
// unauthenticated reads without hitting Postgres every time.
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const kind = url.searchParams.get("kind") ?? "feed";
    const limit = Math.min(Number(url.searchParams.get("limit") ?? "50"), 100);
    const offset = Math.max(Number(url.searchParams.get("offset") ?? "0"), 0);

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
      auth: { persistSession: false },
    });

    let data: unknown;
    if (kind === "leaderboard") {
      const r = await supabase.rpc("get_cached_weekly_xp_top", { _limit: limit });
      if (r.error) throw r.error;
      data = r.data;
    } else {
      const r = await supabase.rpc("get_cached_wall_feed", { _limit: limit, _offset: offset });
      if (r.error) throw r.error;
      data = r.data;
    }

    return new Response(JSON.stringify({ data }), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        // CDN edge caches for 30s; serves stale up to 2min while revalidating.
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120",
      },
    });
  } catch (err) {
    console.error("[public-feed] error", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "unknown" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
