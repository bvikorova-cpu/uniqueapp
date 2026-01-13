import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-CONNECT-ONBOARDING] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
    });

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Get authenticated user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error("User not authenticated");
    }

    logStep("User authenticated", { userId: user.id, email: user.email });

    const { returnUrl, refreshUrl } = await req.json();

    if (!returnUrl || !refreshUrl) {
      throw new Error("returnUrl and refreshUrl are required");
    }

    // Use service role for database operations
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Check if user already has a Connect account
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('stripe_connect_account_id, full_name, email')
      .eq('id', user.id)
      .single();

    if (profileError) {
      logStep("ERROR fetching profile", { error: profileError });
      throw new Error("Failed to fetch user profile");
    }

    let stripeConnectAccountId = profile?.stripe_connect_account_id;

    // If no Connect account exists, create one
    if (!stripeConnectAccountId) {
      logStep("Creating new Stripe Connect Express account");

      const account = await stripe.accounts.create({
        type: 'express',
        email: user.email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        metadata: {
          supabase_user_id: user.id,
        },
      });

      stripeConnectAccountId = account.id;
      logStep("Created Connect account", { accountId: stripeConnectAccountId });

      // Save the Connect account ID to the profile
      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({
          stripe_connect_account_id: stripeConnectAccountId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (updateError) {
        logStep("ERROR updating profile with Connect account", { error: updateError });
        throw new Error("Failed to save Connect account to profile");
      }
    } else {
      logStep("Using existing Connect account", { accountId: stripeConnectAccountId });
    }

    // Check account status
    const account = await stripe.accounts.retrieve(stripeConnectAccountId);
    logStep("Account status", {
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      detailsSubmitted: account.details_submitted,
    });

    // If account is fully onboarded, return success status
    if (account.details_submitted && account.charges_enabled && account.payouts_enabled) {
      // Update profile with status
      await supabaseAdmin
        .from('profiles')
        .update({
          stripe_connect_onboarding_complete: true,
          stripe_connect_charges_enabled: account.charges_enabled,
          stripe_connect_payouts_enabled: account.payouts_enabled,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      return new Response(
        JSON.stringify({
          success: true,
          accountId: stripeConnectAccountId,
          onboardingComplete: true,
          chargesEnabled: account.charges_enabled,
          payoutsEnabled: account.payouts_enabled,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Create an account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: stripeConnectAccountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: 'account_onboarding',
    });

    logStep("Created account link", { url: accountLink.url });

    return new Response(
      JSON.stringify({
        success: true,
        accountId: stripeConnectAccountId,
        onboardingUrl: accountLink.url,
        onboardingComplete: false,
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
      }),
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
