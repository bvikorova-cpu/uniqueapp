import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { verifyAndProcessPayment } from "../_shared/paymentVerification.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId } = await req.json();
    
    if (!sessionId) {
      return new Response(
        JSON.stringify({ error: 'Session ID required' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get authenticated user
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'User not authenticated' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[VERIFY-EMOTION-CREDITS-PAYMENT] Verifying session ${sessionId} for user ${user.id}`);

    // Use admin client for credit operations
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Verify payment and process credits with idempotency protection
    const result = await verifyAndProcessPayment(supabaseAdmin, sessionId, user.id);

    if (!result.success) {
      console.error(`[VERIFY-EMOTION-CREDITS-PAYMENT] Verification failed: ${result.error}`);
      return new Response(
        JSON.stringify({ error: result.error }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get updated credit balance
    const { data: creditsData } = await supabaseAdmin
      .from('emotion_credits')
      .select('credits_remaining')
      .eq('user_id', user.id)
      .single();

    console.log(`[VERIFY-EMOTION-CREDITS-PAYMENT] Success - credits: ${creditsData?.credits_remaining}`);

    return new Response(JSON.stringify({ 
      success: true,
      credits: creditsData?.credits_remaining || result.credits,
      credits_added: result.alreadyProcessed ? 0 : result.credits,
      alreadyProcessed: result.alreadyProcessed
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error('[VERIFY-EMOTION-CREDITS-PAYMENT] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
