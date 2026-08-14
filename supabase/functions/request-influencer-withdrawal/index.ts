import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = { "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version" };

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

    // Verify user owns this influencer profile
    const { data: influencer, error: influencerError } = await supabase
      .from("influencer_profiles")
      .select("id, user_id, display_name, pending_balance, total_withdrawn")
      .eq("id", influencerId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (influencerError || !influencer) {
      throw new Error("Influencer not found or unauthorized");
    }

    // Amount already locked in pending withdrawal requests
    const { data: openRequests } = await supabase
      .from("influencer_withdrawal_requests")
      .select("amount, status")
      .eq("influencer_id", influencerId)
      .in("status", ["pending", "approved"]);
    const locked = (openRequests || []).reduce(
      (sum: number, r: { amount: number }) => sum + Number(r.amount || 0), 0);
    const available = Number(influencer.pending_balance || 0) - locked;

    if (amount < 50) {
      throw new Error("Minimum withdrawal amount is €50");
    }
    if (available < amount) {
      throw new Error(`Insufficient balance. Available: €${available.toFixed(2)}`);
    }

    // Create withdrawal request
    const { data: withdrawal, error: withdrawalError } = await supabase
      .from("influencer_withdrawal_requests")
      .insert({ influencer_id: influencerId,
        amount,
        payment_method: paymentMethod,
        payment_details: paymentDetails,
        status: "pending" })
      .select()
      .single();

    if (withdrawalError) throw withdrawalError;

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
        message: `${influencer.display_name} requested €${amount} withdrawal via ${paymentMethod}`,
        related_id: influencerId,
        is_read: false }));

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