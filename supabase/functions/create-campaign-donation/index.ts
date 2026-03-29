import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-DONATION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Get authenticated user (optional for donations)
    let user = null;
    let userEmail = null;
    let userName = null;
    
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data } = await supabaseClient.auth.getUser(token);
      user = data.user;
      userEmail = user?.email;
      logStep("User authenticated", { userId: user?.id, email: userEmail });
    } else {
      logStep("No authentication - guest donation");
    }

    // Parse request body
    const { 
      campaignId, 
      campaignType, 
      amount, 
      isMonthly = false,
      isAnonymous = false,
      message,
      donorEmail,
      donorName
    } = await req.json();

    logStep("Donation request", { 
      campaignId, 
      campaignType, 
      amount, 
      isMonthly, 
      isAnonymous 
    });

    if (!campaignId || !campaignType || !amount) {
      throw new Error("Missing required parameters");
    }

    if (amount < 1) {
      throw new Error("Minimum donation amount is 1€");
    }

    // Use provided email or authenticated user email
    const finalEmail = donorEmail || userEmail;
    const finalName = donorName || userName;

    if (!finalEmail) {
      throw new Error("Email is required for donation");
    }

    // Calculate platform fee based on campaign type
    const platformFeeRates: Record<string, number> = {
      medical: 0.06,    // 6%
      dream: 0.07,      // 7%
      hero: 0.05,       // 5%
      pet: 0.06,        // 6%
      student: 0.05,    // 5%
      crisis: 0.08,     // 8%
      talent: 0.10,     // 10%
    };

    const feeRate = platformFeeRates[campaignType] || 0.07;
    const platformFee = amount * feeRate;
    const netAmount = amount - platformFee;

    logStep("Fee calculation", { amount, feeRate, platformFee, netAmount });

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Check for existing customer
    const customers = await stripe.customers.list({ 
      email: finalEmail, 
      limit: 1 
    });
    
    let customerId: string | undefined;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing customer", { customerId });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : finalEmail,
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `Dar pre kampaň`,
              description: `${isMonthly ? 'Mesačný' : 'Jednorazový'} príspevok`,
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
            recurring: isMonthly ? { interval: 'month' } : undefined,
          },
          quantity: 1,
        },
      ],
      mode: isMonthly ? 'subscription' : 'payment',
      success_url: `${req.headers.get("origin")}/fundraising/${campaignType}/${campaignId}?donation=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/fundraising/${campaignType}/${campaignId}?donation=cancelled`,
      metadata: {
        type: "campaign_donation",
        campaign_id: campaignId,
        campaign_type: campaignType,
        donor_id: user?.id || 'guest',
        is_monthly: isMonthly.toString(),
        is_anonymous: isAnonymous.toString(),
        platform_fee: platformFee.toFixed(2),
        net_amount: netAmount.toFixed(2),
        donor_name: finalName || '',
        message: message || '',
      },
    });

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    return new Response(
      JSON.stringify({ url: session.url, sessionId: session.id }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
