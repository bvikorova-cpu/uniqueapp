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

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError || !user) {
      throw new Error("User not authenticated");
    }

    console.log("Checking Connect status for user:", user.id);

    // Get instructor profile
    const { data: profile } = await supabaseClient
      .from("instructor_profiles")
      .select("stripe_account_id, stripe_onboarding_complete")
      .eq("user_id", user.id)
      .single();

    if (!profile?.stripe_account_id) {
      return new Response(
        JSON.stringify({ 
          hasAccount: false, 
          onboardingComplete: false,
          payoutsEnabled: false,
          chargesEnabled: false 
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Get account details from Stripe
    const account = await stripe.accounts.retrieve(profile.stripe_account_id);
    
    const isComplete = account.details_submitted && account.payouts_enabled;
    
    // Update database if onboarding status changed
    if (isComplete && !profile.stripe_onboarding_complete) {
      await supabaseClient
        .from("instructor_profiles")
        .update({ stripe_onboarding_complete: true })
        .eq("user_id", user.id);
    }

    console.log("Account status:", {
      accountId: profile.stripe_account_id,
      detailsSubmitted: account.details_submitted,
      payoutsEnabled: account.payouts_enabled,
      chargesEnabled: account.charges_enabled,
    });

    return new Response(
      JSON.stringify({ 
        hasAccount: true,
        accountId: profile.stripe_account_id,
        onboardingComplete: isComplete,
        detailsSubmitted: account.details_submitted,
        payoutsEnabled: account.payouts_enabled,
        chargesEnabled: account.charges_enabled,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
