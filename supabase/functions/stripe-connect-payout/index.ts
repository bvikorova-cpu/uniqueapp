// Stripe Connect — manuálny payout pre kreatora
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY missing");

    const { amount_cents, currency = "eur" } = await req.json();
    if (!amount_cents || amount_cents <= 0) throw new Error("amount_cents required");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );
    const { data: u } = await supabaseClient.auth.getUser(authHeader.replace("Bearer ", ""));
    if (!u.user) throw new Error("Auth failed");

    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("stripe_connect_account_id, stripe_connect_payouts_enabled")
      .eq("id", u.user.id)
      .maybeSingle();

    if (!profile?.stripe_connect_account_id) throw new Error("No Connect account");
    if (!profile.stripe_connect_payouts_enabled) throw new Error("Payouts not enabled. Complete onboarding first.");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const payout = await stripe.payouts.create(
      { amount: amount_cents, currency },
      { stripeAccount: profile.stripe_connect_account_id }
    );

    return new Response(JSON.stringify({
      payout_id: payout.id,
      amount: payout.amount,
      currency: payout.currency,
      arrival_date: payout.arrival_date,
      status: payout.status,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[stripe-connect-payout]", msg);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
