import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { ESCROW_HOLD_DAYS } from "../_shared/escrow.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[BAZAAR-NOTIFY-ESCROW] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Starting escrow notification check");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get escrows that will expire in 24 hours
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const today = new Date();

    const { data: expiringEscrows, error } = await supabase
      .from("bazaar_escrow")
      .select(`
        *,
        bazaar_orders(
          id,
          buyer_id,
          seller_id,
          item_id,
          bazaar_items(title)
        )
      `)
      .eq("status", "held")
      .gte("auto_release_at", today.toISOString())
      .lte("auto_release_at", tomorrow.toISOString());

    if (error) {
      throw error;
    }

    logStep("Found expiring escrows", { count: expiringEscrows?.length || 0 });

    const notifications = [];

    for (const escrow of expiringEscrows || []) {
      const order = escrow.bazaar_orders;
      if (!order) continue;

      const itemTitle = order.bazaar_items?.title || "položku";
      const expiresAt = new Date(escrow.auto_release_at);
      const hoursRemaining = Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60));

      // Check if we already sent a notification today
      const { data: existingNotification } = await supabase
        .from("bazaar_notifications")
        .select("id")
        .eq("order_id", order.id)
        .eq("type", "escrow_expiring")
        .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .single();

      if (existingNotification) {
        logStep("Notification already sent", { orderId: order.id });
        continue;
      }

      // Notify buyer
      notifications.push({
        user_id: order.buyer_id,
        order_id: order.id,
        type: "escrow_expiring",
        title: "Escrow vyprší čoskoro",
        message: `Máte ešte ${hoursRemaining} hodín na nahlásenie problému s "${itemTitle}". Po uplynutí tejto doby budú peniaze automaticky uvoľnené predajcovi.`,
      });

      // Notify seller
      notifications.push({
        user_id: order.seller_id,
        order_id: order.id,
        type: "escrow_expiring",
        title: "Escrow sa blíži k uvoľneniu",
        message: `Escrow pre "${itemTitle}" bude automaticky uvoľnený o ${hoursRemaining} hodín.`,
      });
    }

    if (notifications.length > 0) {
      const { error: insertError } = await supabase
        .from("bazaar_notifications")
        .insert(notifications);

      if (insertError) {
        logStep("ERROR inserting notifications", { error: insertError });
      } else {
        logStep("Notifications created", { count: notifications.length });
      }
    }

    // Also check for orders with missing escrow (edge case recovery)
    const { data: ordersWithoutEscrow } = await supabase
      .from("bazaar_orders")
      .select("id, status, escrow_status")
      .eq("status", "paid")
      .is("escrow_status", null)
      .lt("paid_at", new Date(Date.now() - 5 * 60 * 1000).toISOString()); // Paid more than 5 mins ago

    if (ordersWithoutEscrow && ordersWithoutEscrow.length > 0) {
      logStep("Found orders without escrow", { count: ordersWithoutEscrow.length });
      
      // Log for admin review
      for (const order of ordersWithoutEscrow) {
        logStep("Order missing escrow", { orderId: order.id, status: order.status });
      }
    }

    return new Response(
      JSON.stringify({
        notificationsSent: notifications.length,
        expiringEscrows: expiringEscrows?.length || 0,
        ordersWithoutEscrow: ordersWithoutEscrow?.length || 0,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    logStep("ERROR", { message: error instanceof Error ? error.message : error });
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Notification check failed" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
