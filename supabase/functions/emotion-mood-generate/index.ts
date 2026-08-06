import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { spendAiCredits } from "../_shared/spendCredits.ts";
import { askAIJSON } from "../_shared/unifiedAI.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const COST = 2;
const EMOTIONS = ["joy", "love", "motivation", "peace", "excitement", "sadness", "anger", "fear"] as const;

const clampUnit = (n: unknown) => {
  const v = Math.round(Number(n) || 0);
  return Math.max(0, Math.min(20, v));
};

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
    const moodText = String(body.mood_text ?? "").trim().slice(0, 800);
    if (moodText.length < 3) {
      return new Response(JSON.stringify({ error: "Describe your mood first (at least 3 characters)." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(supabaseUrl, serviceKey);

    const spend = await spendAiCredits(admin as any, userId, COST, "Mood Emotion Generator", "emotion-mood-generate");
    if (!spend.ok) {
      return new Response(
        JSON.stringify({ error: "Insufficient credits", code: "INSUFFICIENT_CREDITS", required: COST, remaining: spend.remaining }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    let parsed: any = null;
    try {
      parsed = await askAIJSON(
        `You analyze a person's current mood and convert it into emotion units for a playful emotion economy.
Return strict JSON: {"dominant_emotion":"one of joy|love|motivation|peace|excitement|sadness|anger|fear",
"breakdown":{"joy":0-20,"love":0-20,"motivation":0-20,"peace":0-20,"excitement":0-20,"sadness":0-20,"anger":0-20,"fear":0-20},
"insight":"2 short supportive sentences in English"}.
The breakdown values are generated emotion units; total should be between 20 and 45.`,
        `Current mood description: ${moodText}`,
      );
    } catch (_aiErr) {
      parsed = null;
    }

    // Deterministic fallback if AI is unavailable — user already paid, so always deliver units.
    const breakdown: Record<string, number> = {};
    let total = 0;
    for (const e of EMOTIONS) {
      const v = parsed?.breakdown ? clampUnit(parsed.breakdown[e]) : 0;
      breakdown[e] = v;
      total += v;
    }
    if (total === 0) {
      for (const e of EMOTIONS) breakdown[e] = Math.floor(Math.random() * 6) + 1;
    }

    let dominant = String(parsed?.dominant_emotion ?? "").toLowerCase();
    if (!EMOTIONS.includes(dominant as any)) {
      dominant = Object.entries(breakdown).sort((a, b) => b[1] - a[1])[0][0];
    }
    const insight = typeof parsed?.insight === "string" && parsed.insight.trim()
      ? parsed.insight.trim().slice(0, 500)
      : "Your mood has been converted into emotion units. Trade them in the exchange or keep them in your wallet.";

    // Credit the emotion wallet
    const { data: wallet } = await admin
      .from("emotion_wallets")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    const walletPatch: Record<string, number> = {};
    for (const e of EMOTIONS) {
      const col = `${e}_balance`;
      walletPatch[col] = (Number((wallet as any)?.[col]) || 0) + breakdown[e];
    }
    const mined = Object.values(breakdown).reduce((a, b) => a + b, 0);

    if (wallet) {
      await admin
        .from("emotion_wallets")
        .update({ ...walletPatch, total_mined: (Number((wallet as any).total_mined) || 0) + mined })
        .eq("user_id", userId);
    } else {
      await admin.from("emotion_wallets").insert({ user_id: userId, ...walletPatch, total_mined: mined });
    }

    const { data: record } = await admin
      .from("emotion_mood_generations")
      .insert({
        user_id: userId,
        mood_text: moodText,
        dominant_emotion: dominant,
        breakdown,
        insight,
        credits_spent: COST,
      })
      .select()
      .maybeSingle();

    return new Response(
      JSON.stringify({ success: true, dominant_emotion: dominant, breakdown, insight, total_units: mined, record }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("emotion-mood-generate error", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
