import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-HOLOGRAPHIC-ACCESS] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    logStep("Function started");

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.id) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id });

    const { serviceType } = await req.json();
    if (!serviceType) throw new Error("Service type is required");
    logStep("Checking access", { serviceType });

    // Check if user has active purchase
    const { data: purchases, error } = await supabaseClient
      .from("holographic_purchases")
      .select("*")
      .eq("user_id", user.id)
      .eq("service_type", serviceType)
      .eq("status", "active")
      .or("expires_at.is.null,expires_at.gt." + new Date().toISOString())
      .maybeSingle();

    if (error) {
      logStep("Database error", { error: error.message });
      throw error;
    }

    const hasAccess = !!purchases;
    logStep("Access check result", { hasAccess, purchase: purchases });

    return new Response(
      JSON.stringify({ 
        hasAccess,
        purchase: purchases,
        serviceType
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
