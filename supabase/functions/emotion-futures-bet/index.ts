import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const EMOTIONS = ["joy", "love", "motivation", "peace", "excitement", "curiosity"];
const BET_COST = 2;
const RESOLUTION_DAYS = 7;

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
    const emotionType = String(body.emotion_type ?? "").toLowerCase();
    const direction = String(body.direction ?? "").toLowerCase();
    if (!EMOTIONS.includes(emotionType) || !["up", "down"].includes(direction)) {
      return new Response(JSON.stringify({ error: "Invalid bet" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(supabaseUrl, serviceKey);

    // Manual atomic deduct
    const { data: credits } = await admin
      .from("emotion_credits")
      .select("credits_remaining,total_credits_used")
      .eq("user_id", userId)
      .maybeSingle();
    if (!credits || credits.credits_remaining < BET_COST) {
      return new Response(JSON.stringify({ error: "Insufficient credits" }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { error: updErr } = await admin
      .from("emotion_credits")
      .update({
        credits_remaining: credits.credits_remaining - BET_COST,
        total_credits_used: (credits.total_credits_used ?? 0) + BET_COST,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .gte("credits_remaining", BET_COST);
    if (updErr) throw updErr;

    const resolutionDate = new Date(Date.now() + RESOLUTION_DAYS * 86400_000)
      .toISOString().slice(0, 10);

    const { data: bet, error: insErr } = await admin
      .from("emotion_futures_bets")
      .insert({
        user_id: userId,
        emotion_type: emotionType,
        direction,
        amount: BET_COST,
        resolution_date: resolutionDate,
      })
      .select()
      .single();
    if (insErr) throw insErr;

    return new Response(
      JSON.stringify({ success: true, bet, resolution_date: resolutionDate }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("emotion-futures-bet error", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
