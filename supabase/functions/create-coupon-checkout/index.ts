import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { createStripeClient } from "../_shared/stripe.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const COMMISSION_RATE = 0.10; // 10% platform commission

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Authorization required");
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );
    if (!authHeader) {
      throw new Error("Authorization required");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error("Invalid authorization");
    }

    const { couponId } = await req.json();
    
    if (!couponId) {
      throw new Error("Coupon ID is required");
    }

    // Get coupon details
    const { data: coupon, error: couponError } = await supabaseClient
      .from("coupon_listings")
      .select("*")
      .eq("id", couponId)
      .eq("is_active", true)
      .eq("is_sold", false)
      .single();

    if (couponError || !coupon) {
      throw new Error("Coupon not found or already sold");
    }

    if (coupon.user_id === user.id) {
      throw new Error("Cannot purchase your own coupon");
    }

    const stripe = createStripeClient();
    const amount = coupon.selling_price;
    const commissionAmount = amount * COMMISSION_RATE;
    const sellerPayout = amount - commissionAmount;

    // Create order record
    const { data: order, error: orderError } = await supabaseClient
      .from("coupon_orders")
      .insert({
        coupon_id: couponId,
        buyer_id: user.id,
        seller_id: coupon.user_id,
        amount: amount,
        commission_amount: commissionAmount,
        seller_payout: sellerPayout,
        status: "pending",
        buyer_email: user.email,
      })
      .select()
      .single();

    if (orderError) {
      console.error("Order creation error:", orderError);
      throw new Error("Failed to create order");
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: coupon.title,
              description: `${coupon.store_name} - ${coupon.coupon_type}`,
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/coupon-marketplace?payment=success&session_id={CHECKOUT_SESSION_ID}&order_id=${order.id}`,
      cancel_url: `${req.headers.get("origin")}/coupon-marketplace?payment=cancelled`,
      metadata: {
        order_id: order.id,
        coupon_id: couponId,
        buyer_id: user.id,
        seller_id: coupon.user_id,
      },
    });

    // Update order with session ID
    await supabaseClient
      .from("coupon_orders")
      .update({ stripe_session_id: session.id })
      .eq("id", order.id);

    console.log("Checkout session created:", session.id);

    return new Response(
      JSON.stringify({ url: session.url }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error creating coupon checkout:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});
