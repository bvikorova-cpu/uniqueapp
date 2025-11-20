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

  try {
    const { raceId } = await req.json();
    if (!raceId) throw new Error("Race ID is required");

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get race details and participants
    const { data: race, error: raceError } = await supabaseAdmin
      .from("races")
      .select(`
        *,
        race_participants(
          id,
          horse_id,
          user_id,
          strategy,
          horses(
            id,
            name,
            speed_stat,
            stamina_stat,
            acceleration_stat,
            temperament_stat,
            level
          )
        )
      `)
      .eq("id", raceId)
      .single();

    if (raceError) throw raceError;

    const participants = race.race_participants;
    if (participants.length === 0) {
      throw new Error("No participants in race");
    }

    // Calculate race performance for each participant
    const results = participants.map((p: any) => {
      const horse = p.horses;
      const strategy = p.strategy || "balanced";

      // Base performance calculation
      let performance = 0;

      // Strategy modifiers
      const strategyBonus: Record<string, { speed: number; stamina: number; acceleration: number }> = {
        aggressive: { speed: 1.3, stamina: 0.7, acceleration: 1.2 },
        balanced: { speed: 1.0, stamina: 1.0, acceleration: 1.0 },
        conservative: { speed: 0.8, stamina: 1.3, acceleration: 0.9 },
      };

      const bonus = strategyBonus[strategy] || strategyBonus.balanced;

      // Calculate performance based on stats and strategy
      performance += (horse.speed_stat || 50) * bonus.speed;
      performance += (horse.stamina_stat || 50) * bonus.stamina;
      performance += (horse.acceleration_stat || 50) * bonus.acceleration;
      performance += (horse.temperament_stat || 50) * 0.5;

      // Add level bonus
      performance += (horse.level || 1) * 10;

      // Add randomness (±10%)
      const randomFactor = 0.9 + Math.random() * 0.2;
      performance *= randomFactor;

      // Weather and track condition effects
      if (race.weather === "rainy" && strategy === "conservative") {
        performance *= 1.1;
      }
      if (race.track_condition === "muddy" && horse.stamina_stat > 70) {
        performance *= 1.15;
      }

      return {
        participantId: p.id,
        horseId: p.horse_id,
        userId: p.user_id,
        horseName: horse.name,
        performance,
      };
    });

    // Sort by performance (highest first)
    results.sort((a: any, b: any) => b.performance - a.performance);

    // Calculate prizes
    const totalPrize = race.entry_fee_coins * participants.length;
    const prizeDistribution = [0.5, 0.3, 0.2]; // 50%, 30%, 20%

    // Update participants with positions and prizes
    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      const position = i + 1;
      const prize = i < 3 ? Math.floor(totalPrize * prizeDistribution[i]) : 0;

      // Update participant
      await supabaseAdmin
        .from("race_participants")
        .update({
          position,
          finish_time: (100 + i * 2) * 1000, // Mock finish time in ms
        })
        .eq("id", result.participantId);

      // Update horse stats (win/race count)
      const { data: horse } = await supabaseAdmin
        .from("horses")
        .select("total_races, total_wins")
        .eq("id", result.horseId)
        .single();

      if (horse) {
        await supabaseAdmin
          .from("horses")
          .update({
            total_races: (horse.total_races || 0) + 1,
            total_wins: position === 1 ? (horse.total_wins || 0) + 1 : horse.total_wins,
          })
          .eq("id", result.horseId);
      }

      // Award prize to winner
      if (prize > 0) {
        const { data: currency } = await supabaseAdmin
          .from("horse_currency")
          .select("coins")
          .eq("user_id", result.userId)
          .single();

        if (currency) {
          await supabaseAdmin
            .from("horse_currency")
            .update({
              coins: currency.coins + prize,
            })
            .eq("user_id", result.userId);
        }
      }
    }

    // Update race status to completed
    await supabaseAdmin
      .from("races")
      .update({ status: "completed" })
      .eq("id", raceId);

    return new Response(
      JSON.stringify({
        success: true,
        results: results.map((r: any, i: number) => ({
          position: i + 1,
          horseName: r.horseName,
          userId: r.userId,
          prize: i < 3 ? Math.floor(totalPrize * prizeDistribution[i]) : 0,
        })),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Race calculation error:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
