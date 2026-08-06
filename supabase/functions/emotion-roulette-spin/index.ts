import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { spendAiCredits } from "../_shared/spendCredits.ts";

const corsHeaders = { "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type" };

const EMOTIONS = ["joy", "love", "motivation", "peace", "excitement", "curiosity"];
const SPIN_COST = 1;
const WIN_PAYOUT = 2;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } } });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const userId = userData.user.id;

    const body = await req.json().catch(() => ({}));
    const betEmotion = String(body.bet_emotion ?? "").toLowerCase();
    if (!EMOTIONS.includes(betEmotion)) {
      return new Response(JSON.stringify({ error: "Invalid bet emotion" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const admin = createClient(supabaseUrl, serviceKey);

    // Spend unified AI credits
    const spend = await spendAiCredits(admin as any, userId, SPIN_COST, "Emotion Roulette spin", "emotion-roulette");
    if (!spend.ok) {
      return new Response(JSON.stringify({ error: "Insufficient credits", code: "INSUFFICIENT_CREDITS", required: SPIN_COST, remaining: spend.remaining }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Server-side RNG
    const resultEmotion = EMOTIONS[Math.floor(Math.random() * EMOTIONS.length)];
    const won = resultEmotion === betEmotion;
    const payout = won ? WIN_PAYOUT : 0;

    // Credit winnings back as unified AI credits
    if (won && payout > 0) {
      const { data: credits } = await admin
        .from("ai_credits")
        .select("credits_remaining")
        .eq("user_id", userId)
        .maybeSingle();
      if (credits) {
        await admin
          .from("ai_credits")
          .update({ credits_remaining: (credits.credits_remaining ?? 0) + payout })
          .eq("user_id", userId);
      } else {
        await admin.from("ai_credits").insert({ user_id: userId, credits_remaining: payout });
      }
    }

    const { data: spin, error: insErr } = await admin
      .from("emotion_roulette_spins")
      .insert({ user_id: userId,
        bet_emotion: betEmotion,
        bet_amount: SPIN_COST,
        result_emotion: resultEmotion,
        won,
        payout })
      .select()
      .single();
    if (insErr) throw insErr;

    return new Response(
      JSON.stringify({ success: true, result_emotion: resultEmotion, won, payout, spin }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("emotion-roulette-spin error", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
