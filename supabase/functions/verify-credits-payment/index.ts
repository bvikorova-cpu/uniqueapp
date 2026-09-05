import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = { "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version" };

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    const { session_id } = await req.json();
    if (!session_id) throw new Error("Session ID required");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { apiVersion: "2025-08-27.basil" });

    const session = await stripe.checkout.sessions.retrieve(session_id);
    
    if (session.payment_status !== "paid") {
      return new Response(
        JSON.stringify({ success: false, message: "Payment not completed" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const md = (session.metadata || {}) as Record<string, string>;
    // Fallbacks: universal one-off checkout writes `userId` + `product`
    const user_id = md.user_id || md.userId || (session.client_reference_id ?? "");
    const credits = md.credits;
    const credit_type = md.credit_type || md.product || md.type;
    if (!user_id || !credits || !credit_type) {
      throw new Error("Missing metadata");
    }

    const creditAmount = parseInt(credits);
    if (!Number.isFinite(creditAmount) || creditAmount <= 0) {
      throw new Error("Invalid credit amount");
    }

    // Every purchased credit lands in the single unified wallet — no legacy per-module tables.
    const tableName = "ai_credits";

    // Check if payment already processed
    const { data: existing } = await supabaseClient
      .from("credit_payments")
      .select("id")
      .eq("session_id", session_id)
      .maybeSingle();

    if (existing) {
      return new Response(
        JSON.stringify({ success: true, message: "Payment already processed", credits_added: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Add credits to user account. Teen Career is now part of the unified AI credit pool.
    if (tableName === "ai_credits") {
      const { error: rpcError } = await supabaseClient.rpc("add_ai_credits", {
        p_user_id: user_id,
        p_amount: creditAmount,
        p_reason: `${credit_type}:stripe_purchase`,
        p_source: "verify-credits-payment" });
      if (rpcError) throw rpcError;
    } else {
      const { data: currentCredits, error: selectError } = await supabaseClient
        .from(tableName)
        .select("credits_remaining, total_credits_purchased")
        .eq("user_id", user_id)
        .maybeSingle();
      if (selectError) throw selectError;

      if (currentCredits) { const { error: updateError } = await supabaseClient
          .from(tableName)
          .update({
            credits_remaining: (currentCredits.credits_remaining || 0) + creditAmount,
            total_credits_purchased: (currentCredits.total_credits_purchased || 0) + creditAmount })
          .eq("user_id", user_id);
        if (updateError) throw updateError;
      } else { const { error: insertError } = await supabaseClient
          .from(tableName)
          .insert({
            user_id,
            credits_remaining: creditAmount,
            total_credits_purchased: creditAmount });
        if (insertError) throw insertError;
      }
    }

    // Log payment
    const { error: paymentLogError } = await supabaseClient.from("credit_payments").insert({ session_id,
      user_id,
      credits: creditAmount,
      credit_type,
      amount: session.amount_total,
      currency: session.currency });
    if (paymentLogError) throw paymentLogError;

    return new Response(
      JSON.stringify({ success: true, credits_added: creditAmount }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Verification error:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500 });
  }
});
