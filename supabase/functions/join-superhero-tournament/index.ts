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

    if (!user) throw new Error("Not authenticated");

    const { tournamentId, heroId } = await req.json();

    if (!tournamentId || !heroId) {
      throw new Error("Tournament ID and Hero ID are required");
    }

    // Check age verification
    const { data: ageCheck } = await supabaseClient
      .from('superhero_age_verification')
      .select('is_verified')
      .eq('user_id', user.id)
      .single();

    if (!ageCheck?.is_verified) {
      return new Response(
        JSON.stringify({ error: "Age verification required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 403 }
      );
    }

    // Get tournament details
    const { data: tournament, error: tournamentError } = await supabaseClient
      .from('superhero_tournaments')
      .select('*')
      .eq('id', tournamentId)
      .single();

    if (tournamentError || !tournament) throw new Error("Tournament not found");

    if (tournament.status !== 'registration') {
      throw new Error("Tournament registration is closed");
    }

    if (tournament.current_teams >= tournament.max_teams) {
      throw new Error("Tournament is full");
    }

    // Verify hero ownership
    const { data: hero, error: heroError } = await supabaseClient
      .from('superhero_heroes')
      .select('*')
      .eq('id', heroId)
      .eq('user_id', user.id)
      .single();

    if (heroError || !hero) throw new Error("Hero not found or not owned by user");

    // Check if already registered
    const { count } = await supabaseClient
      .from('superhero_tournament_participants')
      .select('*', { count: 'exact', head: true })
      .eq('tournament_id', tournamentId)
      .eq('hero_id', heroId);

    if (count && count > 0) {
      throw new Error("Hero already registered for this tournament");
    }

    // Check user credits
    const { data: credits } = await supabaseClient
      .from('superhero_credits')
      .select('credits, total_spent')
      .eq('user_id', user.id)
      .single();

    if (!credits || credits.credits < tournament.entry_fee) {
      throw new Error("Insufficient credits");
    }

    // Deduct entry fee
    const { error: creditError } = await supabaseClient
      .from('superhero_credits')
      .update({
        credits: credits.credits - tournament.entry_fee,
        total_spent: (credits.total_spent || 0) + tournament.entry_fee,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    if (creditError) throw creditError;

    // Register for tournament
    const { error: registerError } = await supabaseClient
      .from('superhero_tournament_participants')
      .insert({
        tournament_id: tournamentId,
        hero_id: heroId,
        user_id: user.id
      });

    if (registerError) throw registerError;

    // Update tournament participant count
    const { error: updateError } = await supabaseClient
      .from('superhero_tournaments')
      .update({
        current_teams: tournament.current_teams + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', tournamentId);

    if (updateError) throw updateError;

    console.log(`${hero.name} registered for tournament: ${tournament.name}`);

    return new Response(
      JSON.stringify({ success: true, message: "Successfully registered for tournament" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error: any) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error?.message || "Unknown error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
