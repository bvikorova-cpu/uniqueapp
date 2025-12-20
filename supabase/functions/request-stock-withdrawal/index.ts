import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Admin user ID - set this in environment variables
const ADMIN_USER_ID = Deno.env.get("ADMIN_USER_ID") || "";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    // Get authenticated user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Authorization required");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error("Invalid authentication");
    }

    const { amount, paymentMethod, paymentDetails } = await req.json();

    if (!amount || amount <= 0) {
      throw new Error("Invalid amount");
    }

    if (!paymentMethod || !paymentDetails) {
      throw new Error("Payment method and details are required");
    }

    console.log("[WITHDRAWAL] Processing withdrawal request:", {
      userId: user.id,
      amount,
      paymentMethod,
    });

    // Check if user has enough pending balance
    const { data: earnings, error: earningsError } = await supabaseClient
      .from("stock_creator_earnings")
      .select("*")
      .eq("creator_id", user.id)
      .single();

    if (earningsError || !earnings) {
      throw new Error("No earnings found");
    }

    if (earnings.pending_balance < amount) {
      throw new Error("Insufficient balance");
    }

    // Get user profile for notification
    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();

    // Create withdrawal request
    const { data: withdrawal, error: withdrawalError } = await supabaseClient
      .from("stock_withdrawal_requests")
      .insert({
        creator_id: user.id,
        amount,
        payment_method: paymentMethod,
        payment_details: paymentDetails,
        status: "pending",
      })
      .select()
      .single();

    if (withdrawalError) {
      console.error("[WITHDRAWAL] Error creating request:", withdrawalError);
      throw withdrawalError;
    }

    // Create notification for creator
    await supabaseClient
      .from("stock_notifications")
      .insert({
        user_id: user.id,
        type: "withdrawal_requested",
        title: "Žiadosť o výplatu odoslaná",
        message: `Vaša žiadosť o výplatu €${amount.toFixed(2)} bola odoslaná a čaká na spracovanie.`,
        related_id: withdrawal.id,
      });

    // Create notification for admin
    if (ADMIN_USER_ID) {
      await supabaseClient
        .from("stock_notifications")
        .insert({
          user_id: ADMIN_USER_ID,
          type: "withdrawal_request",
          title: "Nová žiadosť o výplatu",
          message: `Používateľ ${profile?.full_name || user.email} žiada o výplatu €${amount.toFixed(2)}.`,
          related_id: withdrawal.id,
        });
    }

    console.log("[WITHDRAWAL] Withdrawal request created:", withdrawal.id);

    return new Response(JSON.stringify({ 
      success: true, 
      withdrawal: withdrawal 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("[WITHDRAWAL] Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
