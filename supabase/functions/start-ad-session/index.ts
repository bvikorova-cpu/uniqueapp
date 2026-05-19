import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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
    const provider = body.provider === "admob" ? "admob" : "adsense";
    const ad_unit_id = typeof body.ad_unit_id === "string" ? body.ad_unit_id.slice(0, 200) : null;

    // Cooldown check (60s)
    const { data: last } = await supabase
      .from("ad_reward_log")
      .select("verified_at")
      .eq("user_id", user.id)
      .order("verified_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (last) {
      const elapsed = Date.now() - new Date(last.verified_at).getTime();
      if (elapsed < 60_000) {
        return json({ error: "cooldown", retry_after_ms: 60_000 - elapsed }, 429);
      }
    }

    const client_token = crypto.randomUUID() + "." + crypto.randomUUID();
    const { error } = await supabase.from("ad_sessions").insert({
      user_id: user.id,
      client_token,
      provider,
      ad_unit_id,
    });
    if (error) return json({ error: error.message }, 500);

    return json({ client_token, expires_in: 300 });
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
