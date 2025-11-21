import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  console.log(`[VERIFY-CAMPAIGN-PAYMENT] ${step}`, details || "");
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !user) throw new Error("User not authenticated");

    logStep("User authenticated", { userId: user.id });

    const { sessionId } = await req.json();
    
    if (!sessionId) {
      throw new Error("Missing sessionId");
    }

    logStep("Verifying session", { sessionId });

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    logStep("Stripe session retrieved", { 
      status: session.payment_status,
      paymentIntent: session.payment_intent 
    });

    if (session.payment_status !== "paid") {
      return new Response(
        JSON.stringify({ 
          success: false, 
          status: session.payment_status,
          message: "Payment not completed" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get payment record
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { data: payment, error: paymentError } = await supabaseAdmin
      .from("campaign_payments")
      .select("*, campaign_applications(influencer_id, brand_campaigns(campaign_name)), virtual_influencers(name, user_id)")
      .eq("stripe_session_id", sessionId)
      .single();

    if (paymentError || !payment) {
      throw new Error("Payment record not found");
    }

    // Update payment status to completed
    const { error: updateError } = await supabaseAdmin
      .from("campaign_payments")
      .update({
        status: "completed",
        stripe_payment_intent_id: session.payment_intent as string,
        paid_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", payment.id);

    if (updateError) {
      throw new Error(`Failed to update payment: ${updateError.message}`);
    }

    logStep("Payment marked as completed", { paymentId: payment.id });

    // Send notifications
    await supabaseAdmin.from("notifications").insert([
      {
        user_id: payment.influencer_user_id,
        type: "payment_received",
        title: "Payment Received",
        message: `You've received €${payment.influencer_amount.toFixed(2)} for the campaign "${payment.campaign_applications.brand_campaigns.campaign_name}". Check your earnings dashboard!`,
      },
      {
        user_id: payment.brand_user_id,
        type: "payment_confirmed",
        title: "Payment Confirmed",
        message: `Your payment of €${payment.amount.toFixed(2)} for campaign "${payment.campaign_applications.brand_campaigns.campaign_name}" has been processed successfully.`,
      }
    ]);

    logStep("Notifications sent");

    return new Response(
      JSON.stringify({ 
        success: true,
        payment: {
          id: payment.id,
          amount: payment.amount,
          influencerAmount: payment.influencer_amount,
          status: "completed"
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});