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

    const { season_id, tier_level } = await req.json();
    if (!season_id || typeof tier_level !== "number") throw new Error("season_id + tier_level required");

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

    // Check user xp from profiles (or fallback 0)
    const { data: prof } = await admin.from("profiles").select("credits, xp").eq("user_id", user.id).maybeSingle();
    const userXp = (prof as any)?.xp ?? 0;
    if (userXp < reward.xp_required) throw new Error("Not enough XP");

    // Idempotency: ensure not already claimed
    const { data: existing } = await admin
      .from("mt_season_pass_claims")
      .select("id")
      .eq("user_id", user.id)
      .eq("season_id", season_id)
      .eq("tier_level", tier_level)
      .maybeSingle();
    if (existing) throw new Error("Already claimed");

    await admin.from("mt_season_pass_claims").insert({
      user_id: user.id, season_id, tier_level, reward_label: reward.reward_label,
    });

    // Apply credit reward if type=credits
    if (reward.reward_type === "credits") {
      const amt = Number((reward.reward_payload as any)?.amount ?? 0);
      if (amt > 0) {
        const cur = (prof as any)?.credits ?? 0;
        await admin.from("profiles").update({ credits: cur + amt }).eq("user_id", user.id);
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
