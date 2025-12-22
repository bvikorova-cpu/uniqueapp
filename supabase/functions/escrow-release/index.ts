import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { releaseEscrow } from "../_shared/escrow.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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
    if (!user) throw new Error("Not authenticated");

    const { orderId } = await req.json();
    if (!orderId) throw new Error("Order ID required");

    console.log(`[ESCROW-RELEASE] Processing order ${orderId} by user ${user.id}`);

    // Get order and verify buyer
    const { data: order, error: orderError } = await supabase
      .from('bazaar_orders')
      .select('*, bazaar_escrow(*)')
      .eq('id', orderId)
      .single();

    if (orderError || !order) throw new Error("Order not found");
    if (order.buyer_id !== user.id) throw new Error("Only buyer can release escrow");
    if (order.status !== 'delivered') throw new Error("Order must be delivered first");

    const escrow = order.bazaar_escrow?.[0];
    if (!escrow) throw new Error("No escrow found for this order");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const result = await releaseEscrow(supabase, stripe, escrow.id);

    // Update order status to completed
    await supabase
      .from('bazaar_orders')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', orderId);

    console.log(`[ESCROW-RELEASE] Success for order ${orderId}`);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[ESCROW-RELEASE] Error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Release failed" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
