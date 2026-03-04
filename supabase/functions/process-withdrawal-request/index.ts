import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PROCESS-WITHDRAWAL] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Get authenticated user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error("User not authenticated");
    }

    // Verify user is admin
    const { data: roles, error: rolesError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    if (rolesError || !roles || !roles.some(r => r.role === 'admin')) {
      throw new Error("Unauthorized: Admin access required");
    }

    logStep("Admin verified", { adminId: user.id });

    const {
      withdrawalId,
      action, // 'approve', 'reject', or 'complete'
      adminNotes,
      stripePayoutId,
    } = await req.json();

    logStep("Processing withdrawal", { withdrawalId, action });

    if (!withdrawalId || !action) {
      throw new Error("Missing required fields");
    }

    if (!['approve', 'reject', 'complete'].includes(action)) {
      throw new Error("Invalid action");
    }

    // Use service role for updates
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get withdrawal request
    const { data: withdrawal, error: withdrawalError } = await supabaseAdmin
      .from('withdrawal_requests')
      .select('*')
      .eq('id', withdrawalId)
      .single();

    if (withdrawalError || !withdrawal) {
      throw new Error("Withdrawal request not found");
    }

    // Get current balance
    const { data: balance, error: balanceError } = await supabaseAdmin
      .from('campaign_balances')
      .select('*')
      .eq('campaign_id', withdrawal.campaign_id)
      .eq('campaign_type', withdrawal.campaign_type)
      .single();

    if (balanceError || !balance) {
      throw new Error("Campaign balance not found");
    }

    let updateData: any = {
      reviewed_at: new Date().toISOString(),
      reviewed_by: user.id,
      admin_notes: adminNotes || null,
    };

    let balanceUpdate: any = {};

    if (action === 'approve') {
      updateData.status = 'approved';
      logStep("Withdrawal approved");
    } else if (action === 'reject') {
      updateData.status = 'rejected';
      // Return amount to available balance
      balanceUpdate.pending_withdrawal = balance.pending_withdrawal - withdrawal.amount;
      logStep("Withdrawal rejected, returning funds to available balance");
    } else if (action === 'complete') {
      updateData.status = 'completed';
      updateData.completed_at = new Date().toISOString();
      updateData.stripe_payout_id = stripePayoutId || null;
      
      // Update balance
      balanceUpdate.pending_withdrawal = balance.pending_withdrawal - withdrawal.amount;
      balanceUpdate.total_withdrawn = balance.total_withdrawn + withdrawal.amount;
      balanceUpdate.current_balance = balance.current_balance - withdrawal.amount;
      
      logStep("Withdrawal completed, updating balances");
    }

    // Update withdrawal request
    const { error: updateError } = await supabaseAdmin
      .from('withdrawal_requests')
      .update(updateData)
      .eq('id', withdrawalId);

    if (updateError) {
      logStep("ERROR updating withdrawal", { error: updateError });
      throw updateError;
    }

    // Update balance if needed
    if (Object.keys(balanceUpdate).length > 0) {
      balanceUpdate.updated_at = new Date().toISOString();
      
      const { error: balanceUpdateError } = await supabaseAdmin
        .from('campaign_balances')
        .update(balanceUpdate)
        .eq('campaign_id', withdrawal.campaign_id)
        .eq('campaign_type', withdrawal.campaign_type);

      if (balanceUpdateError) {
        logStep("ERROR updating balance", { error: balanceUpdateError });
        throw balanceUpdateError;
      }
    }

    logStep("Withdrawal processed successfully");

    return new Response(
      JSON.stringify({
        success: true,
        message: `Withdrawal request ${action}d successfully`,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
