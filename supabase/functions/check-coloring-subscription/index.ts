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
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Authorization required" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    
    if (!user?.email) {
      throw new Error("User not authenticated");
    }

    console.log("Checking coloring subscription for user:", user.id);

    // Get current credits
    const { data: credits, error: creditsError } = await supabaseClient
      .from("coloring_credits")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (creditsError) {
      console.error("Error fetching credits:", creditsError);
      throw creditsError;
    }

    // Check if subscription has expired
    if (credits && credits.expires_at) {
      const expiryDate = new Date(credits.expires_at);
      const now = new Date();
      
      if (expiryDate < now && credits.tier !== 'none') {
        // Subscription expired, reset to none
        await supabaseClient
          .from("coloring_credits")
          .update({ 
            tier: 'none',
            credits_remaining: 0,
            expires_at: null
          })
          .eq("user_id", user.id);
          
        return new Response(
          JSON.stringify({ 
            status: "expired",
            message: "Subscription has expired"
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
        );
      }
    }

    return new Response(
      JSON.stringify({ 
        status: "active",
        credits: credits || { tier: 'none', credits_remaining: 0 }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error) {
    console.error("Error in check-coloring-subscription:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to check subscription";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
