import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Authenticate user
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    const { influencerId, amount, paymentMethod, paymentDetails } = await req.json();

    // Verify user owns this influencer
    const { data: influencer, error: influencerError } = await supabase
      .from("virtual_influencers")
      .select("id, user_id, name")
      .eq("id", influencerId)
      .eq("user_id", user.id)
      .single();

    if (influencerError || !influencer) {
      throw new Error("Influencer not found or unauthorized");
    }

    // Check available balance
    const { data: balance, error: balanceError } = await supabase
      .from("influencer_balances")
      .select("*")
      .eq("influencer_id", influencerId)
      .single();

    if (balanceError || !balance) {
      throw new Error("Balance not found");
    }

    if (balance.available_balance < amount) {
      throw new Error(`Insufficient balance. Available: €${balance.available_balance}`);
    }

    if (amount < 50) {
      throw new Error("Minimum withdrawal amount is €50");
    }

    // Create withdrawal request
    const { data: withdrawal, error: withdrawalError } = await supabase
      .from("influencer_withdrawal_requests")
      .insert({
        influencer_id: influencerId,
        amount,
        payment_method: paymentMethod,
        payment_details: paymentDetails,
        status: "pending",
      })
      .select()
      .single();

    if (withdrawalError) throw withdrawalError;

    // Update pending_withdrawal in balance
    const { error: updateError } = await supabase
      .from("influencer_balances")
      .update({
        pending_withdrawal: balance.pending_withdrawal + amount,
      })
      .eq("influencer_id", influencerId);

    if (updateError) throw updateError;

    // Notify admins about new withdrawal request
    const { data: adminUsers } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin");

    if (adminUsers && adminUsers.length > 0) {
      const adminNotifications = adminUsers.map(admin => ({
        user_id: admin.user_id,
        type: "influencer_withdrawal_pending",
        title: "New Influencer Withdrawal Request",
        message: `${influencer.name} requested €${amount} withdrawal via ${paymentMethod}`,
        related_id: influencerId,
        is_read: false,
      }));

      await supabase.from("notifications").insert(adminNotifications);
    }

    return new Response(
      JSON.stringify({ success: true, withdrawal }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Withdrawal request error:", error);
    const errorMessage = error instanceof Error ? error.message : "An error occurred";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});