import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { refundEscrow } from "../_shared/escrow.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    // This endpoint requires admin/service role - used for dispute resolution
    const { orderId, adminKey } = await req.json();
    
    // Simple admin key check (in production use proper admin auth)
    const expectedAdminKey = Deno.env.get("ADMIN_SECRET_KEY");
    if (adminKey !== expectedAdminKey) {
      throw new Error("Unauthorized - admin access required");
    }

    if (!orderId) throw new Error("Order ID required");

    console.log(`[ESCROW-REFUND] Processing refund for order ${orderId}`);

    // Get order with escrow and transaction
    const { data: order, error: orderError } = await supabase
      .from('bazaar_orders')
      .select('*, bazaar_escrow(*), bazaar_transactions(*)')
      .eq('id', orderId)
      .single();

    if (orderError || !order) throw new Error("Order not found");

    const escrow = order.bazaar_escrow?.[0];
    if (!escrow) throw new Error("No escrow found for this order");

    const transaction = order.bazaar_transactions?.[0];
    const paymentIntentId = transaction?.stripe_payment_intent_id;
    
    if (!paymentIntentId) throw new Error("No payment intent found");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const result = await refundEscrow(supabase, stripe, escrow.id, paymentIntentId);

    console.log(`[ESCROW-REFUND] Success for order ${orderId}`);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[ESCROW-REFUND] Error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Refund failed" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
