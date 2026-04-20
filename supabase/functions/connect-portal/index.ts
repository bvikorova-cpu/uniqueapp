/**
 * UNIVERSAL CONNECT & CUSTOMER PORTAL ROUTER
 * 
 * Replaces 10 separate edge functions:
 * - create-connect-login-link
 * - best-friend-customer-portal
 * - companions-customer-portal
 * - employer-customer-portal
 * - f1-customer-portal
 * - healthcare-customer-portal
 * - kids-customer-portal
 * - kids-story-customer-portal
 * - psychology-customer-portal
 * - customer-portal-creator
 * 
 * Usage from frontend:
 *   supabase.functions.invoke("connect-portal", { body: { action: "connect_login" } })
 *   supabase.functions.invoke("connect-portal", { body: { action: "customer_portal", hub: "best-friend" } })
 */
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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

    const { data: userData, error: userErr } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    if (userErr || !userData.user) throw new Error("Authentication failed");
    const user = userData.user;

    const body = await req.json().catch(() => ({}));
    const action = body.action || "customer_portal";
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-09-30.clover" });

    const origin = req.headers.get("origin") || "https://uniqueapp.fun";
    const returnUrl = body.return_url || `${origin}/account`;

    // ───────────────────────────────────────────
    // ACTION 1: Stripe Connect login link
    // (replaces create-connect-login-link)
    // ───────────────────────────────────────────
    if (action === "connect_login") {
      const { data: profile } = await supabase
        .from("profiles")
        .select("stripe_connect_account_id")
        .eq("id", user.id)
        .maybeSingle();

      if (!profile?.stripe_connect_account_id) {
        return jsonResponse({ error: "No Stripe Connect account found" }, 404);
      }

      const link = await stripe.accounts.createLoginLink(profile.stripe_connect_account_id);
      return jsonResponse({ url: link.url });
    }

    // ───────────────────────────────────────────
    // ACTION 2: Customer portal (universal for all hubs)
    // ───────────────────────────────────────────
    if (action === "customer_portal") {
      // Find customer by email (Stripe-side lookup)
      const customers = await stripe.customers.list({ email: user.email!, limit: 1 });
      if (customers.data.length === 0) {
        return jsonResponse({ error: "No Stripe customer found for this account" }, 404);
      }

      const session = await stripe.billingPortal.sessions.create({
        customer: customers.data[0].id,
        return_url: returnUrl,
      });

      return jsonResponse({ url: session.url });
    }

    return jsonResponse({ error: `Unknown action: ${action}` }, 400);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[connect-portal]", msg);
    return jsonResponse({ error: msg }, 500);
  }
});

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  });
}
