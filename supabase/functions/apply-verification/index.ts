import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const log = (step: string, details?: any) => {
  const d = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[APPLY-VERIFICATION] ${step}${d}`);
};

const errorResponse = (error: unknown, status = 500) => {
  const message = error instanceof Error ? error.message : String(error);
  log("ERROR", { message, status });
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
};

const successResponse = (data: any) =>
  new Response(JSON.stringify(data), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const sessionId = String(body.session_id || "");
    if (!sessionId) throw new Error("session_id is required");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Authorization header required");
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData?.user?.id) throw new Error("Authentication failed");
    const userId = userData.user.id;
    const email = userData.user.email;
    if (!email) throw new Error("User email missing");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items"],
    });
    if (!session) throw new Error("Checkout session not found");
    if (session.payment_status !== "paid" && session.status !== "complete") {
      throw new Error("Payment not completed");
    }

    const metadata = session.metadata || {};
    const metadataUserId = metadata.user_id;
    if (metadataUserId && metadataUserId !== userId) {
      throw new Error("Session does not belong to current user");
    }

    const priceId = (session.line_items?.data?.[0]?.price as any)?.id || metadata.price_id;
    const TIER_BY_PRICE: Record<string, string> = {
      "price_1TvDqrGaXSfGtYFt2g1n3Nuv": "verified",
      "price_1TvDqsGaXSfGtYFtSyfF7vjE": "plus",
      "price_1TvDqsGaXSfGtYFt6boV1wed": "pro",
    };
    const tier = TIER_BY_PRICE[priceId] || metadata.tier;
    if (!tier || !["verified", "plus", "pro"].includes(tier)) {
      throw new Error("Unrecognized verification price");
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    // Idempotency: check existing audit log for this session
    const { data: existingLog } = await admin
      .from("verification_benefits_log")
      .select("id")
      .eq("user_id", userId)
      .eq("benefit_type", "verification_purchase")
      .eq("metadata->>session_id", sessionId)
      .maybeSingle();
    if (existingLog) {
      log("Duplicate apply request", { userId, sessionId, tier });
      return successResponse({ applied: true, tier, duplicate: true });
    }

    const monthsToAdd = tier === "verified" ? 12 : 1; // Verified is one-time, treat as 12 months
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + monthsToAdd);
    if (tier === "verified") {
      // One-time badge: lifetime-ish, but set a long horizon for internal hygiene
      expiresAt.setFullYear(expiresAt.getFullYear() + 100);
    }

    const creditGrants: Record<string, number> = {
      verified: 50,
      plus: 200,
      pro: 10000,
    };
    const creditsToGrant = creditGrants[tier] || 0;

    // Update profile (only service_role can change verification_tier due to trigger)
    const { error: updateError } = await admin
      .from("profiles")
      .update({
        verification_tier: tier,
        verification_expires_at: expiresAt.toISOString(),
      })
      .eq("id", userId);
    if (updateError) throw new Error(`Profile update failed: ${updateError.message}`);

    // Grant AI credits if applicable
    if (creditsToGrant > 0) {
      const { data: creditRow } = await admin
        .from("ai_credits")
        .select("balance")
        .eq("user_id", userId)
        .maybeSingle();
      const newBalance = (creditRow?.balance ?? 0) + creditsToGrant;
      await admin.from("ai_credits").upsert(
        { user_id: userId, balance: newBalance, updated_at: new Date().toISOString() },
        { onConflict: "user_id" },
      );
      await admin.from("ai_credits_ledger").insert({
        user_id: userId,
        amount: creditsToGrant,
        balance_after: newBalance,
        transaction_type: "verification_grant",
        description: `Unique ${tier} verification bonus`,
      });
    }

    // Audit log
    await admin.from("verification_benefits_log").insert({
      user_id: userId,
      benefit_type: "verification_purchase",
      tier,
      credits_granted: creditsToGrant,
      metadata: {
        session_id: sessionId,
        price_id: priceId,
        payment_status: session.payment_status,
      },
    });

    log("Applied verification", { userId, tier, credits: creditsToGrant });
    return successResponse({ applied: true, tier, credits_granted: creditsToGrant });
  } catch (error) {
    return errorResponse(error);
  }
});
