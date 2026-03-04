import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { authenticateUser } from "../_shared/auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Autentifikuj usera pomocou spoločného helpera
    const { supabase: supabaseClient, user } = await authenticateUser(req);

    // Check if already claimed today
    const today = new Date().toISOString().split('T')[0];
    const { data: existingClaim } = await (supabaseClient
      .from("daily_rewards") as any)
      .select("*")
      .eq("user_id", user.id)
      .gte("claimed_at", `${today}T00:00:00`)
      .maybeSingle();

    if (existingClaim) {
      return new Response(
        JSON.stringify({ error: "Already claimed today" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get last claim to calculate streak
    const { data: lastClaim } = await (supabaseClient
      .from("daily_rewards") as any)
      .select("*")
      .eq("user_id", user.id)
      .order("claimed_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    let newStreak = 1;
    if (lastClaim) {
      const lastClaimDate = new Date((lastClaim as any).claimed_at).toISOString().split('T')[0];
      if (lastClaimDate === yesterdayStr) {
        newStreak = ((lastClaim as any).day_streak || 0) + 1;
      }
    }

    const pointsEarned = 10;

    // Insert daily reward claim
    const { error: claimError } = await (supabaseClient
      .from("daily_rewards") as any)
      .insert({
        user_id: user.id,
        day_streak: newStreak,
        points_earned: pointsEarned
      });

    if (claimError) throw claimError;

    // Update user points
    const { data: userPoints } = await (supabaseClient
      .from("user_points") as any)
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (userPoints) {
      const newTotal = ((userPoints as any).total_points || 0) + pointsEarned;
      const newCurrentLevel = ((userPoints as any).current_level_points || 0) + pointsEarned;
      
      const { error: updateError } = await (supabaseClient
        .from("user_points") as any)
        .update({
          total_points: newTotal,
          current_level_points: newCurrentLevel,
          updated_at: new Date().toISOString()
        })
        .eq("user_id", user.id);

      if (updateError) throw updateError;
    } else {
      // Create new user_points record
      const { error: insertError } = await (supabaseClient
        .from("user_points") as any)
        .insert({
          user_id: user.id,
          total_points: pointsEarned,
          current_level_points: pointsEarned,
          level: 1
        });

      if (insertError) throw insertError;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        pointsEarned,
        streak: newStreak
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error claiming daily reward:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
