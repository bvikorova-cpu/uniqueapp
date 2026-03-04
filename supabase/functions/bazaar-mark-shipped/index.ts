import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[BAZAAR-MARK-SHIPPED] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user } } = await supabase.auth.getUser(token);
    
    if (!user) {
      throw new Error("User not authenticated");
    }

    const { orderId, trackingNumber, shippingCarrier } = await req.json();
    logStep("Request received", { orderId, userId: user.id });

    // Get order and verify seller
    const { data: order, error: orderError } = await supabase
      .from("bazaar_orders")
      .select("*, bazaar_items(title)")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      throw new Error("Order not found");
    }

    if (order.seller_id !== user.id) {
      throw new Error("Only seller can mark order as shipped");
    }

    if (order.status !== "paid" && order.status !== "escrow_held") {
      throw new Error(`Cannot ship order with status: ${order.status}`);
    }

    // Update order
    const { error: updateError } = await supabase
      .from("bazaar_orders")
      .update({
        status: "shipped",
        shipped_at: new Date().toISOString(),
        shipping_address: trackingNumber ? JSON.stringify({
          tracking_number: trackingNumber,
          carrier: shippingCarrier,
        }) : null,
      })
      .eq("id", orderId);

    if (updateError) throw updateError;

    logStep("Order marked as shipped", { orderId });

    // Create notification for buyer
    await supabase.from("bazaar_notifications").insert({
      user_id: order.buyer_id,
      order_id: orderId,
      type: "order_shipped",
      title: "Objednávka odoslaná",
      message: `Vaša objednávka "${order.bazaar_items?.title || 'položka'}" bola odoslaná.${trackingNumber ? ` Tracking: ${trackingNumber}` : ''}`,
    });

    return new Response(
      JSON.stringify({ success: true, orderId }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    logStep("ERROR", { message: error instanceof Error ? error.message : error });
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to mark as shipped" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
