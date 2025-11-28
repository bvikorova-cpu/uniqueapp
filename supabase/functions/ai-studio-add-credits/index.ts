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
    
    if (!credits || typeof credits !== "number" || credits <= 0) {
      return new Response(
        JSON.stringify({ error: "Invalid credits amount" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get authenticated user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !userData.user) {
      return new Response(
        JSON.stringify({ error: "User not authenticated" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = userData.user.id;
    console.log(`Adding ${credits} credits to user ${userId}`);

    // Get existing credits or create new record
    const { data: existing, error: fetchError } = await supabaseClient
      .from("ai_studio_credits")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (fetchError) {
      throw new Error(`Failed to fetch credits: ${fetchError.message}`);
    }

    let result;
    if (existing) {
      // Update existing record
      const { data, error } = await supabaseClient
        .from("ai_studio_credits")
        .update({
          credits_remaining: existing.credits_remaining + credits,
          total_credits_purchased: existing.total_credits_purchased + credits,
          updated_at: new Date().toISOString()
        })
        .eq("user_id", userId)
        .select()
        .single();

      if (error) throw new Error(`Failed to update credits: ${error.message}`);
      result = data;
    } else {
      // Create new record
      const { data, error } = await supabaseClient
        .from("ai_studio_credits")
        .insert({
          user_id: userId,
          credits_remaining: credits,
          total_credits_purchased: credits
        })
        .select()
        .single();

      if (error) throw new Error(`Failed to create credits: ${error.message}`);
      result = data;
    }

    console.log(`Credits updated for user ${userId}:`, result);

    return new Response(
      JSON.stringify({ 
        success: true,
        creditsRemaining: result.credits_remaining,
        totalPurchased: result.total_credits_purchased
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in ai-studio-add-credits:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
