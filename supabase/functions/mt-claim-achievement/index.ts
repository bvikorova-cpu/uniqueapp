// Megatalent: claim achievement reward (xp + credits).
// Body: { achievement_key: string }
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

    const { achievement_key } = await req.json();
    if (!achievement_key || typeof achievement_key !== "string") throw new Error("achievement_key required");

    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    const { data: ach, error: aerr } = await admin
      .from("mt_achievements")
      .select("id, reward_xp, reward_credits, active")
      .eq("achievement_key", achievement_key)
      .maybeSingle();
    if (aerr || !ach || !ach.active) throw new Error("Achievement not found");

    const { data: ua } = await admin
      .from("mt_user_achievements")
      .select("id, unlocked_at, claimed_at")
      .eq("user_id", user.id)
      .eq("achievement_id", ach.id)
      .maybeSingle();
    if (!ua || !ua.unlocked_at) throw new Error("Achievement not unlocked");
    if (ua.claimed_at) throw new Error("Already claimed");

    await admin
      .from("mt_user_achievements")
      .update({ claimed_at: new Date().toISOString() })
      .eq("id", ua.id);

    // Credit reward via profiles.credits
    if (ach.reward_credits > 0) {
      const { data: prof } = await admin.from("profiles").select("credits").eq("user_id", user.id).maybeSingle();
      const cur = (prof as any)?.credits ?? 0;
      await admin.from("profiles").update({ credits: cur + ach.reward_credits }).eq("user_id", user.id);
    }

    return new Response(JSON.stringify({ ok: true, xp: ach.reward_xp, credits: ach.reward_credits }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[mt-claim-achievement]", msg);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
