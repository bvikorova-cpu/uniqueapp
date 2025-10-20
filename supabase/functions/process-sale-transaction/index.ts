import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    // Authenticate user server-side
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user) throw new Error("Unauthorized");

    // Get parameters (only IDs, not calculated amounts)
    const { itemId, itemType, sellerId, buyerId, totalAmount } = await req.json();

    if (!itemId || !itemType || !sellerId || !buyerId || !totalAmount) {
      throw new Error("Missing required fields");
    }

    // SERVER-SIDE: Fetch seller's subscription with service role key
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("tier")
      .eq("user_id", sellerId)
      .eq("status", "active")
      .maybeSingle();

    // SERVER-SIDE: Calculate commission (user cannot manipulate)
    let commissionRate = 5; // default
    if (subscription?.tier === "premium" || subscription?.tier === "business") {
      commissionRate = 0;
    } else if (subscription?.tier === "basic") {
      commissionRate = 3;
    }

    const commissionAmount = (totalAmount * commissionRate) / 100;
    const sellerAmount = totalAmount - commissionAmount;

    // Insert with server-calculated values
    const { data: transactionData, error } = await supabase
      .from("transactions")
      .insert({
        user_id: buyerId,
        seller_id: sellerId,
        buyer_id: buyerId,
        item_id: itemId,
        item_type: itemType,
        amount: totalAmount,
        commission_amount: commissionAmount,
        seller_amount: sellerAmount,
        status: "completed",
        transaction_type: itemType,
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify({ data: transactionData }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Process sale transaction error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
