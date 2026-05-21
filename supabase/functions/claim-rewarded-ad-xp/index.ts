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

    // Soft throttle: enforce 10s cooldown between claims (anti-fraud, prevents bot spam).
    // Must stay below the UI's WATCH_SECONDS (15s) so legitimate users never hit it.
    const THROTTLE_SECONDS = 10;
    const cutoff = new Date(Date.now() - THROTTLE_SECONDS * 1000).toISOString();
    const { data: recent } = await supabase
      .from("rewarded_ad_views")
      .select("created_at")
      .eq("user_id", user.id)
      .gte("created_at", cutoff)
      .order("created_at", { ascending: false })
      .limit(1);

    if (recent && recent.length > 0) {
      const elapsed = Math.floor((Date.now() - new Date(recent[0].created_at).getTime()) / 1000);
      const wait = Math.max(1, THROTTLE_SECONDS - elapsed);
      return new Response(
        JSON.stringify({ error: "Too fast", retry_after: wait }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Soft fraud detection: count today's views (no block, just flag)
    const { count: todayCount } = await supabase
      .from("rewarded_ad_views")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("view_date", today);

    const SUSPICIOUS_THRESHOLD = 500;
    if ((todayCount ?? 0) >= SUSPICIOUS_THRESHOLD) {
      await supabase
        .from("rewarded_ad_fraud_flags")
        .upsert(
          {
            user_id: user.id,
            flag_date: today,
            view_count: (todayCount ?? 0) + 1,
            reason: `Exceeded ${SUSPICIOUS_THRESHOLD} views/day`,
          },
          { onConflict: "user_id,flag_date" }
        );
    }

    const { error: insertErr } = await supabase
      .from("rewarded_ad_views")
      .insert({
        user_id: user.id,
        section_key: sectionKey,
        xp_awarded: XP_PER_VIEW,
        view_date: today,
      });
    if (insertErr) {
      // 23505 = unique_violation → atomic 30s throttle hit (race-condition safe)
      const code = (insertErr as { code?: string }).code;
      if (code === "23505") {
        return new Response(
          JSON.stringify({ error: "Too fast", retry_after: 30 }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw insertErr;
    }

    const { error: rpcErr } = await supabase.rpc("add_user_points", {
      p_user_id: user.id,
      p_points: XP_PER_VIEW,
      p_activity_type: `rewarded_ad_${sectionKey}`,
    });
    if (rpcErr) console.error("add_user_points failed", rpcErr);

    // #9 Streak bonus — award once per day on the first view that completes a milestone
    let streakBonus = 0;
    let streakDays = 0;
    try {
      // count today's views (just inserted = 1 means this is the first today)
      const { count: todayViews } = await supabase
        .from("rewarded_ad_views")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("view_date", today);

      if ((todayViews ?? 0) === 1) {
        const { data: streakData } = await supabase.rpc("compute_xp_streak", { p_user_id: user.id });
        streakDays = Number(streakData ?? 0);
        const milestoneBonus: Record<number, number> = { 3: 10, 7: 30, 14: 75, 30: 200 };
        streakBonus = milestoneBonus[streakDays] ?? 0;

        if (streakBonus > 0) {
          await supabase.rpc("add_user_points", {
            p_user_id: user.id,
            p_points: streakBonus,
            p_activity_type: `xp_streak_${streakDays}d`,
          });
          await supabase.from("notifications").insert({
            user_id: user.id,
            title: `🔥 ${streakDays}-day streak!`,
            message: `You earned a +${streakBonus} XP streak bonus. Keep it up!`,
            type: "xp_streak_bonus",
            is_read: false,
          });
        }
      }
    } catch (e) {
      console.error("streak bonus failed", e);
    }

    return new Response(
      JSON.stringify({
        success: true,
        xp_awarded: XP_PER_VIEW,
        streak_days: streakDays,
        streak_bonus: streakBonus,
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
