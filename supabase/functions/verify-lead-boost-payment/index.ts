import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
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
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    
    if (!user) {
      throw new Error("User not authenticated");
    }

    const { sessionId, propertyId } = await req.json();
    
    if (!sessionId || !propertyId) {
      throw new Error("Session ID and Property ID are required");
    }

    console.log(`Verifying payment for session ${sessionId}, property ${propertyId}`);

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    console.log(`Session status: ${session.payment_status}`);

    if (session.payment_status !== "paid") {
      return new Response(
        JSON.stringify({ success: false, message: "Payment not completed" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // Find the purchase record
    const { data: purchase, error: findError } = await supabaseClient
      .from('property_lead_boost_purchases')
      .select('*')
      .eq('property_id', propertyId)
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (findError || !purchase) {
      console.error('Purchase not found:', findError);
      throw new Error("Purchase record not found");
    }

    // Update purchase status to processing
    const { error: updateError } = await supabaseClient
      .from('property_lead_boost_purchases')
      .update({ 
        status: 'processing',
        stripe_session_id: sessionId
      })
      .eq('id', purchase.id);

    if (updateError) throw updateError;

    console.log(`Starting lead boost campaign for purchase ${purchase.id}`);

    // Trigger the lead boost campaign
    const { error: campaignError } = await supabaseClient.functions.invoke(
      'process-lead-boost',
      {
        body: {
          propertyId,
          purchaseId: purchase.id
        }
      }
    );

    if (campaignError) {
      console.error('Campaign error:', campaignError);
      throw campaignError;
    }

    console.log('Lead boost campaign started successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Payment verified and campaign started"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Error verifying payment:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
