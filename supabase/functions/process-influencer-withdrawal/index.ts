import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: any) => {
  console.log(`[PROCESS-INFLUENCER-WITHDRAWAL] ${step}`, details || "");
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Authenticate admin
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    // Check if user is admin
    const { data: userRole } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (userRole?.role !== "admin") {
      throw new Error("Admin access required");
    }

    const { withdrawalId, action, adminNotes, stripePayoutId } = await req.json();
    logStep("Processing withdrawal", { withdrawalId, action });

    // Get withdrawal request
    const { data: withdrawal, error: withdrawalError } = await supabase
      .from("influencer_withdrawal_requests")
      .select("*")
      .eq("id", withdrawalId)
      .single();

    if (withdrawalError || !withdrawal) {
      throw new Error("Withdrawal request not found");
    }

    // Get current balance
    const { data: balance, error: balanceError } = await supabase
      .from("influencer_balances")
      .select("*")
      .eq("influencer_id", withdrawal.influencer_id)
      .single();

    if (balanceError || !balance) {
      throw new Error("Balance not found");
    }

    let updateData: any = {
      status: action,
      admin_notes: adminNotes,
      processed_at: new Date().toISOString(),
    };

    if (action === "completed" && stripePayoutId) {
      updateData.stripe_payout_id = stripePayoutId;
    }

    // Update withdrawal request
    const { error: updateError } = await supabase
      .from("influencer_withdrawal_requests")
      .update(updateData)
      .eq("id", withdrawalId);

    if (updateError) throw updateError;

    // Get influencer details for notification
    const { data: influencer, error: influencerError } = await supabase
      .from("virtual_influencers")
      .select("user_id, name")
      .eq("id", withdrawal.influencer_id)
      .single();

    if (influencerError) throw influencerError;

    // Update balance based on action
    if (action === "rejected") {
      // Return funds to available balance
      const { error: balanceError } = await supabase
        .from("influencer_balances")
        .update({
          pending_withdrawal: balance.pending_withdrawal - withdrawal.amount,
        })
        .eq("influencer_id", withdrawal.influencer_id);

      if (balanceError) throw balanceError;
      logStep("Funds returned to available balance");

      // Create notification for user
      await supabase
        .from("notifications")
        .insert({
          user_id: influencer.user_id,
          type: "influencer_withdrawal_rejected",
          title: "Withdrawal Request Rejected",
          message: `Your withdrawal request for €${withdrawal.amount} for ${influencer.name} was rejected. ${adminNotes || ""}`,
          is_read: false,
        });
    } else if (action === "completed") {
      // Move from pending to withdrawn
      const { error: balanceError } = await supabase
        .from("influencer_balances")
        .update({
          pending_withdrawal: balance.pending_withdrawal - withdrawal.amount,
          withdrawn: balance.withdrawn + withdrawal.amount,
        })
        .eq("influencer_id", withdrawal.influencer_id);

      if (balanceError) throw balanceError;
      logStep("Funds moved to withdrawn");

      // Create notification for user
      await supabase
        .from("notifications")
        .insert({
          user_id: influencer.user_id,
          type: "influencer_withdrawal_completed",
          title: "Withdrawal Completed 💰",
          message: `Your withdrawal of €${withdrawal.amount} for ${influencer.name} has been processed and sent to your ${withdrawal.payment_method}.`,
          is_read: false,
        });
    } else if (action === "approved") {
      // Create notification for user
      await supabase
        .from("notifications")
        .insert({
          user_id: influencer.user_id,
          type: "influencer_withdrawal_approved",
          title: "Withdrawal Approved ✅",
          message: `Your withdrawal request for €${withdrawal.amount} for ${influencer.name} has been approved and will be processed soon.`,
          is_read: false,
        });
    }

    logStep("Withdrawal processed successfully");

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Process withdrawal error:", error);
    const errorMessage = error instanceof Error ? error.message : "An error occurred";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});