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
    const { userId } = await authenticateUser(req);
    const supabase = createSupabaseAdminClient();

    // UPSERT to prevent race condition
    await supabase
      .from("coloring_credits")
      .upsert(
        { user_id: userId, tier: "none", credits_remaining: 0 },
        { onConflict: "user_id", ignoreDuplicates: true }
      );

    const { data: credits, error } = await supabase
      .from("coloring_credits")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) throw error;

    // Check if subscription has expired
    if (credits.expires_at && new Date(credits.expires_at) < new Date() && credits.tier !== "none") {
      await supabase
        .from("coloring_credits")
        .update({ tier: "none", credits_remaining: 0, expires_at: null })
        .eq("user_id", userId);

      return new Response(JSON.stringify({ status: "expired", message: "Subscription has expired" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ status: "active", credits }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    log("ERROR", { message: error instanceof Error ? error.message : String(error) });
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
