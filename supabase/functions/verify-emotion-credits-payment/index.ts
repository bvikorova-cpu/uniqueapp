import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { credits } = await req.json();
    
    const creditsToAdd = parseInt(credits, 10);
    if (!creditsToAdd || creditsToAdd <= 0) {
      return new Response(JSON.stringify({ error: 'Invalid credits amount' }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get authenticated user
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Authorization required' }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    
    if (!user) {
      return new Response(JSON.stringify({ error: 'User not authenticated' }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`[VERIFY-EMOTION-CREDITS-PAYMENT] Adding ${creditsToAdd} credits for user ${user.id}`);

    // Use service role for update
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get current credits
    let { data: currentCredits } = await supabaseAdmin
      .from('emotion_credits')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (currentCredits) {
      // Update existing record
      const { error: updateError } = await supabaseAdmin
        .from('emotion_credits')
        .update({
          credits_remaining: currentCredits.credits_remaining + creditsToAdd,
          total_credits_purchased: currentCredits.total_credits_purchased + creditsToAdd,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (updateError) {
        console.error('[VERIFY-EMOTION-CREDITS-PAYMENT] Update error:', updateError);
        return new Response(JSON.stringify({ error: 'Failed to add credits' }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } else {
      // Create new record
      const { error: insertError } = await supabaseAdmin
        .from('emotion_credits')
        .insert({
          user_id: user.id,
          credits_remaining: creditsToAdd,
          total_credits_purchased: creditsToAdd
        });

      if (insertError) {
        console.error('[VERIFY-EMOTION-CREDITS-PAYMENT] Insert error:', insertError);
        return new Response(JSON.stringify({ error: 'Failed to create credits' }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    console.log(`[VERIFY-EMOTION-CREDITS-PAYMENT] Successfully added ${creditsToAdd} credits`);

    return new Response(JSON.stringify({ 
      success: true,
      credits_added: creditsToAdd
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
