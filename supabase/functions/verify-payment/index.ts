// Univerzálna verify-payment funkcia
// Nahrádza 25+ verify-*-payment funkcií
// Použitie: supabase.functions.invoke('verify-payment', { body: { session_id, product_type } })

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

    // Record the payment (idempotent via unique stripe_session_id)
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
            verified_at: isPaid ? new Date().toISOString() : null,
          },
          { onConflict: "stripe_session_id" }
        );
      if (upsertErr) log("upsert error", upsertErr);
    }

    // Apply business logic per product type
    if (isPaid && userId) {
      try {
        await applyPurchase(supabaseAdmin, userId, detectedType, result);
      } catch (e) {
        log("applyPurchase error", e instanceof Error ? e.message : e);
      }
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    log("ERROR", msg);
    return new Response(JSON.stringify({ verified: false, error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
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
      photo_credits: "ai_credits",
      character_credits: "ai_credits",
      emotion_credits: "ai_credits",
      video_ad_credits: "ai_credits",
      lie_detector_credits: "ai_credits",
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

  // Subscriptions & other types — no automatic action; tracked via payment_records.
  // Frontend can read payment_records or call check-subscription.
}
