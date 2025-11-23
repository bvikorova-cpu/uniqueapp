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
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user) throw new Error("User not authenticated");

    const { competitionId } = await req.json();

    // Get competition details
    const { data: competition, error: compError } = await supabaseClient
      .from("iq_competitions")
      .select("*")
      .eq("id", competitionId)
      .single();

    if (compError) throw compError;
    if (competition.status !== "active") {
      throw new Error("Competition is not active");
    }

    // Check if already joined
    const { data: existingEntry } = await supabaseClient
      .from("iq_competition_participants")
      .select("id")
      .eq("competition_id", competitionId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingEntry) {
      throw new Error("Already joined this competition");
    }

    // Count current participants
    const { count } = await supabaseClient
      .from("iq_competition_participants")
      .select("*", { count: "exact", head: true })
      .eq("competition_id", competitionId);

    if (count && count >= competition.max_participants) {
      throw new Error("Competition is full");
    }

    // Check user credits
    const { data: creditsData, error: creditsError } = await supabaseClient
      .from("iq_credits")
      .select("credits_remaining")
      .eq("user_id", user.id)
      .single();

    if (creditsError && creditsError.code !== "PGRST116") throw creditsError;

    const currentCredits = creditsData?.credits_remaining || 0;
    if (currentCredits < competition.entry_fee) {
      throw new Error("Insufficient credits");
    }

    // Join competition
    const { data: participation, error: participationError } = await supabaseClient
      .from("iq_competition_participants")
      .insert({
        competition_id: competitionId,
        user_id: user.id,
      })
      .select()
      .single();

    if (participationError) throw participationError;

    // Deduct entry fee
    if (creditsData) {
      await supabaseClient
        .from("iq_credits")
        .update({ credits_remaining: currentCredits - competition.entry_fee })
        .eq("user_id", user.id);
    } else {
      await supabaseClient
        .from("iq_credits")
        .insert({
          user_id: user.id,
          credits_remaining: -competition.entry_fee,
          total_credits_purchased: 0,
        });
    }

    return new Response(
      JSON.stringify({
        success: true,
        participation: participation,
        message: "Successfully joined competition!",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
