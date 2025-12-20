import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[VERIFY-BAZAAR-ORDER] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    logStep("Starting order payment verification");

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseAdmin.auth.getUser(token);
    const user = data.user;
    if (!user) throw new Error("User not authenticated");

    const { sessionId, orderId } = await req.json();
    logStep("Request data", { sessionId, orderId, userId: user.id });

    // Get order
    const { data: order, error: orderError } = await supabaseAdmin
      .from("bazaar_orders")
      .select(`
        *,
        bazaar_items (
          id,
          title,
          user_id
        )
      `)
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      logStep("Order not found", { orderId });
      throw new Error("Order not found");
    }

    if (order.buyer_id !== user.id) {
      logStep("Unauthorized access", { orderBuyerId: order.buyer_id, userId: user.id });
      throw new Error("Unauthorized");
    }

    if (order.status !== "pending") {
      logStep("Order not in pending status", { orderId, status: order.status });
      return new Response(JSON.stringify({ success: true, message: "Order already processed" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Verify with Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    logStep("Stripe session retrieved", { paymentStatus: session.payment_status, sessionId });

    if (session.payment_status !== "paid") {
      logStep("Payment not completed", { paymentStatus: session.payment_status });
      throw new Error("Payment not completed");
    }

    // Update order to paid status
    const { error: updateError } = await supabaseAdmin
      .from("bazaar_orders")
      .update({
        status: "paid",
        paid_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    if (updateError) {
      logStep("Order update failed", { error: updateError });
      throw updateError;
    }

    logStep("Order updated to paid");

    // Create notification for seller
    const item = order.bazaar_items as any;
    
    await supabaseAdmin
      .from("bazaar_notifications")
      .insert({
        user_id: order.seller_id,
        type: "new_order",
        title: "New Order! 🎉",
        message: `You have a new order for ${item.title}. Amount: €${order.amount.toFixed(2)}. Please ship the item.`,
        order_id: orderId,
      });

    logStep("Seller notification created");

    // Create notification for buyer
    await supabaseAdmin
      .from("bazaar_notifications")
      .insert({
        user_id: order.buyer_id,
        type: "order_confirmed",
        title: "Order Confirmed! ✅",
        message: `Your order for ${item.title} has been confirmed. The seller will ship it soon.`,
        order_id: orderId,
      });

    logStep("Buyer notification created");

    return new Response(JSON.stringify({ 
      success: true, 
      order: {
        id: order.id,
        status: "paid",
        amount: order.amount,
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    logStep("ERROR", { error: error instanceof Error ? error.message : error });
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Verification failed" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
