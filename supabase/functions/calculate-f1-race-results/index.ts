import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = { "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version" };

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { raceId } = await req.json();
    if (!raceId) throw new Error("Race ID is required");

    console.log("Calculating F1 race results for race:", raceId);

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get race details and participants
    const { data: race, error: raceError } = await supabaseAdmin
      .from("f1_races")
      .select(`
        *,
        f1_race_participants(
          id,
          car_id,
          user_id,
          strategy,
          f1_cars(
            id,
            name,
            engine_stat,
            aero_stat,
            tires_stat,
            handling_stat,
            level
          )
        )
      `)
      .eq("id", raceId)
      .single();

    if (raceError) throw raceError;

    const participants = race.f1_race_participants;
    if (participants.length === 0) {
      throw new Error("No participants in race");
    }

    console.log(`Processing ${participants.length} participants`);

    // Calculate race performance for each participant
    const results = participants.map((p: any) => {
      const car = p.f1_cars;
      const strategy = p.strategy || "balanced";

      let performance = 0;

      // Strategy modifiers
      const strategyBonus: Record<string, { engine: number; aero: number; tires: number; handling: number }> = {
        aggressive: { engine: 1.3, aero: 1.1, tires: 0.8, handling: 0.9 },
        balanced: { engine: 1.0, aero: 1.0, tires: 1.0, handling: 1.0 },
        conservative: { engine: 0.9, aero: 0.9, tires: 1.3, handling: 1.1 } };

      const bonus = strategyBonus[strategy] || strategyBonus.balanced;

      // Calculate performance based on stats and strategy
      performance += (car.engine_stat || 50) * bonus.engine;
      performance += (car.aero_stat || 50) * bonus.aero;
      performance += (car.tires_stat || 50) * bonus.tires;
      performance += (car.handling_stat || 50) * bonus.handling;

      // Add level bonus
      performance += (car.level || 1) * 10;

      // Add randomness (±15%)
      const randomFactor = 0.85 + Math.random() * 0.3;
      performance *= randomFactor;

      // Weather and track condition effects
      if (race.weather === "rainy" && strategy === "conservative") {
        performance *= 1.15;
      }
      if (race.track_condition === "wet" && car.handling_stat > 70) {
        performance *= 1.1;
      }

      return { participantId: p.id,
        carId: p.car_id,
        userId: p.user_id,
        carName: car.name,
        performance };
    });

    // Sort by performance (highest first)
    results.sort((a: any, b: any) => b.performance - a.performance);

    // Calculate prizes
    const totalPrize = race.entry_fee_coins * participants.length;
    const prizeDistribution = [0.5, 0.3, 0.2]; // 50%, 30%, 20%

    console.log(`Total prize pool: ${totalPrize} coins`);

    // Update participants with positions and prizes
    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      const position = i + 1;
      const prize = i < 3 ? Math.floor(totalPrize * prizeDistribution[i]) : 0;

      // Update participant
      await supabaseAdmin
        .from("f1_race_participants")
        .update({
          position,
          finish_time: (60 + i * 3) * 1000, // Mock finish time in ms
        })
        .eq("id", result.participantId);

      // Update car stats (win/race count)
      const { data: car } = await supabaseAdmin
        .from("f1_cars")
        .select("total_races, total_wins")
        .eq("id", result.carId)
        .single();

      if (car) { await supabaseAdmin
          .from("f1_cars")
          .update({
            total_races: (car.total_races || 0) + 1,
            total_wins: position === 1 ? (car.total_wins || 0) + 1 : car.total_wins })
          .eq("id", result.carId);
      }

      // Award prize to winner
      if (prize > 0) {
        const { data: currency } = await supabaseAdmin
          .from("f1_currency")
          .select("coins")
          .eq("user_id", result.userId)
          .single();

        if (currency) { await supabaseAdmin
            .from("f1_currency")
            .update({
              coins: currency.coins + prize })
            .eq("user_id", result.userId);
          
          console.log(`Awarded ${prize} coins to user ${result.userId}`);
        }
      }
    }

    // Update race status to completed
    await supabaseAdmin
      .from("f1_races")
      .update({ status: "completed" })
      .eq("id", raceId);

    console.log("Race results calculated successfully");

    return new Response(
      JSON.stringify({ success: true,
        results: results.map((r: any, i: number) => ({
          position: i + 1,
          carName: r.carName,
          userId: r.userId,
          prize: i < 3 ? Math.floor(totalPrize * prizeDistribution[i]) : 0 })) }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 }
    );
  } catch (error) {
    console.error("F1 Race calculation error:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 }
    );
  }
});
