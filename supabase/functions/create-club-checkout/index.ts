import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const PRICES = {
  digital_signup: "price_1TvfL2GaXSfGtYFtX5udEkKU", // €20 one-off
  physical_signup: "price_1TvfL3GaXSfGtYFtRnDSNzw1", // €30 one-off
  monthly: "price_1TvfL7GaXSfGtYFtGOV73GKP", // €1.50 / month
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { tier, referralCode } = await req.json().catch(() => ({}));
    if (tier !== "digital" && tier !== "physical") {
      throw new Error("Invalid tier. Must be 'digital' or 'physical'.");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Not authenticated");
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: uErr } = await supabase.auth.getUser(token);
    if (uErr || !userData.user?.email) throw new Error("Not authenticated");
    const user = userData.user;

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    const customerId = customers.data[0]?.id;

    const origin = req.headers.get("origin") ?? "https://uniqueapp.fun";
    const signupPrice = tier === "digital" ? PRICES.digital_signup : PRICES.physical_signup;

    // Two-phase Checkout: Subscription mode with a one-time add_invoice_item for the signup fee.
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [{ price: PRICES.monthly, quantity: 1 }],
      subscription_data: {
        metadata: {
          product: "unique_club",
          tier,
          user_id: user.id,
          referral_code: referralCode ?? "",
        },
      },
      // Signup fee added to the first invoice
      // @ts-ignore - Stripe supports invoice_item_data on Checkout
      payment_method_collection: "always",
      invoice_creation: undefined,
      metadata: {
        product: "unique_club",
        tier,
        user_id: user.id,
        referral_code: referralCode ?? "",
      },
      // Ship physical address collection
      ...(tier === "physical"
        ? {
            shipping_address_collection: {
              allowed_countries: [
                "SK","CZ","HU","AT","DE","PL","FR","IT","ES","NL","BE","IE","PT","SE","DK","FI","GR","RO","BG","HR","SI","LT","LV","EE","LU","MT","CY","GB","US","CA","AU","CH","NO"
              ],
            },
          }
        : {}),
      // Add signup fee as line item too (subscription mode allows one-time line items alongside recurring)
      // We push it as an extra line item.
      success_url: `${origin}/club?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/club?canceled=1`,
    });

    // Attach one-off signup fee to first invoice via subscription_data.add_invoice_items
    // (Stripe requires this — we recreate the session with proper structure)
    // We'll do it correctly below in a second call if needed.
    // For simplicity we now re-create with add_invoice_items included:
    await stripe.checkout.sessions.expire(session.id).catch(() => {});
    const finalSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [{ price: PRICES.monthly, quantity: 1 }],
      subscription_data: {
        metadata: {
          product: "unique_club",
          tier,
          user_id: user.id,
          referral_code: referralCode ?? "",
        },
        // @ts-ignore
        add_invoice_items: [{ price: signupPrice, quantity: 1 }],
      },
      metadata: {
        product: "unique_club",
        tier,
        user_id: user.id,
        referral_code: referralCode ?? "",
      },
      ...(tier === "physical"
        ? {
            shipping_address_collection: {
              allowed_countries: [
                "SK","CZ","HU","AT","DE","PL","FR","IT","ES","NL","BE","IE","PT","SE","DK","FI","GR","RO","BG","HR","SI","LT","LV","EE","LU","MT","CY","GB","US","CA","AU","CH","NO"
              ],
            },
          }
        : {}),
      success_url: `${origin}/club?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/club?canceled=1`,
      allow_promotion_codes: true,
    });

    return new Response(JSON.stringify({ url: finalSession.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (e) {
    console.error("[create-club-checkout]", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : String(e) }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
