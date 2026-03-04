import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    // Authenticate user
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error("User not authenticated");
    }

    const { amount, paymentMethod, paymentDetails } = await req.json();

    console.log("Withdrawal request:", { userId: user.id, amount, paymentMethod });

    // Get instructor profile
    const { data: instructor, error: instructorError } = await supabaseClient
      .from('instructor_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (instructorError || !instructor) {
      throw new Error("Instructor profile not found");
    }

    // Check balance
    if (amount > instructor.pending_balance) {
      throw new Error("Insufficient balance");
    }

    // Check for pending requests
    const { data: pendingRequests } = await supabaseClient
      .from('instructor_withdrawal_requests')
      .select('id')
      .eq('instructor_id', instructor.id)
      .eq('status', 'pending');

    if (pendingRequests && pendingRequests.length > 0) {
      throw new Error("You already have a pending withdrawal request");
    }

    // Create withdrawal request
    const { data: request, error: requestError } = await supabaseClient
      .from('instructor_withdrawal_requests')
      .insert({
        instructor_id: instructor.id,
        amount,
        payment_method: paymentMethod,
        payment_details: paymentDetails,
        status: 'pending'
      })
      .select()
      .single();

    if (requestError) throw requestError;

    console.log("Withdrawal request created:", request.id);

    // Update instructor balance (reserve the amount)
    const { error: updateError } = await supabaseClient
      .from('instructor_profiles')
      .update({
        pending_balance: instructor.pending_balance - amount
      })
      .eq('id', instructor.id);

    if (updateError) throw updateError;

    // Get admin user ID
    const adminUserId = Deno.env.get("ADMIN_USER_ID");

    // Create notification for instructor
    await supabaseClient
      .from('notifications')
      .insert({
        user_id: user.id,
        actor_id: user.id,
        type: 'withdrawal_requested',
        post_id: null
      });

    // Create notification for admin
    if (adminUserId) {
      await supabaseClient
        .from('notifications')
        .insert({
          user_id: adminUserId,
          actor_id: user.id,
          type: 'instructor_withdrawal_request',
          post_id: null
        });
      console.log("Admin notification sent to:", adminUserId);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        request: request,
        message: "Withdrawal request submitted successfully" 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
