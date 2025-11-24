import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const session = await stripe.checkout.sessions.retrieve(session_id);
    
    if (session.payment_status !== "paid") {
      return new Response(
        JSON.stringify({ success: false, message: "Payment not completed" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const { user_id, credits, credit_type } = session.metadata || {};
    if (!user_id || !credits || !credit_type) {
      throw new Error("Missing metadata");
    }

    const creditAmount = parseInt(credits);
    const tableName = credit_type;

    // Check if payment already processed
    const { data: existing } = await supabaseClient
      .from("credit_payments")
      .select("id")
      .eq("session_id", session_id)
      .maybeSingle();

    if (existing) {
      return new Response(
        JSON.stringify({ success: true, message: "Payment already processed" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Add credits to user account
    const { data: currentCredits } = await supabaseClient
      .from(tableName)
      .select("credits_remaining, total_credits_purchased")
      .eq("user_id", user_id)
      .maybeSingle();

    if (currentCredits) {
      await supabaseClient
        .from(tableName)
        .update({
          credits_remaining: (currentCredits.credits_remaining || 0) + creditAmount,
          total_credits_purchased: (currentCredits.total_credits_purchased || 0) + creditAmount,
        })
        .eq("user_id", user_id);
    } else {
      await supabaseClient
        .from(tableName)
        .insert({
          user_id,
          credits_remaining: creditAmount,
          total_credits_purchased: creditAmount,
        });
    }

    // Log payment
    await supabaseClient.from("credit_payments").insert({
      session_id,
      user_id,
      credits: creditAmount,
      credit_type,
      amount: session.amount_total,
      currency: session.currency,
    });

    return new Response(
      JSON.stringify({ success: true, credits_added: creditAmount }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Verification error:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
