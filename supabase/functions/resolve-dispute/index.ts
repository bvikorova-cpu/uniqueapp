import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { releaseEscrow, refundEscrow } from "../_shared/escrow.ts";

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
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    const { disputeId, resolution, adminNotes, adminKey } = await req.json();
    
    // Admin authentication
    const expectedAdminKey = Deno.env.get("ADMIN_SECRET_KEY");
    if (adminKey !== expectedAdminKey) {
      throw new Error("Unauthorized - admin access required");
    }

    if (!disputeId) throw new Error("Dispute ID required");
    if (!resolution || !['buyer', 'seller'].includes(resolution)) {
      throw new Error("Resolution must be 'buyer' or 'seller'");
    }

    console.log(`[RESOLVE-DISPUTE] Resolving dispute ${disputeId} in favor of ${resolution}`);

    // Get dispute with order and escrow
    const { data: dispute, error: disputeError } = await supabase
      .from('bazaar_disputes')
      .select('*, bazaar_orders(*, bazaar_escrow(*), bazaar_transactions(*))')
      .eq('id', disputeId)
      .single();

    if (disputeError || !dispute) throw new Error("Dispute not found");
    if (dispute.status !== 'open' && dispute.status !== 'under_review') {
      throw new Error("Dispute already resolved");
    }

    const order = dispute.bazaar_orders;
    const escrow = order?.bazaar_escrow?.[0];
    const transaction = order?.bazaar_transactions?.[0];

    if (!escrow) throw new Error("No escrow found");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    let result;
    const resolvedStatus = resolution === 'buyer' ? 'resolved_buyer' : 'resolved_seller';

    if (resolution === 'buyer') {
      // Refund to buyer
      if (!transaction?.stripe_payment_intent_id) {
        throw new Error("No payment intent found for refund");
      }
      result = await refundEscrow(supabase, stripe, escrow.id, transaction.stripe_payment_intent_id);
    } else {
      // Release to seller
      result = await releaseEscrow(supabase, stripe, escrow.id);
    }

    // Update dispute status
    await supabase
      .from('bazaar_disputes')
      .update({
        status: resolvedStatus,
        admin_notes: adminNotes,
        resolved_at: new Date().toISOString(),
      })
      .eq('id', disputeId);

    // Notify both parties
    const winnerMessage = resolution === 'buyer' 
      ? 'The dispute was resolved in your favor. A refund has been processed.'
      : 'The dispute was resolved in your favor. Payment has been released.';
    const loserMessage = resolution === 'buyer'
      ? 'The dispute was resolved in favor of the buyer.'
      : 'The dispute was resolved in favor of the seller.';

    await supabase.from('bazaar_notifications').insert([
      {
        user_id: order.buyer_id,
        type: 'dispute_resolved',
        title: 'Dispute Resolved',
        message: resolution === 'buyer' ? winnerMessage : loserMessage,
        order_id: order.id,
      },
      {
        user_id: order.seller_id,
        type: 'dispute_resolved',
        title: 'Dispute Resolved',
        message: resolution === 'seller' ? winnerMessage : loserMessage,
        order_id: order.id,
      },
    ]);

    console.log(`[RESOLVE-DISPUTE] Success - resolved for ${resolution}`);

    return new Response(JSON.stringify({ ...result, resolution: resolvedStatus }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[RESOLVE-DISPUTE] Error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Failed to resolve dispute" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
