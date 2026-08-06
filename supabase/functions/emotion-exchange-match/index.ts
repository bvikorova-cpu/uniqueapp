import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { spendAiCredits } from "../_shared/spendCredits.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const EMOTIONS = ["joy", "love", "motivation", "peace", "excitement", "sadness", "anger", "fear"];
const COST = 1;
const AMOUNT = 10;

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
    const action = String(body.action ?? "join");
    const admin = createClient(supabaseUrl, serviceKey);

    if (action === "cancel") {
      await admin
        .from("emotion_exchange_queue")
        .update({ status: "cancelled" })
        .eq("user_id", userId)
        .eq("status", "pending");
      return new Response(JSON.stringify({ success: true, cancelled: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const offerEmotion = String(body.offer_emotion ?? "").toLowerCase();
    const wantEmotion = String(body.want_emotion ?? "").toLowerCase();
    if (!EMOTIONS.includes(offerEmotion) || !EMOTIONS.includes(wantEmotion) || offerEmotion === wantEmotion) {
      return new Response(JSON.stringify({ error: "Pick two different emotions." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const offerCol = `${offerEmotion}_balance`;
    const wantCol = `${wantEmotion}_balance`;

    const { data: myWallet } = await admin
      .from("emotion_wallets")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (!myWallet || (Number((myWallet as any)[offerCol]) || 0) < AMOUNT) {
      return new Response(
        JSON.stringify({ error: `You need at least ${AMOUNT} ${offerEmotion} units to enter the exchange.` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Already queued?
    const { data: existing } = await admin
      .from("emotion_exchange_queue")
      .select("id")
      .eq("user_id", userId)
      .eq("status", "pending")
      .maybeSingle();
    if (existing) {
      return new Response(JSON.stringify({ success: true, status: "waiting", already_queued: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Find a random compatible opponent
    const { data: candidates } = await admin
      .from("emotion_exchange_queue")
      .select("*")
      .eq("status", "pending")
      .eq("offer_emotion", wantEmotion)
      .eq("want_emotion", offerEmotion)
      .neq("user_id", userId)
      .limit(25);

    const pool = candidates ?? [];
    const opponent = pool.length ? pool[Math.floor(Math.random() * pool.length)] : null;

    const spend = await spendAiCredits(admin as any, userId, COST, "Emotion Exchange entry", "emotion-exchange");
    if (!spend.ok) {
      return new Response(
        JSON.stringify({ error: "Insufficient credits", code: "INSUFFICIENT_CREDITS", required: COST, remaining: spend.remaining }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (!opponent) {
      const { data: queued } = await admin
        .from("emotion_exchange_queue")
        .insert({
          user_id: userId,
          offer_emotion: offerEmotion,
          offer_amount: AMOUNT,
          want_emotion: wantEmotion,
        })
        .select()
        .maybeSingle();

      return new Response(JSON.stringify({ success: true, status: "waiting", queued }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify opponent still has the units
    const { data: oppWallet } = await admin
      .from("emotion_wallets")
      .select("*")
      .eq("user_id", opponent.user_id)
      .maybeSingle();

    if (!oppWallet || (Number((oppWallet as any)[wantCol]) || 0) < AMOUNT) {
      await admin.from("emotion_exchange_queue").update({ status: "cancelled" }).eq("id", opponent.id);
      const { data: queued } = await admin
        .from("emotion_exchange_queue")
        .insert({
          user_id: userId,
          offer_emotion: offerEmotion,
          offer_amount: AMOUNT,
          want_emotion: wantEmotion,
        })
        .select()
        .maybeSingle();
      return new Response(JSON.stringify({ success: true, status: "waiting", queued }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Execute the swap
    await admin
      .from("emotion_wallets")
      .update({
        [offerCol]: (Number((myWallet as any)[offerCol]) || 0) - AMOUNT,
        [wantCol]: (Number((myWallet as any)[wantCol]) || 0) + AMOUNT,
        total_traded: (Number((myWallet as any).total_traded) || 0) + AMOUNT,
      })
      .eq("user_id", userId);

    await admin
      .from("emotion_wallets")
      .update({
        [wantCol]: (Number((oppWallet as any)[wantCol]) || 0) - AMOUNT,
        [offerCol]: (Number((oppWallet as any)[offerCol]) || 0) + AMOUNT,
        total_traded: (Number((oppWallet as any).total_traded) || 0) + AMOUNT,
      })
      .eq("user_id", opponent.user_id);

    await admin
      .from("emotion_exchange_queue")
      .update({ status: "matched", matched_with: userId, matched_at: new Date().toISOString() })
      .eq("id", opponent.id);

    const { data: match } = await admin
      .from("emotion_exchange_matches")
      .insert({
        user_a: userId,
        emotion_a: offerEmotion,
        amount_a: AMOUNT,
        user_b: opponent.user_id,
        emotion_b: wantEmotion,
        amount_b: AMOUNT,
      })
      .select()
      .maybeSingle();

    return new Response(
      JSON.stringify({
        success: true,
        status: "matched",
        gave: { emotion: offerEmotion, amount: AMOUNT },
        received: { emotion: wantEmotion, amount: AMOUNT },
        opponent_short: String(opponent.user_id).substring(0, 8),
        match,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("emotion-exchange-match error", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
