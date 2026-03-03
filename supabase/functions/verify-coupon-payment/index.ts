import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { createStripeClient } from "../_shared/stripe.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { sessionId, orderId } = await req.json();

    if (!sessionId || !orderId) {
      throw new Error("Session ID and Order ID are required");
    }

    const stripe = createStripeClient();
    
    // Verify the Stripe session
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (session.payment_status !== "paid") {
      throw new Error("Payment not completed");
    }

    // Get the order
    const { data: order, error: orderError } = await supabaseAdmin
      .from("coupon_orders")
      .select("*, coupon_listings(*)")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      throw new Error("Order not found");
    }

    if (order.status === "completed") {
      return new Response(
        JSON.stringify({ success: true, message: "Order already completed" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update order status
    const { error: updateOrderError } = await supabaseAdmin
      .from("coupon_orders")
      .update({
        status: "completed",
        paid_at: new Date().toISOString(),
        delivered_at: new Date().toISOString(), // Digital delivery is instant
      })
      .eq("id", orderId);

    if (updateOrderError) {
      console.error("Order update error:", updateOrderError);
      throw new Error("Failed to update order");
    }

    // Mark coupon as sold
    const { error: couponUpdateError } = await supabaseAdmin
      .from("coupon_listings")
      .update({ is_sold: true, is_active: false })
      .eq("id", order.coupon_id);

    if (couponUpdateError) {
      console.error("Coupon update error:", couponUpdateError);
    }

    // Create escrow record (auto-release after 24 hours for digital goods)
    const autoReleaseAt = new Date();
    autoReleaseAt.setHours(autoReleaseAt.getHours() + 24);

    const { error: escrowError } = await supabaseAdmin
      .from("coupon_escrow")
      .insert({
        order_id: orderId,
        amount: order.amount,
        commission_amount: order.commission_amount,
        seller_payout: order.seller_payout,
        status: "held",
        held_at: new Date().toISOString(),
        auto_release_at: autoReleaseAt.toISOString(),
      });

    if (escrowError) {
      console.error("Escrow creation error:", escrowError);
    }

    console.log("Payment verified and order completed:", orderId);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Payment verified successfully",
        couponCode: order.coupon_listings?.discount_code || "Check your email for details"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error verifying coupon payment:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});
