import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-CONNECT-PAYOUT] ${step}${detailsStr}`);
};

// Platform fee rates by campaign type
const PLATFORM_FEES: Record<string, number> = {
  medical: 0.05,   // 5%
  dream: 0.07,     // 7%
  hero: 0.06,      // 6%
  pet: 0.07,       // 7%
  student: 0.06,   // 6%
  crisis: 0.08,    // 8%
  talent: 0.10,    // 10%
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2025-08-27.basil",
    });

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

    const { campaignId, campaignType, amount } = await req.json();

    if (!campaignId || !campaignType || !amount) {
      throw new Error("campaignId, campaignType, and amount are required");
    }

    // Use service role for database operations
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get user's Connect account
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('stripe_connect_account_id, stripe_connect_payouts_enabled')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      throw new Error("Failed to fetch user profile");
    }

    if (!profile.stripe_connect_account_id) {
      throw new Error("No Stripe Connect account linked. Please set up your payout account first.");
    }

    if (!profile.stripe_connect_payouts_enabled) {
      throw new Error("Payouts are not enabled on your Stripe account. Please complete the onboarding process.");
    }

    logStep("Using Connect account", { accountId: profile.stripe_connect_account_id });

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

    // Calculate amounts in cents
    const amountInCents = Math.round(amount * 100);

    // Create a transfer to the connected account
    // Note: This transfers funds from the platform's Stripe balance to the connected account
    const transfer = await stripe.transfers.create({
      amount: amountInCents,
      currency: 'eur',
      destination: profile.stripe_connect_account_id,
      metadata: {
        campaign_id: campaignId,
        campaign_type: campaignType,
        user_id: user.id,
      },
    });

    logStep("Transfer created", { transferId: transfer.id, amount: amountInCents });

    // Create withdrawal request record
    const { data: withdrawal, error: withdrawalError } = await supabaseAdmin
      .from('withdrawal_requests')
      .insert({
        campaign_id: campaignId,
        campaign_type: campaignType,
        creator_id: user.id,
        amount,
        stripe_connect_account_id: profile.stripe_connect_account_id,
        stripe_transfer_id: transfer.id,
        status: 'completed',
      })
      .select()
      .single();

    if (withdrawalError) {
      logStep("ERROR creating withdrawal request", { error: withdrawalError });
      // Even if DB fails, the transfer went through - log this
      throw new Error("Transfer successful but failed to record withdrawal. Contact support.");
    }

    // Update campaign balance
    await supabaseAdmin
      .from('campaign_balances')
      .update({
        current_balance: balance.current_balance - amount,
        total_withdrawn: balance.current_balance - amount >= 0 ? amount : 0,
        updated_at: new Date().toISOString(),
      })
      .eq('campaign_id', campaignId)
      .eq('campaign_type', campaignType);

    logStep("Withdrawal completed successfully", { withdrawalId: withdrawal.id });

    return new Response(
      JSON.stringify({
        success: true,
        withdrawal,
        transferId: transfer.id,
        message: "Funds transferred to your Stripe account. They will be deposited to your bank account according to your Stripe payout schedule.",
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
