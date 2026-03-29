import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: any) => {
  console.log(`[CAMPAIGN-PAYMENT-CHECKOUT] ${step}`, details || "");
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !user?.email) throw new Error("User not authenticated");

    logStep("User authenticated", { userId: user.id, email: user.email });

    const { applicationId, amount } = await req.json();
    
    if (!applicationId || !amount) {
      throw new Error("Missing required fields: applicationId, amount");
    }

    if (amount <= 0) {
      throw new Error("Amount must be greater than 0");
    }

    logStep("Payment request", { applicationId, amount });

    // Get application and campaign details
    const { data: application, error: appError } = await supabaseClient
      .from("campaign_applications")
      .select(`
        *,
        brand_campaigns (
          id,
          user_id,
          brand_name,
          campaign_name,
          budget_min,
          budget_max
        )
      `)
      .eq("id", applicationId)
      .eq("status", "approved")
      .single();

    if (appError || !application) {
      throw new Error("Application not found or not approved");
    }

    // Verify user is the campaign owner
    if (application.brand_campaigns.user_id !== user.id) {
      throw new Error("Only campaign owner can make payment");
    }

    // Get influencer info (application.user_id is the influencer's user_id)
    const { data: influencer } = await supabaseClient
      .from("virtual_influencers")
      .select("id, name, user_id")
      .eq("user_id", application.user_id)
      .single();

    const influencerName = influencer?.name || "the influencer";

    // Verify amount is within budget
    if (amount < application.brand_campaigns.budget_min || amount > application.brand_campaigns.budget_max) {
      throw new Error(`Amount must be between ${application.brand_campaigns.budget_min} and ${application.brand_campaigns.budget_max}`);
    }

    // Calculate platform fee (20%)
    const platformFee = Math.round(amount * 0.20 * 100) / 100;
    const influencerAmount = Math.round(amount * 0.80 * 100) / 100;

    logStep("Calculated fees", { amount, platformFee, influencerAmount });

    // Create payment record
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { data: payment, error: paymentError } = await supabaseAdmin
      .from("campaign_payments")
      .insert({
        campaign_id: application.brand_campaigns.id,
        application_id: applicationId,
        brand_user_id: user.id,
        influencer_user_id: application.user_id, // This is the influencer's user_id
        amount,
        platform_fee: platformFee,
        influencer_amount: influencerAmount,
        status: "pending",
      })
      .select()
      .single();

    if (paymentError || !payment) {
      throw new Error(`Failed to create payment record: ${paymentError?.message}`);
    }

    logStep("Payment record created", { paymentId: payment.id });

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Check for existing Stripe customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing Stripe customer", { customerId });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: `Campaign: ${application.brand_campaigns.campaign_name}`,
              description: `Payment to ${influencerName} for brand collaboration`,
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/brand-collaboration?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/brand-collaboration?payment=canceled`,
      metadata: {
        type: "campaign_payment",
        payment_id: payment.id,
        application_id: applicationId,
        campaign_id: application.brand_campaigns.id,
      },
    });

    logStep("Stripe session created", { sessionId: session.id });

    // Update payment with Stripe session ID
    await supabaseAdmin
      .from("campaign_payments")
      .update({ stripe_session_id: session.id })
      .eq("id", payment.id);

    return new Response(
      JSON.stringify({ url: session.url, paymentId: payment.id }),
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