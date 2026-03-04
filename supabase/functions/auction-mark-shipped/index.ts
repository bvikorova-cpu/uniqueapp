import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[AUCTION-SHIP] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Starting mark shipped");

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
    if (auction.user_id !== user.id) throw new Error("Not the seller");
    if (!auction.winner_id) throw new Error("Auction has no winner");
    if (auction.shipped_at) throw new Error("Already shipped");

    // Update auction
    await supabase
      .from("auction_items")
      .update({ 
        shipped_at: new Date().toISOString(),
        escrow_status: "shipped",
      })
      .eq("id", auctionId);

    logStep("Auction marked as shipped", { auctionId });

    // Notify winner
    await supabase.from("notifications").insert({
      user_id: auction.winner_id,
      type: "auction_shipped",
      title: "Item Shipped",
      message: `Your auction item "${auction.title}" has been shipped. Please confirm when you receive it.`,
      related_id: auctionId,
    });

    logStep("Notification sent to winner");

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
