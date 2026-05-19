import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const XP_REWARD = 25;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Unauthorized" }, 401);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data: { user } } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
    if (!user) return json({ error: "Unauthorized" }, 401);

    const body = await req.json().catch(() => ({}));
    const client_token = typeof body.client_token === "string" ? body.client_token : "";
    if (!client_token || client_token.length < 20) return json({ error: "invalid_token" }, 400);

    // Cooldown re-check
    const { data: last } = await supabase
      .from("ad_reward_log")
      .select("verified_at")
      .eq("user_id", user.id)
      .order("verified_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (last && Date.now() - new Date(last.verified_at).getTime() < 60_000) {
      return json({ error: "cooldown" }, 429);
    }

    // Lookup session
    const { data: session } = await supabase
      .from("ad_sessions")
      .select("id, user_id, provider, ad_unit_id, consumed_at, expires_at")
      .eq("client_token", client_token)
      .maybeSingle();

    if (!session || session.user_id !== user.id) return json({ error: "session_not_found" }, 404);
    if (session.consumed_at) return json({ error: "session_already_used" }, 409);
    if (new Date(session.expires_at).getTime() < Date.now()) return json({ error: "session_expired" }, 410);

    // Mark consumed
    const { error: consumeErr } = await supabase
      .from("ad_sessions")
      .update({ consumed_at: new Date().toISOString() })
      .eq("id", session.id)
      .is("consumed_at", null);
    if (consumeErr) return json({ error: "consume_failed" }, 500);

    // Insert reward log (unique on client_token guards double-claim)
    const { error: logErr } = await supabase.from("ad_reward_log").insert({
      user_id: user.id,
      provider: session.provider,
      ad_unit_id: session.ad_unit_id,
      xp_granted: XP_REWARD,
      client_token,
    });
    if (logErr) return json({ error: "log_failed", detail: logErr.message }, 500);

    // Grant XP — upsert user_xp + insert xp_events
    const { data: xpRow } = await supabase
      .from("user_xp")
      .select("total_xp")
      .eq("user_id", user.id)
      .maybeSingle();

    const newTotal = (xpRow?.total_xp ?? 0) + XP_REWARD;
    await supabase
      .from("user_xp")
      .upsert({ user_id: user.id, total_xp: newTotal, updated_at: new Date().toISOString() }, { onConflict: "user_id" });

    await supabase.from("xp_events").insert({
      user_id: user.id,
      source: "rewarded_ad",
      amount: XP_REWARD,
      ref_id: client_token,
    });

    return json({ success: true, xp_granted: XP_REWARD, total_xp: newTotal });
  } catch (e) {
    return json({ error: String(e?.message ?? e) }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
