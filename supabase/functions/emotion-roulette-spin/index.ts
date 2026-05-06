import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const EMOTIONS = ["joy", "love", "motivation", "peace", "excitement", "curiosity"];
const SPIN_COST = 1;
const WIN_PAYOUT = 2;

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
    const betEmotion = String(body.bet_emotion ?? "").toLowerCase();
    if (!EMOTIONS.includes(betEmotion)) {
      return new Response(JSON.stringify({ error: "Invalid bet emotion" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(supabaseUrl, serviceKey);

    // Atomically deduct credits
    const { data: deducted, error: deductErr } = await admin.rpc(
      "deduct_emotion_credits_for_user" as unknown as never,
      { p_user_id: userId, p_amount: SPIN_COST },
    );
    if (deductErr) {
      // Fallback: manual deduct
      const { data: credits } = await admin
        .from("emotion_credits")
        .select("credits_remaining,total_credits_used")
        .eq("user_id", userId)
        .maybeSingle();
      if (!credits || credits.credits_remaining < SPIN_COST) {
        return new Response(JSON.stringify({ error: "Insufficient credits" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      await admin
        .from("emotion_credits")
        .update({
          credits_remaining: credits.credits_remaining - SPIN_COST,
          total_credits_used: (credits.total_credits_used ?? 0) + SPIN_COST,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);
    } else if (deducted === false) {
      return new Response(JSON.stringify({ error: "Insufficient credits" }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Server-side RNG
    const resultEmotion = EMOTIONS[Math.floor(Math.random() * EMOTIONS.length)];
    const won = resultEmotion === betEmotion;
    const payout = won ? WIN_PAYOUT : 0;

    // Credit winnings back as credits
    if (won && payout > 0) {
      const { data: credits } = await admin
        .from("emotion_credits")
        .select("credits_remaining,total_credits_purchased")
        .eq("user_id", userId)
        .maybeSingle();
      if (credits) {
        await admin
          .from("emotion_credits")
          .update({
            credits_remaining: credits.credits_remaining + payout,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId);
      }
    }

    const { data: spin, error: insErr } = await admin
      .from("emotion_roulette_spins")
      .insert({
        user_id: userId,
        bet_emotion: betEmotion,
        bet_amount: SPIN_COST,
        result_emotion: resultEmotion,
        won,
        payout,
      })
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
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
