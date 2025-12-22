import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { authenticateUser, createSupabaseAdminClient } from "../_shared/supabaseClient.ts";
import { createLogger } from "../_shared/logger.ts";

const log = createLogger("check-psychology-subscription");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    log("Function started");
    const { userId } = await authenticateUser(req);
    log("User authenticated", { userId });

    const supabase = createSupabaseAdminClient();

    const { data: subData, error: subError } = await supabase
      .from('psychology_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (subError && subError.code !== 'PGRST116') {
      throw subError;
    }

    if (!subData) {
      const { error: insertError } = await supabase
        .from('psychology_subscriptions')
        .insert({ user_id: userId, free_messages_used: 0 });

      if (insertError) throw insertError;

      return new Response(JSON.stringify({
        subscribed: false,
        free_messages_used: 0,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const isSubscribed = subData.subscription_status === 'active' && 
                        new Date(subData.subscription_end) > new Date();

    return new Response(JSON.stringify({
      subscribed: isSubscribed,
      free_messages_used: subData.free_messages_used || 0,
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
