import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { openDispute } from "../_shared/escrow.ts";

const corsHeaders = { "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version" };

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

    const { orderId, reason, description, evidenceUrls } = await req.json();
    
    if (!orderId) throw new Error("Order ID required");
    if (!reason) throw new Error("Reason required");

    console.log(`[OPEN-DISPUTE] User ${user.id} opening dispute for order ${orderId}`);

    // Verify user is part of order
    const { data: order, error: orderError } = await supabase
      .from('bazaar_orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) throw new Error("Order not found");
    if (order.buyer_id !== user.id && order.seller_id !== user.id) {
      throw new Error("You are not part of this order");
    }

    // Check if dispute already exists
    const { data: existingDispute } = await supabase
      .from('bazaar_disputes')
      .select('id')
      .eq('order_id', orderId)
      .eq('status', 'open')
      .single();

    if (existingDispute) {
      throw new Error("A dispute is already open for this order");
    }

    const result = await openDispute(
      supabase,
      orderId,
      user.id,
      reason,
      description,
      evidenceUrls
    );

    // Create notification for the other party
    const otherPartyId = order.buyer_id === user.id ? order.seller_id : order.buyer_id;
    await supabase.from('bazaar_notifications').insert({
      user_id: otherPartyId,
      type: 'dispute_opened',
      title: 'Dispute Opened',
      message: `A dispute has been opened for order. Reason: ${reason}`,
      order_id: orderId });

    console.log(`[OPEN-DISPUTE] Success - dispute ${result.disputeId}`);

    return new Response(JSON.stringify({ success: true, ...result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("[OPEN-DISPUTE] Error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Failed to open dispute" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500 });
  }
});
