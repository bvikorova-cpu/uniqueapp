import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-TIME-CAPSULE-ACCESS] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const authHeader = req.headers.get("Authorization")!;
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    { global: { headers: { Authorization: authHeader } } }
  );

  try {
    logStep("Function started");

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.id) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id });

    // Get all active time capsule purchases for the user
    const { data: purchases, error } = await supabaseClient
      .from("time_capsule_purchases")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active")
      .or("expires_at.is.null,expires_at.gt." + new Date().toISOString());

    if (error) {
      logStep("Database error", { error: error.message });
      throw error;
    }

    logStep("Access check result", { purchaseCount: purchases?.length || 0 });

    // Map purchases to their service types for easy checking
    const activeServices = purchases?.map(p => p.service_type) || [];
    const hasPremium = activeServices.includes("premium_subscription");

    return new Response(
      JSON.stringify({ 
        hasAccess: purchases && purchases.length > 0,
        purchases: purchases || [],
        activeServices,
        hasPremium,
        canCreateCapsules: hasPremium || purchases?.some(p => p.duration_years) || false
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    logStep("ERROR", { message: error instanceof Error ? error.message : "Unknown error" });
    return new Response(
      JSON.stringify({ 
        hasAccess: false,
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
