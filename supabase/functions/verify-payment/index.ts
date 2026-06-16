// Universal verify-payment function
// Replaces 25+ verify-*-payment functions
// Usage: supabase.functions.invoke('verify-payment', { body: { session_id, product_type } })

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const log = (step: string, data?: unknown) => {
  console.log(`[VERIFY-PAYMENT] ${step}${data ? ` - ${JSON.stringify(data)}` : ""}`);
};

interface VerifyResult {
  verified: boolean;
  status: string;
  product_type: string;
  amount_cents: number;
  currency: string;
  metadata: Record<string, string>;
  customer_email?: string;
  payment_intent_id?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY missing");

    const { session_id, product_type } = await req.json();
    if (!session_id) throw new Error("session_id required");
    log("Verifying", { session_id, product_type });

    // Auth (optional but preferred)
    const authHeader = req.headers.get("Authorization");
    let userId: string | null = null;
    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data } = await supabaseAuth.auth.getUser(token);
      userId = data.user?.id ?? null;
    }

    // Service role client to write payment_records
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ["payment_intent", "subscription", "line_items"],
    });

    const isPaid = session.payment_status === "paid" || session.status === "complete";
    const detectedType = product_type || session.metadata?.product_type || session.metadata?.type || "unknown";
    const amount = session.amount_total ?? 0;

    const result: VerifyResult = {
      verified: isPaid,
      status: session.payment_status ?? session.status ?? "unknown",
      product_type: detectedType,
      amount_cents: amount,
      currency: session.currency ?? "eur",
      metadata: (session.metadata as Record<string, string>) ?? {},
      customer_email: session.customer_details?.email ?? undefined,
      payment_intent_id:
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent?.id,
    };

    log("Stripe result", { isPaid, type: detectedType, amount });

    // ---- IDEMPOTENCY GUARD ----
    // Check if this Stripe session was ALREADY verified & credited.
    // payment_records.stripe_session_id has a UNIQUE constraint, and verified_at is set
    // only after successful credit application. If verified_at is already populated,
    // we treat this as a duplicate (page refresh, double-click, retry) and skip
    // applyPurchase / donation processing entirely.
    const { data: existingRecord } = await supabaseAdmin
      .from("payment_records")
      .select("id, verified_at, status")
      .eq("stripe_session_id", session.id)
      .maybeSingle();

    const alreadyCredited = !!existingRecord?.verified_at;
    log("Idempotency check", { existing: !!existingRecord, alreadyCredited });

    // Record the payment (idempotent via unique stripe_session_id).
    // IMPORTANT: do NOT overwrite verified_at if it was already set — preserves audit trail.
    if (userId) {
      const { error: upsertErr } = await supabaseAdmin
        .from("payment_records")
        .upsert(
          {
            user_id: userId,
            product_type: detectedType,
            product_id: session.metadata?.product_id ?? null,
            amount_cents: amount,
            currency: result.currency,
            status: isPaid ? "paid" : (session.payment_status ?? "pending"),
            stripe_session_id: session.id,
            stripe_payment_intent_id: result.payment_intent_id ?? null,
            stripe_customer_id: typeof session.customer === "string" ? session.customer : null,
            metadata: result.metadata,
            verified_at: existingRecord?.verified_at ?? (isPaid ? new Date().toISOString() : null),
          },
          { onConflict: "stripe_session_id" }
        );
      if (upsertErr) log("upsert error", upsertErr);
    }

    // Apply business logic per product type — ONLY if not already credited
    if (isPaid && userId && !alreadyCredited) {
      try {
        await applyPurchase(supabaseAdmin, userId, detectedType, result);
      } catch (e) {
        log("applyPurchase error", e instanceof Error ? e.message : e);
      }
    } else if (alreadyCredited) {
      log("Skipping applyPurchase — session already credited", { session_id: session.id });
    }

    // Donation processing — runs even for guest checkouts (no userId required)
    // Also guarded by alreadyCredited to prevent duplicate donation entries on refresh.
    if (isPaid && !alreadyCredited && (detectedType === "donation" || result.metadata?.type === "campaign_donation")) {
      try {
        const md = result.metadata || {};
        const campaignId = md.campaign_id;
        const campaignType = md.campaign_type;
        const amountEur = (amount || 0) / 100;
        if (campaignId && campaignType && amountEur > 0) {
          const paymentId =
            result.payment_intent_id ||
            (typeof session.subscription === "string" ? session.subscription : session.subscription?.id) ||
            session.id;
          const { data: rpcRes, error: rpcErr } = await supabaseAdmin.rpc(
            "process_campaign_donation",
            {
              _campaign_id: campaignId,
              _campaign_type: campaignType,
              _donor_id: userId,
              _donor_email: md.donor_email || result.customer_email || null,
              _donor_name: md.donor_name || null,
              _amount: amountEur,
              _is_monthly: md.is_monthly === "true",
              _is_anonymous: md.is_anonymous === "true",
              _message: md.donation_message || null,
              _stripe_payment_id: paymentId,
            }
          );
          if (rpcErr) log("donation RPC error", rpcErr);
          else log("donation recorded", rpcRes);
        } else {
          log("donation metadata incomplete", md);
        }
      } catch (e) {
        log("donation handler error", e instanceof Error ? e.message : e);
      }
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    log("ERROR", msg);
    const lower = msg.toLowerCase();
    const smartStatus = (lower.includes("authorization") || lower.includes("authenticated") || lower.includes("bearer") || lower.includes("unauthorized") || lower.includes("jwt")) ? 401 : (lower.includes("required") || lower.includes("missing") || lower.includes("invalid")) ? 400 : 500;
    return new Response(JSON.stringify({ verified: false, error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: smartStatus,
    });
  }
});

// Maps product_type → action (credits, coins, subscription unlock, etc.)
async function applyPurchase(
  db: ReturnType<typeof createClient>,
  userId: string,
  productType: string,
  result: VerifyResult
) {
  const md = result.metadata;
  const credits = parseInt(md.credits ?? "0", 10);
  const coins = parseInt(md.coins ?? "0", 10);

  // Generic credits handler — covers most *_credits product types
  if (productType.endsWith("_credits") && credits > 0) {
    const tableMap: Record<string, string> = {
      ai_credits: "ai_credits",
      analyzer_credits: "analyzer_credits",
      antique_credits: "antique_credits",
      astrology_credits: "astrology_credits",
      handwriting_credits: "handwriting_credits",
      messenger_ai_credits: "messenger_ai_credits",
      photo_credits: "photo_credits",
      character_credits: "character_credits",
      emotion_credits: "emotion_credits",
      video_ad_credits: "ai_credits",
      lie_detector_credits: "ai_credits",
      collectibles_credits: "ai_credits",
    };
    const table = tableMap[productType];
    if (table) {
      // @ts-ignore dynamic table name
      const { data: existing } = await db.from(table).select("*").eq("user_id", userId).maybeSingle();
      if (existing) {
        // @ts-ignore
        await db.from(table)
          .update({
            credits_remaining: (existing.credits_remaining ?? 0) + credits,
            total_credits_purchased: (existing.total_credits_purchased ?? 0) + credits,
          })
          .eq("user_id", userId);
      } else {
        // @ts-ignore
        await db.from(table).insert({
          user_id: userId,
          credits_remaining: credits,
          total_credits_purchased: credits,
        });
      }
    }
    return;
  }

  // Generic coins handler — sport coins
  if (productType.endsWith("_coins") && coins > 0) {
    const sportMap: Record<string, string> = {
      football_coins: "football_coins",
      basketball_coins: "basketball_coins",
      hockey_coins: "hockey_coins",
      tennis_coins: "tennis_coins",
      af_coins: "american_football_coins",
    };
    const table = sportMap[productType];
    if (table) {
      // @ts-ignore
      const { data: existing } = await db.from(table).select("*").eq("user_id", userId).maybeSingle();
      if (existing) {
        // @ts-ignore
        await db.from(table)
          .update({
            balance: (existing.balance ?? 0) + coins,
            total_purchased: (existing.total_purchased ?? 0) + coins,
          })
          .eq("user_id", userId);
      } else {
        // @ts-ignore
        await db.from(table).insert({
          user_id: userId,
          balance: coins,
          total_purchased: coins,
        });
      }
    }
    return;
  }

  // AI Personality Clone subscriptions — record in clone_subscriptions
  if (productType === "clone_subscription" && md.tier) {
    const tierPrices: Record<string, number> = { basic: 9.99, advanced: 29.99, celebrity: 99.0 };
    await db.from("clone_subscriptions").insert({
      user_id: userId,
      tier: md.tier,
      price: tierPrices[md.tier] ?? 0,
      status: "active",
      started_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    });
    return;
  }

  // AI Personality Clone speed-dating session — create a session row
  if (productType === "clone_dating") {
    // Pick the user's most recent active clone as clone_1
    // @ts-ignore
    const { data: mine } = await db.from("personality_clones")
      .select("id").eq("user_id", userId).eq("is_active", true)
      .order("created_at", { ascending: false }).limit(1);
    const clone1 = mine?.[0]?.id;
    if (!clone1) return;
    // Pick a random opponent
    // @ts-ignore
    const { data: opp } = await db.from("personality_clones")
      .select("id").neq("user_id", userId).eq("is_active", true).limit(20);
    const clone2 = opp?.length ? opp[Math.floor(Math.random() * opp.length)].id : null;
    if (!clone2) return;
    await db.from("clone_dating_sessions").insert({
      clone_1_id: clone1,
      clone_2_id: clone2,
      payment_amount: (result.amount_cents || 0) / 100,
      status: "active",
    });
    return;
  }

  // Quantum Social subscriptions — unlock features in quantum_profiles + insert quantum_subscriptions row
  if (productType === "quantum_profiles" || productType === "observer_mode" || productType === "quantum_entanglement") {
    const priceMap: Record<string, number> = {
      quantum_profiles: 12.99,
      observer_mode: 19.99,
      quantum_entanglement: 9.99,
    };
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    // Insert subscription row (idempotency guarded by alreadyCredited above)
    await db.from("quantum_subscriptions").insert({
      user_id: userId,
      subscription_type: productType,
      price: priceMap[productType],
      status: "active",
      started_at: new Date().toISOString(),
      expires_at: expiresAt,
    });

    // Ensure quantum_profile exists, then unlock relevant flag
    // @ts-ignore
    const { data: prof } = await db.from("quantum_profiles").select("id").eq("user_id", userId).maybeSingle();
    if (!prof) {
      await db.from("quantum_profiles").insert({
        user_id: userId,
        is_premium: productType === "quantum_profiles" ? true : false,
        observer_mode_active: productType === "observer_mode",
        reality_versions: productType === "quantum_profiles" ? 3 : 1,
      });
    } else {
      const patch: Record<string, unknown> = {};
      if (productType === "quantum_profiles") { patch.is_premium = true; patch.reality_versions = 3; }
      if (productType === "observer_mode") patch.observer_mode_active = true;
      if (Object.keys(patch).length) await db.from("quantum_profiles").update(patch).eq("user_id", userId);
    }

    // Entanglement: insert pairing row
    if (productType === "quantum_entanglement" && md.target_user_id) {
      await db.from("quantum_entanglements").insert({
        user_id_1: userId,
        user_id_2: md.target_user_id,
        entanglement_strength: 1.0,
        shared_reality: true,
        price_paid: 9.99,
        expires_at: expiresAt,
      });
    }
    return;
  }

  // Auction House — buyout completion.
  if (productType === "auction_buyout") {
    const auctionId = md.auction_id;
    const winnerId = md.winner_id || userId;
    if (auctionId) {
      const { error } = await db.rpc("complete_auction_buyout" as any, {
        p_auction_id: auctionId,
        p_winner_id: winnerId,
        p_stripe_session_id: result.metadata?.session_id ?? "",
      });
      if (error) {
        console.log("[VERIFY-PAYMENT] auction_buyout RPC err", error.message);
        // Race: another buyer already won. Flag this payment for refund.
        if (/already sold to another buyer|refund_required/i.test(error.message)) {
          await db.from("payment_records").update({
            status: "refund_pending",
            refund_reason: "auction_race_lost",
          } as any).eq("stripe_session_id", result.metadata?.session_id ?? "");
        }
      }
    }
    return;
  }

  // Subscriptions & other types — no automatic action; tracked via payment_records.
  // Frontend can read payment_records or call check-subscription.
}
