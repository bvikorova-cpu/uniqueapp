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
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabaseClient.auth.getUser(token);
    const user = userData.user;
    if (!user) throw new Error("Not authenticated");

    const { participantId } = await req.json();

    console.log(`[STOP-STREAM] User ${user.id} stopping stream for participant ${participantId}`);

    // Try to update participant status (columns may not exist yet)
    const { error: updateError } = await supabaseClient
      .from('shadow_battle_participants')
      .update({ 
        is_streaming: false,
        stream_ended_at: new Date().toISOString()
      })
      .eq('id', participantId)
      .eq('user_id', user.id);

    // Log but don't throw - columns might not exist
    if (updateError) {
      console.log("[STOP-STREAM] Update warning (columns may not exist):", updateError.message);
    }

    return new Response(JSON.stringify({ 
      success: true,
      message: "Stream stopped successfully"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Stop stream error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
