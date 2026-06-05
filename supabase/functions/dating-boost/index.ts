import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BOOST_COST = 20;
const BOOST_DURATION_MIN = 30;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Unauthorized" }, 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userErr } = await userClient.auth.getUser();
    if (userErr || !user) return json({ error: "Unauthorized" }, 401);

    const admin = createClient(supabaseUrl, serviceKey);

    // Check active boost
    const { data: active } = await admin
      .from("dating_boosts")
      .select("expires_at")
      .eq("user_id", user.id)
      .gt("expires_at", new Date().toISOString())
      .order("expires_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (active) return json({ error: "Boost already active", expires_at: active.expires_at }, 409);

    // Deduct credits via existing RPC
    const { data: deductResult, error: deductErr } = await admin.rpc("deduct_ai_credits", {
      _user_id: user.id,
      _amount: BOOST_COST,
      _reason: "dating_boost_30min",
    });
    if (deductErr || deductResult === false) {
      return json({ error: "INSUFFICIENT_CREDITS", message: "Need 20 credits for boost" }, 402);
    }

    const expiresAt = new Date(Date.now() + BOOST_DURATION_MIN * 60_000).toISOString();
    const { error: insErr } = await admin.from("dating_boosts").insert({
      user_id: user.id,
      expires_at: expiresAt,
      credits_spent: BOOST_COST,
    });
    if (insErr) return json({ error: insErr.message }, 500);

    return json({ success: true, expires_at: expiresAt, duration_min: BOOST_DURATION_MIN });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
