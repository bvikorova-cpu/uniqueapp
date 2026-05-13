// For You feed ranking edge function
// Returns ordered list of post IDs ranked by engagement + recency decay
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } } },
    );

    const { limit = 50 } = (await req.json().catch(() => ({}))) as { limit?: number };

    // Pull recent posts (last 7d) with engagement counts.
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data, error } = await supabase
      .from("posts")
      .select("id, created_at, likes_count, comments_count, shares_count, reposts_count")
      .gte("created_at", sevenDaysAgo)
      .order("created_at", { ascending: false })
      .limit(500);

    if (error) throw error;

    const now = Date.now();
    const ranked = (data ?? [])
      .map((p) => {
        const ageHours = (now - new Date(p.created_at).getTime()) / 36e5;
        // engagement score with recency decay
        const engagement =
          (p.likes_count ?? 0) * 3 +
          (p.comments_count ?? 0) * 5 +
          (p.shares_count ?? 0) * 4 +
          (p.reposts_count ?? 0) * 4;
        const decay = Math.pow(ageHours + 2, 1.4);
        const score = (engagement + 1) / decay;
        return { id: p.id, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return new Response(JSON.stringify({ ids: ranked.map((r) => r.id) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
