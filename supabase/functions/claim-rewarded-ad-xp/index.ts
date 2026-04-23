import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Unlimited daily views — users keep earning XP every time they watch.
// Hitting a hard cap kills engagement, so we only track views for analytics.
const XP_PER_VIEW = 5;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const userClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userErr } = await userClient.auth.getUser();
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const sectionKey = String(body?.section_key ?? "").trim().slice(0, 64);
    if (!sectionKey) {
      return new Response(JSON.stringify({ error: "section_key required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const today = new Date().toISOString().split("T")[0];

    const { error: insertErr } = await supabase
      .from("rewarded_ad_views")
      .insert({
        user_id: user.id,
        section_key: sectionKey,
        xp_awarded: XP_PER_VIEW,
        view_date: today,
      });
    if (insertErr) throw insertErr;

    const { error: rpcErr } = await supabase.rpc("add_user_points", {
      p_user_id: user.id,
      p_points: XP_PER_VIEW,
      p_activity_type: `rewarded_ad_${sectionKey}`,
    });
    if (rpcErr) console.error("add_user_points failed", rpcErr);

    return new Response(
      JSON.stringify({
        success: true,
        xp_awarded: XP_PER_VIEW,
        remaining: null, // unlimited
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (e) {
    console.error("claim-rewarded-ad-xp error", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
