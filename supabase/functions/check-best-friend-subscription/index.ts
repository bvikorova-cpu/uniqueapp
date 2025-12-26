import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { authenticateUser, createSupabaseAdminClient } from "../_shared/supabaseClient.ts";
import { createLogger } from "../_shared/logger.ts";

const log = createLogger("check-best-friend-subscription");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    log("Function started");
    const { userId } = await authenticateUser(req);
    const supabase = createSupabaseAdminClient();

    // UPSERT to prevent race condition - creates record if not exists
    await supabase
      .from("best_friend_subscriptions")
      .upsert(
        { user_id: userId, free_messages_used: 0, monthly_messages_used: 0, monthly_messages_reset_at: new Date().toISOString() },
        { onConflict: "user_id", ignoreDuplicates: true }
      );

    const { data: subData, error } = await supabase
      .from("best_friend_subscriptions")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) throw error;

    const isSubscribed = subData.subscription_status === "active" && 
                        new Date(subData.subscription_end) > new Date();

    return new Response(JSON.stringify({
      subscribed: isSubscribed,
      free_messages_used: subData.free_messages_used || 0,
      monthly_messages_used: subData.monthly_messages_used || 0,
      bonus_messages: subData.bonus_messages || 0,
    }), {
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
