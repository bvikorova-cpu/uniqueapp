import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { getExpiredEscrows, releaseEscrow } from "../_shared/escrow.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[BAZAAR-AUTO-RELEASE] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Starting auto-release check");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Get all expired escrows
    const expiredEscrows = await getExpiredEscrows(supabase);
    logStep("Found expired escrows", { count: expiredEscrows.length });

    const results = {
      total: expiredEscrows.length,
      released: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const escrow of expiredEscrows) {
      try {
        // Get order details to check if there's no active dispute
        const { data: disputes } = await supabase
          .from("bazaar_disputes")
          .select("id, status")
          .eq("order_id", escrow.order_id)
          .eq("status", "open");

        if (disputes && disputes.length > 0) {
          logStep("Skipping - active dispute exists", { escrowId: escrow.id, orderId: escrow.order_id });
          continue;
        }

        // Get seller's Stripe Connect account if exists
        const { data: order } = await supabase
          .from("bazaar_orders")
          .select("seller_id, item_id")
          .eq("id", escrow.order_id)
          .single();

        // Get item title
        const { data: item } = await supabase
          .from("bazaar_items")
          .select("title")
          .eq("id", order?.item_id)
          .single();

        let sellerStripeAccountId: string | undefined;

        // Check if seller has Stripe Connect account
        const { data: sellerProfile } = await supabase
          .from("profiles")
          .select("stripe_connect_account_id")
          .eq("id", order?.seller_id)
          .single();

        if (sellerProfile?.stripe_connect_account_id) {
          sellerStripeAccountId = sellerProfile.stripe_connect_account_id;
        }

        // Release the escrow
        const result = await releaseEscrow(supabase, stripe, escrow.id, sellerStripeAccountId);

        if (result.success) {
          results.released++;
          logStep("Escrow released", { escrowId: escrow.id, transferId: result.transferId });

          // Update order status
          await supabase
            .from("bazaar_orders")
            .update({ status: "completed", completed_at: new Date().toISOString() })
            .eq("id", escrow.order_id);

          // Create notification for seller
          if (order?.seller_id) {
            await supabase.from("bazaar_notifications").insert({
              user_id: order.seller_id,
              order_id: escrow.order_id,
              type: "escrow_released",
              title: "Peniaze uvoľnené",
              message: `Escrow bol automaticky uvoľnený pre "${item?.title || 'položku'}". Peniaze boli prevedené na váš účet.`,
            });
          }
        }
      } catch (err) {
        results.failed++;
        const errorMessage = err instanceof Error ? err.message : String(err);
        results.errors.push(`Escrow ${escrow.id}: ${errorMessage}`);
        logStep("ERROR releasing escrow", { escrowId: escrow.id, error: errorMessage });
      }
    }

    logStep("Auto-release completed", results);

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    logStep("ERROR", { message: error instanceof Error ? error.message : error });
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Auto-release failed" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
