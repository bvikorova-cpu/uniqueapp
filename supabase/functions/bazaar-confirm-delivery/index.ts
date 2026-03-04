import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { releaseEscrow } from "../_shared/escrow.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[BAZAAR-CONFIRM-DELIVERY] ${step}${detailsStr}`);
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

    const { orderId, releaseEscrowNow } = await req.json();
    logStep("Request received", { orderId, userId: user.id, releaseEscrowNow });

    // Get order and verify buyer
    const { data: order, error: orderError } = await supabase
      .from("bazaar_orders")
      .select("*, bazaar_items(title)")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      throw new Error("Order not found");
    }

    if (order.buyer_id !== user.id) {
      throw new Error("Only buyer can confirm delivery");
    }

    if (order.status !== "shipped" && order.status !== "escrow_held" && order.status !== "paid") {
      throw new Error(`Cannot confirm delivery for order with status: ${order.status}`);
    }

    // Update order
    const { error: updateError } = await supabase
      .from("bazaar_orders")
      .update({
        status: "delivered",
        delivered_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    if (updateError) throw updateError;

    logStep("Order marked as delivered", { orderId });

    // If buyer wants to release escrow immediately
    if (releaseEscrowNow) {
      const { data: escrow } = await supabase
        .from("bazaar_escrow")
        .select("id")
        .eq("order_id", orderId)
        .eq("status", "held")
        .single();

      if (escrow) {
        const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
          apiVersion: "2025-08-27.basil",
        });

        // Use service role for release
        const supabaseAdmin = createClient(
          Deno.env.get("SUPABASE_URL") ?? "",
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
        );

        // Get seller's Stripe Connect account if exists
        const { data: sellerProfile } = await supabaseAdmin
          .from("profiles")
          .select("stripe_connect_account_id")
          .eq("id", order.seller_id)
          .single();

        try {
          await releaseEscrow(
            supabaseAdmin,
            stripe,
            escrow.id,
            sellerProfile?.stripe_connect_account_id
          );

          // Update order to completed
          await supabaseAdmin
            .from("bazaar_orders")
            .update({ status: "completed", completed_at: new Date().toISOString() })
            .eq("id", orderId);

          logStep("Escrow released early by buyer", { orderId, escrowId: escrow.id });
        } catch (releaseError) {
          logStep("ERROR releasing escrow", { error: releaseError });
        }
      }
    }

    // Create notification for seller
    await supabase.from("bazaar_notifications").insert({
      user_id: order.seller_id,
      order_id: orderId,
      type: "delivery_confirmed",
      title: "Doručenie potvrdené",
      message: `Kupujúci potvrdil doručenie "${order.bazaar_items?.title || 'položka'}".${releaseEscrowNow ? ' Peniaze boli uvoľnené.' : ' Peniaze budú uvoľnené po uplynutí ochrannej lehoty.'}`,
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        orderId,
        escrowReleased: releaseEscrowNow,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    logStep("ERROR", { message: error instanceof Error ? error.message : error });
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to confirm delivery" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
