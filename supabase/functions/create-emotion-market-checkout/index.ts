import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Server-side price floors per emotion type (EUR per unit). Client-supplied
// pricePerUnit must be >= floor and within sane bounds. Listing-based purchases
// fetch authoritative price from DB.
const FLOORS: Record<string, number> = {
  joy: 0.5, love: 0.75, motivation: 0.35, excitement: 0.6, peace: 0.4,
  sadness: 0.2, anger: 0.2, fear: 0.2,
};
const MAX_PRICE_PER_UNIT = 50;
const MAX_AMOUNT = 1000;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY missing");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Authorization required");
    const supa = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );
    const { data: { user } } = await supa.auth.getUser(authHeader.replace("Bearer ", ""));
    if (!user?.email) throw new Error("Not authenticated");

    const body = await req.json();
    let { emotionType, amount, pricePerUnit, listingId } = body || {};
    if (typeof emotionType !== "string") throw new Error("emotionType required");
    emotionType = String(emotionType).toLowerCase();

    // If listingId is provided, use authoritative DB values
    if (listingId) {
      const admin = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
        { auth: { persistSession: false } }
      );
      const { data: listing, error } = await admin
        .from("emotion_market_listings")
        .select("*")
        .eq("id", listingId)
        .eq("status", "active")
        .maybeSingle();
      if (error || !listing) throw new Error("Listing not found or inactive");
      emotionType = listing.emotion_type;
      amount = listing.amount;
      pricePerUnit = Number(listing.price_per_unit);
    }

    amount = Math.floor(Number(amount));
    pricePerUnit = Number(pricePerUnit);
    if (!Number.isFinite(amount) || amount <= 0 || amount > MAX_AMOUNT) {
      throw new Error("Invalid amount");
    }
    if (!Number.isFinite(pricePerUnit) || pricePerUnit <= 0 || pricePerUnit > MAX_PRICE_PER_UNIT) {
      throw new Error("Invalid pricePerUnit");
    }
    const floor = FLOORS[emotionType];
    if (floor && pricePerUnit < floor) {
      throw new Error(`Price below floor for ${emotionType} (€${floor})`);
    }

    const totalCents = Math.round(amount * pricePerUnit * 100);
    if (totalCents < 50) throw new Error("Total below Stripe minimum (€0.50)");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    const customerId = customers.data[0]?.id;

    const origin = req.headers.get("origin") || "https://uniqueapp.fun";
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [{
        price_data: {
          currency: "eur",
          product_data: { name: `${amount}× ${emotionType} (Emotion Market)` },
          unit_amount: totalCents,
        },
        quantity: 1,
      }],
      mode: "payment",
      metadata: {
        product_type: "emotion_market",
        emotion_type: emotionType,
        amount: String(amount),
        price_per_unit: String(pricePerUnit),
        listing_id: listingId ?? "",
        user_id: user.id,
      },
      success_url: `${origin}/emotion-economy?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/emotion-economy?payment=canceled`,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[create-emotion-market-checkout]", msg);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
