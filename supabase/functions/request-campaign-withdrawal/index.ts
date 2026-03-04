import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[REQUEST-WITHDRAWAL] ${step}${detailsStr}`);
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

    logStep("User authenticated", { userId: user.id });

    const {
      campaignId,
      campaignType,
      amount,
      bankAccountName,
      bankAccountNumber,
      bankName,
      iban,
      swiftCode,
    } = await req.json();

    logStep("Withdrawal request data", { campaignId, campaignType, amount });

    if (!campaignId || !campaignType || !amount || !bankAccountName || !bankAccountNumber || !bankName) {
      throw new Error("Missing required fields");
    }

    // Use service role key for checking campaign ownership and balance
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Verify user owns this campaign
    const tableMap: Record<string, string> = {
      medical: 'medical_campaigns',
      dream: 'dream_campaigns',
      hero: 'hero_campaigns',
      pet: 'pet_rescue_campaigns',
      student: 'student_campaigns',
      crisis: 'crisis_campaigns',
      talent: 'talent_campaigns',
    };

    const tableName = tableMap[campaignType];
    if (!tableName) {
      throw new Error("Invalid campaign type");
    }

    const { data: campaign, error: campaignError } = await supabaseAdmin
      .from(tableName)
      .select('user_id')
      .eq('id', campaignId)
      .single();

    if (campaignError || !campaign) {
      throw new Error("Campaign not found");
    }

    if (campaign.user_id !== user.id) {
      throw new Error("You do not own this campaign");
    }

    logStep("Campaign ownership verified");

    // Check available balance
    const { data: balance, error: balanceError } = await supabaseAdmin
      .from('campaign_balances')
      .select('current_balance, pending_withdrawal')
      .eq('campaign_id', campaignId)
      .eq('campaign_type', campaignType)
      .single();

    if (balanceError || !balance) {
      throw new Error("Campaign balance not found");
    }

    const availableBalance = balance.current_balance - balance.pending_withdrawal;
    
    if (amount > availableBalance) {
      throw new Error(`Insufficient balance. Available: €${availableBalance.toFixed(2)}`);
    }

    logStep("Balance check passed", { available: availableBalance, requested: amount });

    // Create withdrawal request
    const { data: withdrawal, error: withdrawalError } = await supabaseAdmin
      .from('withdrawal_requests')
      .insert({
        campaign_id: campaignId,
        campaign_type: campaignType,
        creator_id: user.id,
        amount,
        bank_account_name: bankAccountName,
        bank_account_number: bankAccountNumber,
        bank_name: bankName,
        iban: iban || null,
        swift_code: swiftCode || null,
        status: 'pending',
      })
      .select()
      .single();

    if (withdrawalError) {
      logStep("ERROR creating withdrawal request", { error: withdrawalError });
      throw withdrawalError;
    }

    // Update pending withdrawal amount
    await supabaseAdmin
      .from('campaign_balances')
      .update({
        pending_withdrawal: balance.pending_withdrawal + amount,
        updated_at: new Date().toISOString(),
      })
      .eq('campaign_id', campaignId)
      .eq('campaign_type', campaignType);

    logStep("Withdrawal request created successfully", { withdrawalId: withdrawal.id });

    return new Response(
      JSON.stringify({
        success: true,
        withdrawal,
        message: "Withdrawal request submitted successfully. It will be reviewed by an administrator.",
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
