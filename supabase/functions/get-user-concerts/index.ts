import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
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

    // Get available concerts
    const { data: concerts, error: concertsError } = await supabaseClient
      .from("holographic_concerts")
      .select("*")
      .order("concert_date", { ascending: true });

    if (concertsError) throw concertsError;

    // Get user tickets
    const { data: tickets, error: ticketsError } = await supabaseClient
      .from("concert_tickets")
      .select(`
        *,
        concert:concert_id(*)
      `)
      .eq("user_id", user.id);

    if (ticketsError) throw ticketsError;

    // Get user recordings
    const { data: recordings, error: recordingsError } = await supabaseClient
      .from("concert_recordings")
      .select(`
        *,
        concert:concert_id(*)
      `)
      .eq("user_id", user.id);

    if (recordingsError) throw recordingsError;

    // Get user dedications
    const { data: dedications, error: dedicationsError } = await supabaseClient
      .from("ai_dedications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (dedicationsError) throw dedicationsError;

    // Get meet & greet sessions
    const { data: meetGreets, error: meetGreetsError } = await supabaseClient
      .from("meet_greet_sessions")
      .select("*")
      .eq("user_id", user.id)
      .order("scheduled_at", { ascending: true });

    if (meetGreetsError) throw meetGreetsError;

    // Get merch orders
    const { data: merchOrders, error: merchError } = await supabaseClient
      .from("merch_orders")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (merchError) throw merchError;

    return new Response(
      JSON.stringify({
        success: true,
        concerts: concerts || [],
        tickets: tickets || [],
        recordings: recordings || [],
        dedications: dedications || [],
        meetGreets: meetGreets || [],
        merchOrders: merchOrders || [],
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in get-user-concerts:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
