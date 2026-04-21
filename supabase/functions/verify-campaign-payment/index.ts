import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
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
      .select(`
        *,
        brand_campaigns (
          campaign_name
        )
      `)
      .eq("stripe_session_id", sessionId)
      .single();

    if (paymentError || !payment) {
      throw new Error("Payment record not found");
    }

    logStep("Payment found", { paymentId: payment.id, influencerUserId: payment.influencer_user_id });

    // Find virtual influencer by user_id
    const { data: influencer, error: influencerError } = await supabaseAdmin
      .from("virtual_influencers")
      .select("id, name, user_id")
      .eq("user_id", payment.influencer_user_id)
      .single();

    if (influencerError || !influencer) {
      logStep("WARNING: No virtual influencer found for user", { userId: payment.influencer_user_id });
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

    // Update or create influencer balance if virtual influencer exists
    if (influencer) {
      const { data: existingBalance } = await supabaseAdmin
        .from("influencer_balances")
        .select("*")
        .eq("influencer_id", influencer.id)
        .single();

      if (existingBalance) {
        // Update existing balance
        const { error: balanceError } = await supabaseAdmin
          .from("influencer_balances")
          .update({
            total_earned: existingBalance.total_earned + payment.influencer_amount,
            available_balance: existingBalance.available_balance + payment.influencer_amount,
            updated_at: new Date().toISOString(),
          })
          .eq("influencer_id", influencer.id);

        if (balanceError) {
          logStep("ERROR updating balance", balanceError);
        } else {
          logStep("Balance updated", { 
            influencerId: influencer.id, 
            newBalance: existingBalance.available_balance + payment.influencer_amount 
          });
        }
      } else {
        // Create new balance
        const { error: createError } = await supabaseAdmin
          .from("influencer_balances")
          .insert({
            influencer_id: influencer.id,
            total_earned: payment.influencer_amount,
            available_balance: payment.influencer_amount,
            withdrawn: 0,
            pending_withdrawal: 0,
          });

        if (createError) {
          logStep("ERROR creating balance", createError);
        } else {
          logStep("Balance created", { influencerId: influencer.id });
        }
      }
    }

    // Record earnings history (for dashboards/analytics)
    if (influencer) {
      const { error: earningsError } = await supabaseAdmin
        .from("influencer_earnings")
        .insert({
          influencer_id: influencer.id,
          user_id: payment.influencer_user_id,
          amount: payment.amount,
          platform_fee: payment.platform_fee,
          net_amount: payment.influencer_amount,
          source: "brand_collaboration",
        });
      if (earningsError) {
        logStep("ERROR recording earnings", earningsError);
      } else {
        logStep("Earnings recorded");
      }
    }

    // Send notifications
    await supabaseAdmin.from("notifications").insert([
      {
        user_id: payment.influencer_user_id,
        type: "payment_received",
        title: "Payment Received",
        message: `You've received €${payment.influencer_amount.toFixed(2)} for the campaign "${payment.brand_campaigns?.campaign_name || 'a brand campaign'}". Check your earnings dashboard!`,
      },
      {
        user_id: payment.brand_user_id,
        type: "payment_confirmed",
        title: "Payment Confirmed",
        message: `Your payment of €${payment.amount.toFixed(2)} for campaign "${payment.brand_campaigns?.campaign_name || 'your campaign'}" has been processed successfully.`,
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