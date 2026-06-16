// Stripe Connect — returns the current account state (charges_enabled, payouts_enabled, requirements)
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY missing");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: u, error } = await supabaseClient.auth.getUser(token);
    if (error || !u.user) throw new Error("Auth failed");

    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("stripe_connect_account_id")
      .eq("id", u.user.id)
      .maybeSingle();

    if (!profile?.stripe_connect_account_id) {
      return new Response(JSON.stringify({
        has_account: false,
        charges_enabled: false,
        payouts_enabled: false,
        onboarding_complete: false,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const account = await stripe.accounts.retrieve(profile.stripe_connect_account_id);
    const onboardingComplete = !!account.details_submitted;

    // Sync to profile
    await supabaseClient
      .from("profiles")
      .update({
        stripe_connect_charges_enabled: !!account.charges_enabled,
        stripe_connect_payouts_enabled: !!account.payouts_enabled,
        stripe_connect_onboarding_complete: onboardingComplete,
      })
      .eq("id", u.user.id);

    return new Response(JSON.stringify({
      has_account: true,
      account_id: account.id,
      charges_enabled: !!account.charges_enabled,
      payouts_enabled: !!account.payouts_enabled,
      onboarding_complete: onboardingComplete,
      requirements: account.requirements,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[stripe-connect-status]", msg);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
