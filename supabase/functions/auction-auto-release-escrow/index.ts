import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[AUCTION-AUTO-RELEASE] ${step}${detailsStr}`);
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

    // Find expired escrows that should be auto-released
    const { data: expiredEscrows, error } = await supabase
      .from("auction_escrow")
      .select("*, auction_items(*)")
      .eq("status", "held")
      .lt("auto_release_at", new Date().toISOString());

    if (error) throw error;

    logStep("Found expired escrows", { count: expiredEscrows?.length || 0 });

    let releasedCount = 0;

    for (const escrow of expiredEscrows || []) {
      try {
        // Release escrow
        await supabase
          .from("auction_escrow")
          .update({
            status: "released",
            released_at: new Date().toISOString(),
          })
          .eq("id", escrow.id);

        // Update auction
        await supabase
          .from("auction_items")
          .update({ 
            escrow_status: "released",
            delivered_at: escrow.auction_items?.delivered_at || new Date().toISOString(),
          })
          .eq("id", escrow.auction_id);

        // Update seller balance
        const { data: existingBalance } = await supabase
          .from("seller_balances")
          .select("*")
          .eq("user_id", escrow.seller_id)
          .single();

        if (existingBalance) {
          await supabase
            .from("seller_balances")
            .update({ 
              available_balance: existingBalance.available_balance + escrow.seller_payout,
              total_earned: existingBalance.total_earned + escrow.seller_payout,
            })
            .eq("user_id", escrow.seller_id);
        } else {
          await supabase
            .from("seller_balances")
            .insert({
              user_id: escrow.seller_id,
              available_balance: escrow.seller_payout,
              total_earned: escrow.seller_payout,
              pending_balance: 0,
            });
        }

        // Notify seller
        await supabase.from("notifications").insert({
          user_id: escrow.seller_id,
          type: "auction_auto_released",
          title: "Payment Auto-Released",
          message: `Payment for auction "${escrow.auction_items?.title || 'item'}" has been automatically released to your balance.`,
          related_id: escrow.auction_id,
        });

        releasedCount++;
        logStep("Escrow released", { escrowId: escrow.id, auctionId: escrow.auction_id });
      } catch (err) {
        logStep("ERROR releasing escrow", { escrowId: escrow.id, error: err });
      }
    }

    logStep("Auto-release complete", { releasedCount });

    return new Response(JSON.stringify({ 
      success: true, 
      releasedCount,
      totalChecked: expiredEscrows?.length || 0,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    logStep("ERROR", { error: error instanceof Error ? error.message : error });
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});
