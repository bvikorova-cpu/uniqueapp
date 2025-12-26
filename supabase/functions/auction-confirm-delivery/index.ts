import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[AUCTION-DELIVER] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Starting confirm delivery");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) throw new Error("Not authenticated");

    const { auctionId } = await req.json();
    logStep("Request", { auctionId, userId: user.id });

    // Get auction
    const { data: auction, error: auctionError } = await supabase
      .from("auction_items")
      .select("*")
      .eq("id", auctionId)
      .single();

    if (auctionError || !auction) throw new Error("Auction not found");
    if (auction.winner_id !== user.id) throw new Error("Not the winner");
    if (!auction.shipped_at) throw new Error("Not shipped yet");
    if (auction.delivered_at) throw new Error("Already delivered");

    // Update auction
    await supabase
      .from("auction_items")
      .update({ 
        delivered_at: new Date().toISOString(),
        escrow_status: "delivered",
      })
      .eq("id", auctionId);

    logStep("Auction marked as delivered", { auctionId });

    // Get escrow record
    const { data: escrow } = await supabase
      .from("auction_escrow")
      .select("*")
      .eq("auction_id", auctionId)
      .eq("status", "held")
      .single();

    if (escrow) {
      // Release escrow
      const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
        apiVersion: "2025-08-27.basil",
      });

      let transferId: string | undefined;

      // Update escrow to released
      await supabase
        .from("auction_escrow")
        .update({
          status: "released",
          released_at: new Date().toISOString(),
          stripe_transfer_id: transferId,
        })
        .eq("id", escrow.id);

      await supabase
        .from("auction_items")
        .update({ escrow_status: "released" })
        .eq("id", auctionId);

      logStep("Escrow released", { escrowId: escrow.id, sellerPayout: escrow.seller_payout });

      // Create seller balance record (for withdrawal)
      const { data: existingBalance } = await supabase
        .from("seller_balances")
        .select("*")
        .eq("user_id", auction.user_id)
        .single();

      if (existingBalance) {
        await supabase
          .from("seller_balances")
          .update({ 
            available_balance: existingBalance.available_balance + escrow.seller_payout,
            total_earned: existingBalance.total_earned + escrow.seller_payout,
          })
          .eq("user_id", auction.user_id);
      } else {
        await supabase
          .from("seller_balances")
          .insert({
            user_id: auction.user_id,
            available_balance: escrow.seller_payout,
            total_earned: escrow.seller_payout,
            pending_balance: 0,
          });
      }

      logStep("Seller balance updated", { sellerId: auction.user_id, amount: escrow.seller_payout });
    }

    // Notify seller
    await supabase.from("notifications").insert({
      user_id: auction.user_id,
      type: "auction_delivered",
      title: "Item Delivered",
      message: `Your auction item "${auction.title}" has been delivered. Payment has been released to your balance.`,
      related_id: auctionId,
    });

    logStep("Notification sent to seller");

    return new Response(JSON.stringify({ success: true }), {
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
