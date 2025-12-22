import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { authenticateUser, createSupabaseAdminClient } from "../_shared/supabaseClient.ts";
import { createLogger } from "../_shared/logger.ts";

const log = createLogger("check-coloring-subscription");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    log("Function started");
    const { userId } = await authenticateUser(req);
    log("User authenticated", { userId });

    const supabase = createSupabaseAdminClient();

    // Get current credits
    const { data: credits, error: creditsError } = await supabase
      .from("coloring_credits")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (creditsError) {
      log("Error fetching credits", { error: creditsError });
      throw creditsError;
    }

    // Check if subscription has expired
    if (credits && credits.expires_at) {
      const expiryDate = new Date(credits.expires_at);
      const now = new Date();
      
      if (expiryDate < now && credits.tier !== "none") {
        // Subscription expired, reset to none
        await supabase
          .from("coloring_credits")
          .update({ 
            tier: "none",
            credits_remaining: 0,
            expires_at: null
          })
          .eq("user_id", userId);
          
        log("Subscription expired, reset tier");
        return new Response(JSON.stringify({ 
          status: "expired",
          message: "Subscription has expired"
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    log("Subscription active or none");
    return new Response(JSON.stringify({ 
      status: "active",
      credits: credits || { tier: "none", credits_remaining: 0 }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    log("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
