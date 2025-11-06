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

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    console.log("Starting job listings expiration check...");

    // Find all active job listings with expired payments
    const { data: expiredPayments, error: paymentsError } = await supabaseClient
      .from("job_listing_payments")
      .select("job_id, expires_at")
      .eq("status", "completed")
      .lt("expires_at", new Date().toISOString());

    if (paymentsError) {
      console.error("Error fetching expired payments:", paymentsError);
      throw paymentsError;
    }

    if (!expiredPayments || expiredPayments.length === 0) {
      console.log("No expired job listings found");
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "No expired job listings found",
          expired_count: 0
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    const jobIds = expiredPayments.map(p => p.job_id).filter(Boolean);
    console.log(`Found ${jobIds.length} expired job listings:`, jobIds);

    // Deactivate expired job listings
    const { error: updateError } = await supabaseClient
      .from("job_listings")
      .update({ is_active: false })
      .in("id", jobIds)
      .eq("is_active", true);

    if (updateError) {
      console.error("Error deactivating job listings:", updateError);
      throw updateError;
    }

    console.log(`Successfully deactivated ${jobIds.length} job listings`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Deactivated ${jobIds.length} expired job listings`,
        expired_count: jobIds.length,
        job_ids: jobIds
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Expire job listings error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        success: false
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
