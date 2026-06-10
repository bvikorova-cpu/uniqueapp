// Megatalent: claim season pass tier reward.
// Body: { season_id: string, tier_level: number }
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    );
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No auth header");
    const { data: udata, error: uerr } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
    if (uerr || !udata.user) throw new Error("Not authenticated");
    const user = udata.user;

    const body = await req.json();
    const season_id = String(body?.season_id ?? "").slice(0, 64);
    const tier_level = Number(body?.tier_level);
    if (!season_id || !Number.isFinite(tier_level)) throw new Error("season_id + tier_level required");

    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    const { data: reward, error: rerr } = await admin
      .from("mt_season_pass_rewards")
      .select("xp_required, reward_type, reward_label, reward_payload")
      .eq("season_id", season_id)
      .eq("tier_level", tier_level)
      .maybeSingle();
    if (rerr || !reward) throw new Error("Tier not found");

    // XP comes from user_xp.total_xp, not profiles
    const { data: xpRow } = await admin
      .from("user_xp")
      .select("total_xp")
      .eq("user_id", user.id)
      .maybeSingle();
    const userXp = (xpRow as any)?.total_xp ?? 0;
    if (userXp < reward.xp_required) throw new Error("Not enough XP");

    // Atomic claim: UNIQUE (user_id, season_id, tier_level) blocks double-claim.
    const { error: insErr } = await admin.from("mt_season_pass_claims").insert({
      user_id: user.id, season_id, tier_level, reward_label: reward.reward_label,
    });
    if (insErr) {
      if ((insErr as any).code === "23505") throw new Error("Already claimed");
      throw insErr;
    }

    // Apply credit reward atomically via SECURITY DEFINER add_ai_credits()
    if (reward.reward_type === "credits") {
      const amt = Math.floor(Number((reward.reward_payload as any)?.amount ?? 0));
      if (amt > 0) {
        const { error: addErr } = await admin.rpc("add_ai_credits", {
          p_user_id: user.id,
          p_amount: amt,
          p_reason: `season_pass:${season_id}:tier_${tier_level}`,
          p_source: `season_pass_tier:${season_id}:${tier_level}`,
        });
        if (addErr) {
          console.error("[mt-season-claim-tier] add_ai_credits failed", addErr);
          // Roll back the claim so user can retry
          await admin.from("mt_season_pass_claims")
            .delete()
            .eq("user_id", user.id).eq("season_id", season_id).eq("tier_level", tier_level);
          throw new Error("Credit award failed");
        }
      }
    }

    return new Response(JSON.stringify({ ok: true, reward }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[mt-season-claim-tier]", msg);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
