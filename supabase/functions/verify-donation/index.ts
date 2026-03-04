import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[VERIFY-DONATION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const { sessionId } = await req.json();
    
    if (!sessionId) {
      throw new Error("Session ID is required");
    }

    logStep("Verifying session", { sessionId });

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Retrieve the session
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    logStep("Session retrieved", { 
      status: session.payment_status,
      metadata: session.metadata 
    });

    if (session.payment_status !== 'paid') {
      return new Response(
        JSON.stringify({ verified: false, message: "Payment not completed" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Extract metadata
    const metadata = session.metadata || {};
    const campaignId = metadata.campaign_id;
    const campaignType = metadata.campaign_type;
    const donorId = metadata.donor_id !== 'guest' ? metadata.donor_id : null;
    const isMonthly = metadata.is_monthly === 'true';
    const isAnonymous = metadata.is_anonymous === 'true';
    const amount = session.amount_total! / 100; // Convert from cents
    const platformFee = parseFloat(metadata.platform_fee || '0');
    const netAmount = parseFloat(metadata.net_amount || '0');
    const donorName = metadata.donor_name || null;
    const message = metadata.message || null;

    logStep("Processing donation", {
      campaignId,
      campaignType,
      amount,
      isMonthly
    });

    // Initialize Supabase client with service role for writing
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Record the donation
    const { error: donationError } = await supabaseAdmin
      .from('campaign_donations')
      .insert({
        donor_id: donorId,
        donor_email: session.customer_details?.email || null,
        donor_name: donorName,
        campaign_id: campaignId,
        campaign_type: campaignType,
        amount: amount,
        platform_fee: platformFee,
        net_amount: netAmount,
        is_monthly: isMonthly,
        is_anonymous: isAnonymous,
        message: message,
        stripe_payment_id: session.payment_intent as string || null,
        status: 'completed',
      });

    if (donationError) {
      logStep("Error recording donation", { error: donationError });
      throw donationError;
    }

    logStep("Donation recorded successfully");

    // Update campaign amounts based on type
    const tableName = `${campaignType}_campaigns`;
    
    // Get current campaign
    const { data: campaign, error: fetchError } = await supabaseAdmin
      .from(tableName)
      .select('current_amount, monthly_donors_count, one_time_donors_count, supporters_count, sponsors_count')
      .eq('id', campaignId)
      .single();

    if (fetchError) {
      logStep("Error fetching campaign", { error: fetchError });
      throw fetchError;
    }

    // Update campaign
    const updateData: any = {
      current_amount: (campaign.current_amount || 0) + netAmount,
    };

    // Update supporter counts based on campaign type
    if (tableName === 'medical_campaigns') {
      if (isMonthly) {
        updateData.monthly_donors_count = (campaign.monthly_donors_count || 0) + 1;
      } else {
        updateData.one_time_donors_count = (campaign.one_time_donors_count || 0) + 1;
      }
    } else if (['dream_campaigns', 'hero_campaigns', 'pet_rescue_campaigns', 'student_campaigns', 'crisis_campaigns'].includes(tableName)) {
      updateData.supporters_count = (campaign.supporters_count || 0) + 1;
    } else if (tableName === 'talent_campaigns') {
      updateData.sponsors_count = (campaign.sponsors_count || 0) + 1;
    }

    const { error: updateError } = await supabaseAdmin
      .from(tableName)
      .update(updateData)
      .eq('id', campaignId);

    if (updateError) {
      logStep("Error updating campaign", { error: updateError });
      throw updateError;
    }

    logStep("Campaign updated successfully");

    return new Response(
      JSON.stringify({ 
        verified: true, 
        message: "Donation processed successfully",
        donation: {
          amount,
          netAmount,
          isMonthly,
        }
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
