// Emotion Economy — unified credit-based backend.
// Every paid action in the module spends unified `ai_credits` (no Stripe, no subscriptions).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { spendAiCredits } from "../_shared/spendCredits.ts";
import { askAIJSON } from "../_shared/unifiedAI.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const EMOTIONS = [
  "joy", "love", "motivation", "peace", "excitement", "curiosity", "sadness", "anger", "fear",
];

export const INSURANCE_PLANS: Record<string, { credits: number; maxClaims: number; label: string }> = {
  basic: { credits: 10, maxClaims: 5, label: "Basic Protection" },
  standard: { credits: 20, maxClaims: 10, label: "Standard Protection" },
  premium: { credits: 40, maxClaims: 999, label: "Premium Protection" },
};

const ANALYZE_COST = 1;
const DROP_JOIN_COST = 3;
const DROP_CREATE_COST = 5;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Unauthorized" }, 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) return json({ error: "Unauthorized" }, 401);
    const userId = userData.user.id;

    const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
    const body = await req.json().catch(() => ({}));
    const action = String(body.action ?? "");

    const charge = async (amount: number, reason: string) => {
      const res = await spendAiCredits(admin, userId, amount, reason, "emotion-economy");
      if (!res.ok) {
        return json(
          { error: "Insufficient credits", code: "INSUFFICIENT_CREDITS", required: amount, remaining: res.remaining },
          402,
        );
      }
      return null;
    };

    // ---------------------------------------------------------------- analyze
    if (action === "analyze_post") {
      const content = String(body.content ?? "").slice(0, 2000);
      if (!content.trim()) return json({ error: "Content required" }, 400);

      const err = await charge(ANALYZE_COST, "Emotion Feed AI analysis");
      if (err) return err;

      let emotions: Record<string, unknown>;
      try {
        emotions = await askAIJSON<Record<string, unknown>>(
          `You are an emotion-detection engine. Return ONLY JSON:
{"dominant_emotion":"joy|love|motivation|peace|excitement|curiosity|sadness|anger|fear","joy":0-100,"love":0-100,"motivation":0-100,"peace":0-100,"excitement":0-100,"curiosity":0-100,"sadness":0-100,"anger":0-100,"fear":0-100,"emotional_summary":"one short sentence"}`,
          content,
        );
      } catch (_e) {
        // Refund on AI failure
        const { data: row } = await admin.from("ai_credits").select("credits_remaining").eq("user_id", userId).maybeSingle();
        await admin.from("ai_credits")
          .update({ credits_remaining: (row?.credits_remaining ?? 0) + ANALYZE_COST })
          .eq("user_id", userId);
        return json({ error: "Emotion analysis is temporarily unavailable. Your credit was refunded." }, 503);
      }

      const dominant = String(emotions?.dominant_emotion ?? "joy").toLowerCase();
      const reward = Math.max(1, Math.round(Number(emotions?.[dominant] ?? 50) / 10));

      // Reward the detected emotion into the user's wallet
      const col = `${EMOTIONS.includes(dominant) ? dominant : "joy"}_balance`;
      const { data: wallet } = await admin.from("emotion_wallets").select("*").eq("user_id", userId).maybeSingle();
      if (wallet) {
        await admin.from("emotion_wallets")
          .update({ [col]: (Number((wallet as any)[col]) || 0) + reward, total_mined: (wallet.total_mined ?? 0) + reward })
          .eq("user_id", userId);
      } else {
        await admin.from("emotion_wallets").insert({ user_id: userId, [col]: reward, total_mined: reward });
      }

      const { data: credits } = await admin.from("ai_credits").select("credits_remaining").eq("user_id", userId).maybeSingle();
      return json({ success: true, emotions, emotion_reward: reward, credits_remaining: credits?.credits_remaining ?? 0 });
    }

    // -------------------------------------------------------------- insurance
    if (action === "insurance") {
      const level = String(body.level ?? "");
      const plan = INSURANCE_PLANS[level];
      if (!plan) return json({ error: "Invalid plan" }, 400);

      const err = await charge(plan.credits, `Emotion Insurance — ${plan.label}`);
      if (err) return err;

      const now = new Date();
      const expires = new Date(now.getTime() + 30 * 86400_000);
      await admin.from("emotion_insurance")
        .update({ status: "expired" })
        .eq("user_id", userId)
        .eq("status", "active");

      const { data: policy, error: insErr } = await admin.from("emotion_insurance").insert({
        user_id: userId,
        coverage_level: level,
        monthly_price: plan.credits,
        max_claims: plan.maxClaims,
        started_at: now.toISOString(),
        expires_at: expires.toISOString(),
        status: "active",
      }).select().single();
      if (insErr) throw insErr;

      const { data: credits } = await admin.from("ai_credits").select("credits_remaining").eq("user_id", userId).maybeSingle();
      return json({ success: true, policy, level, credits_charged: plan.credits, credits_remaining: credits?.credits_remaining ?? 0 });
    }

    // ------------------------------------------------------------- market buy
    if (action === "market_buy") {
      const emotionType = String(body.emotion_type ?? "").toLowerCase();
      const amount = Math.floor(Number(body.amount ?? 0));
      const cost = Math.floor(Number(body.credits ?? 0));
      const listingId = body.listing_id ? String(body.listing_id) : null;

      if (!EMOTIONS.includes(emotionType) || amount <= 0 || amount > 1000 || cost <= 0 || cost > 500) {
        return json({ error: "Invalid purchase" }, 400);
      }

      let sellerId: string | null = null;
      if (listingId) {
        const { data: listing } = await admin.from("emotion_market_listings")
          .select("*").eq("id", listingId).eq("status", "active").maybeSingle();
        if (!listing) return json({ error: "Listing not available" }, 404);
        if (listing.seller_id === userId) return json({ error: "You cannot buy your own listing" }, 400);
        sellerId = listing.seller_id;
      }

      const err = await charge(cost, `Emotion Market — ${amount} ${emotionType}`);
      if (err) return err;

      // Credit the buyer's emotion wallet
      const col = `${emotionType}_balance`;
      const { data: wallet } = await admin.from("emotion_wallets").select("*").eq("user_id", userId).maybeSingle();
      if (wallet) {
        await admin.from("emotion_wallets")
          .update({ [col]: (Number((wallet as any)[col]) || 0) + amount, total_traded: (wallet.total_traded ?? 0) + 1 })
          .eq("user_id", userId);
      } else {
        await admin.from("emotion_wallets").insert({ user_id: userId, [col]: amount, total_traded: 1 });
      }

      // Pay the seller in credits and close the listing
      if (sellerId) {
        const { data: sellerCredits } = await admin.from("ai_credits").select("credits_remaining").eq("user_id", sellerId).maybeSingle();
        if (sellerCredits) {
          await admin.from("ai_credits")
            .update({ credits_remaining: (sellerCredits.credits_remaining ?? 0) + cost })
            .eq("user_id", sellerId);
        } else {
          await admin.from("ai_credits").insert({ user_id: sellerId, credits_remaining: cost });
        }
        await admin.from("emotion_market_listings").update({ status: "sold" }).eq("id", listingId);
      }

      await admin.from("emotion_transactions").insert({
        buyer_id: userId,
        seller_id: sellerId,
        emotion_type: emotionType,
        amount,
        price: cost,
        transaction_type: "market_buy",
        status: "completed",
      });

      const { data: credits } = await admin.from("ai_credits").select("credits_remaining").eq("user_id", userId).maybeSingle();
      return json({ success: true, amount, emotion_type: emotionType, credits_charged: cost, credits_remaining: credits?.credits_remaining ?? 0 });
    }

    // -------------------------------------------------------------- drops
    if (action === "drop_join") {
      const dropKey = String(body.drop_key ?? "").slice(0, 60);
      const emotionType = EMOTIONS.includes(String(body.emotion_type ?? "").toLowerCase())
        ? String(body.emotion_type).toLowerCase() : "joy";
      if (!dropKey) return json({ error: "Drop required" }, 400);

      const err = await charge(DROP_JOIN_COST, `Emotion Drop — ${dropKey}`);
      if (err) return err;

      const gain = Math.floor(Math.random() * 20) + 20; // 20-39 emotion units
      const col = `${emotionType}_balance`;
      const { data: wallet } = await admin.from("emotion_wallets").select("*").eq("user_id", userId).maybeSingle();
      if (wallet) {
        await admin.from("emotion_wallets")
          .update({ [col]: (Number((wallet as any)[col]) || 0) + gain })
          .eq("user_id", userId);
      } else {
        await admin.from("emotion_wallets").insert({ user_id: userId, [col]: gain });
      }

      const { data: credits } = await admin.from("ai_credits").select("credits_remaining").eq("user_id", userId).maybeSingle();
      return json({ success: true, gained: gain, emotion_type: emotionType, credits_charged: DROP_JOIN_COST, credits_remaining: credits?.credits_remaining ?? 0 });
    }

    if (action === "drop_create") {
      const name = String(body.drop_name ?? "").slice(0, 80).trim();
      const emotionType = EMOTIONS.includes(String(body.emotion_type ?? "").toLowerCase())
        ? String(body.emotion_type).toLowerCase() : "joy";
      if (!name) return json({ error: "Drop name required" }, 400);

      const err = await charge(DROP_CREATE_COST, `Create Emotion Drop — ${name}`);
      if (err) return err;

      const { data: drop, error: insErr } = await admin.from("emotion_drops").insert({
        creator_id: userId,
        drop_name: name,
        emotion_type: emotionType,
        drop_time: new Date(Date.now() + 86400_000).toISOString(),
        price: DROP_JOIN_COST,
        total_amount: 1000,
        max_participants: 200,
        status: "scheduled",
      }).select().single();
      if (insErr) throw insErr;

      const { data: credits } = await admin.from("ai_credits").select("credits_remaining").eq("user_id", userId).maybeSingle();
      return json({ success: true, drop, credits_charged: DROP_CREATE_COST, credits_remaining: credits?.credits_remaining ?? 0 });
    }

    return json({ error: "Unknown action" }, 400);
  } catch (e) {
    console.error("emotion-economy error", e);
    return json({ error: (e as Error).message }, 500);
  }
});
