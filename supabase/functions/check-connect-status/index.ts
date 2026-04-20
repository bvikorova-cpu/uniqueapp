/**
 * UNIVERSAL CONNECT & PORTAL ROUTER
 * 
 * Original purpose: check Stripe Connect status (default action when no body)
 * 
 * Now also routes:
 *   { action: "status" }                     → Connect account status (default)
 *   { action: "connect_login" }              → Stripe Connect login link
 *   { action: "customer_portal" }            → Stripe Billing Portal (universal for ALL hubs)
 *   { action: "customer_portal", return_url } → with custom return URL
 * 
 * Replaces 10 deleted functions:
 *   create-connect-login-link
 *   best-friend-customer-portal, companions-customer-portal,
 *   employer-customer-portal, f1-customer-portal, healthcare-customer-portal,
 *   kids-customer-portal, kids-story-customer-portal,
 *   psychology-customer-portal, customer-portal-creator
 */
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY missing");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { data: u, error: uErr } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    if (uErr || !u.user) throw new Error("Authentication failed");
    const user = u.user;

    // Parse body safely (GET requests have no body)
    let body: any = {};
    if (req.method !== "GET") {
      try { body = await req.json(); } catch { body = {}; }
    }
    const action = body.action || "status";
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-09-30.clover" });
    const origin = req.headers.get("origin") || "https://uniqueapp.fun";

    // ─── ACTION: connect_login (Stripe Connect dashboard link) ───
    if (action === "connect_login") {
      const { data: profile } = await supabase
        .from("profiles")
        .select("stripe_connect_account_id")
        .eq("id", user.id)
        .maybeSingle();

      if (!profile?.stripe_connect_account_id) {
        return json({ error: "No Stripe Connect account. Please complete onboarding first." }, 404);
      }
      const link = await stripe.accounts.createLoginLink(profile.stripe_connect_account_id);
      return json({ url: link.url });
    }

    // ─── ACTION: customer_portal (Stripe Billing Portal — works for any hub) ───
    if (action === "customer_portal") {
      const customers = await stripe.customers.list({ email: user.email!, limit: 1 });
      if (customers.data.length === 0) {
        return json({ error: "No active subscription found for this account." }, 404);
      }
      const session = await stripe.billingPortal.sessions.create({
        customer: customers.data[0].id,
        return_url: body.return_url || `${origin}/account`,
      });
      return json({ url: session.url });
    }

    // ─── DEFAULT ACTION: status (original behaviour — UNCHANGED) ───
    const { data: profile } = await supabase
      .from("profiles")
      .select(
        "stripe_connect_account_id, stripe_connect_charges_enabled, stripe_connect_payouts_enabled, stripe_connect_onboarding_complete"
      )
      .eq("id", user.id)
      .maybeSingle();

    if (!profile?.stripe_connect_account_id) {
      return json({ connected: false });
    }

    return json({
      connected: true,
      account_id: profile.stripe_connect_account_id,
      charges_enabled: profile.stripe_connect_charges_enabled ?? false,
      payouts_enabled: profile.stripe_connect_payouts_enabled ?? false,
      onboarding_complete: profile.stripe_connect_onboarding_complete ?? false,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[check-connect-status]", msg);
    return json({ error: msg, connected: false }, 500);
  }
});
