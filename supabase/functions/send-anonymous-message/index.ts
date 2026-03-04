import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MESSAGE_COSTS = {
  text: 1,
  voice: 3,
  hint: 5,
  gift: 10,
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
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error("User not authenticated");
    }

    const { matchId, content, messageType = "text", voiceUrl } = await req.json();

    const cost = MESSAGE_COSTS[messageType as keyof typeof MESSAGE_COSTS] || 1;

    // Check credits
    const { data: creditsData } = await supabaseClient
      .from("anonymous_dating_credits")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (!creditsData || creditsData.credits_remaining < cost) {
      return new Response(
        JSON.stringify({ error: "Insufficient credits", required: cost }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // Verify match exists and is active
    const { data: match } = await supabaseClient
      .from("anonymous_dating_matches")
      .select("*")
      .eq("id", matchId)
      .single();

    if (!match) {
      throw new Error("Match not found");
    }

    if (match.status !== "active") {
      throw new Error("Match is no longer active");
    }

    if (match.user1_id !== user.id && match.user2_id !== user.id) {
      throw new Error("Unauthorized");
    }

    // Check if match expired
    if (new Date(match.expires_at) < new Date() && match.status === "active") {
      await supabaseClient
        .from("anonymous_dating_matches")
        .update({ status: "expired" })
        .eq("id", matchId);
      
      throw new Error("Match has expired after 7 days");
    }

    // Send message
    const { data: message, error: messageError } = await supabaseClient
      .from("anonymous_dating_messages")
      .insert({
        match_id: matchId,
        sender_id: user.id,
        message_type: messageType,
        content,
        voice_url: voiceUrl,
      })
      .select()
      .single();

    if (messageError) throw messageError;

    // Deduct credits
    await supabaseClient
      .from("anonymous_dating_credits")
      .update({ 
        credits_remaining: creditsData.credits_remaining - cost 
      })
      .eq("user_id", user.id);

    return new Response(
      JSON.stringify({ message, creditsUsed: cost }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});