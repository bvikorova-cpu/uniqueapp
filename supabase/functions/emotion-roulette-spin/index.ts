import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { spendAiCredits } from "../_shared/spendCredits.ts";

const corsHeaders = { "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type" };

const EMOTIONS = ["joy", "love", "motivation", "peace", "excitement", "curiosity"];
const SPIN_COST = 1;
const WIN_PAYOUT = 0; // Spins never pay out AI credits — winners receive emotion units instead.

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

    // No AI credits are ever paid out by spins (credits stay purchase-only).

    // Emotion units always change on a spin: 10 units of the winning emotion,
    // 2 consolation units of whatever landed on a loss.
    const unitEmotion = won ? betEmotion : resultEmotion;
    const unitGain = won ? 25 : 2;
    const WALLET_EMOTIONS = ["joy", "love", "motivation", "peace", "excitement", "sadness", "anger", "fear"];
    const unitCol = `${WALLET_EMOTIONS.includes(unitEmotion) ? unitEmotion : "joy"}_balance`;
    const { data: wallet } = await admin
      .from("emotion_wallets").select("*").eq("user_id", userId).maybeSingle();
    if (wallet) {
      await admin.from("emotion_wallets").update({
        [unitCol]: (Number((wallet as any)[unitCol]) || 0) + unitGain,
        total_mined: (Number((wallet as any).total_mined) || 0) + unitGain,
      }).eq("user_id", userId);
    } else {
      await admin.from("emotion_wallets").insert({
        user_id: userId, [unitCol]: unitGain, total_mined: unitGain,
      });
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
      JSON.stringify({ success: true, result_emotion: resultEmotion, won, payout, spin, units_gained: unitGain, unit_emotion: unitEmotion }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("emotion-roulette-spin error", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
