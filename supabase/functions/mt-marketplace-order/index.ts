// Megatalent marketplace: create order + Stripe Checkout in one server call.
// Body: { listing_id: string }
// Replaces the previous client-side INSERT into mt_marketplace_orders (now RLS-blocked).
// 80/20 escrow split is enforced later by mt-release-funds via Stripe Connect transfer.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY missing");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No auth header");
    const token = authHeader.replace("Bearer ", "");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    );
    const { data: udata, error: uerr } = await supabase.auth.getUser(token);
    if (uerr || !udata.user?.email) throw new Error("Not authenticated");
    const user = udata.user;

    const body = await req.json().catch(() => ({}));
    const listing_id: string = body?.listing_id;
    if (!listing_id || typeof listing_id !== "string") {
      throw new Error("listing_id required");
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    // Verify listing is real, active, and not user's own.
    const { data: listing, error: lerr } = await admin
      .from("mt_marketplace_listings")
      .select("id, seller_id, title, price_cents, active, eta_days")
      .eq("id", listing_id)
      .maybeSingle();
    if (lerr || !listing) throw new Error("Listing not found");
    if (!listing.active) throw new Error("Listing inactive");
    if (listing.seller_id === user.id) throw new Error("Cannot buy own listing");
    if (!listing.price_cents || listing.price_cents < 100) {
      throw new Error("Invalid listing price");
    }

    // Idempotency: reuse an existing pending order for this (buyer, listing) if present.
    const { data: existing } = await admin
      .from("mt_marketplace_orders")
      .select("id, stripe_session_id, status")
      .eq("buyer_id", user.id)
      .eq("listing_id", listing_id)
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    let orderId: string;
    if (existing?.id) {
      orderId = existing.id;
    } else {
      const { data: ins, error: insErr } = await admin
        .from("mt_marketplace_orders")
        .insert({
          listing_id,
          buyer_id: user.id,
          seller_id: listing.seller_id,
          price_cents: listing.price_cents,
          status: "pending",
          delivery_due_at: new Date(Date.now() + listing.eta_days * 86400000).toISOString(),
        })
        .select("id")
        .single();
      if (insErr || !ins) throw new Error(insErr?.message || "Order insert failed");
      orderId = ins.id;
    }

    // Stripe Checkout (escrow held until mt-release-funds runs).
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    const customerId = customers.data[0]?.id;
    const origin = req.headers.get("origin") || "https://uniqueapp.fun";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      mode: "payment",
      line_items: [{
        price_data: {
          currency: "eur",
          unit_amount: listing.price_cents,
          product_data: { name: `Marketplace: ${listing.title}` },
        },
        quantity: 1,
      }],
      metadata: {
        mt_kind: "marketplace",
        mt_row_id: orderId,
        user_id: user.id,
      },
      payment_intent_data: {
        metadata: { mt_kind: "marketplace", mt_row_id: orderId, user_id: user.id },
      },
      success_url: `${origin}/megatalent?mt_paid=1`,
      cancel_url: `${origin}/megatalent?mt_cancelled=1`,
    });

    await admin
      .from("mt_marketplace_orders")
      .update({ stripe_session_id: session.id })
      .eq("id", orderId);

    return new Response(
      JSON.stringify({ url: session.url, order_id: orderId }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[mt-marketplace-order]", msg);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
