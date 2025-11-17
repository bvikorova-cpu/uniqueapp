import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser(authHeader.replace("Bearer ", ""));
    if (userError || !user) throw new Error("Unauthorized");

    const { artistName, scheduledAt } = await req.json();

    // Create meet & greet session
    const { data: session, error: sessionError } = await supabaseClient
      .from("meet_greet_sessions")
      .insert({
        user_id: user.id,
        artist_name: artistName,
        scheduled_at: scheduledAt,
        duration_minutes: 15,
        session_type: "vip",
        status: "scheduled",
        meeting_url: `https://holographic-meet.example.com/${crypto.randomUUID()}`,
      })
      .select()
      .single();

    if (sessionError) throw sessionError;

    return new Response(
      JSON.stringify({ success: true, session }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in book-meet-greet:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
