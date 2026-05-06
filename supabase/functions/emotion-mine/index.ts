import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const ALLOWED_EMOTIONS = new Set([
  "joy", "love", "motivation", "peace", "excitement", "curiosity",
  "sadness", "anger", "fear",
]);

const ALLOWED_METHODS = new Set([
  "content_creation", "interaction", "engagement",
]);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = userData.user.id;

    const body = await req.json().catch(() => ({}));
    const emotionType = String(body.emotion_type ?? "joy").toLowerCase();
    const miningMethod = String(body.mining_method ?? "content_creation");
    if (!ALLOWED_EMOTIONS.has(emotionType) || !ALLOWED_METHODS.has(miningMethod)) {
      return new Response(JSON.stringify({ error: "Invalid input" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Server-controlled mining outcome (anti-cheat)
    const amountMined = Math.floor(Math.random() * 20) + 10; // 10-29
    const commissionRate = 0.5; // 50% server-side
    const commissionEarned = +(amountMined * commissionRate).toFixed(2);

    const admin = createClient(supabaseUrl, serviceKey);

    // Rate-limit: max 1 mine per 30s per user
    const since = new Date(Date.now() - 30_000).toISOString();
    const { count } = await admin
      .from("emotion_mining_activities")
      .select("id", { count: "exact", head: true })
      .eq("miner_id", userId)
      .gte("created_at", since);
    if ((count ?? 0) > 0) {
      return new Response(JSON.stringify({ error: "Mining cooldown — wait 30s" }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: row, error: insErr } = await admin
      .from("emotion_mining_activities")
      .insert({
        miner_id: userId,
        emotion_type: emotionType,
        amount_mined: amountMined,
        commission_earned: commissionEarned,
        mining_method: miningMethod,
      })
      .select()
      .single();
    if (insErr) throw insErr;

    return new Response(
      JSON.stringify({
        success: true,
        amount_mined: amountMined,
        commission_earned: commissionEarned,
        activity: row,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("emotion-mine error", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
