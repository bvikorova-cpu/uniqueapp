import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    // Check if already claimed today
    const today = new Date().toISOString().split('T')[0];
    const { data: existingClaim } = await supabaseClient
      .from("daily_rewards")
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
    const { data: lastClaim } = await supabaseClient
      .from("daily_rewards")
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
      const lastClaimDate = new Date(lastClaim.claimed_at).toISOString().split('T')[0];
      if (lastClaimDate === yesterdayStr) {
        newStreak = (lastClaim.day_streak || 0) + 1;
      }
    }

    const pointsEarned = 10;

    // Insert daily reward claim
    const { error: claimError } = await supabaseClient
      .from("daily_rewards")
      .insert({
        user_id: user.id,
        day_streak: newStreak,
        points_earned: pointsEarned
      });

    if (claimError) throw claimError;

    // Update user points
    const { data: userPoints } = await supabaseClient
      .from("user_points")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (userPoints) {
      const newTotal = (userPoints.total_points || 0) + pointsEarned;
      const newCurrentLevel = (userPoints.current_level_points || 0) + pointsEarned;
      
      const { error: updateError } = await supabaseClient
        .from("user_points")
        .update({
          total_points: newTotal,
          current_level_points: newCurrentLevel,
          updated_at: new Date().toISOString()
        })
        .eq("user_id", user.id);

      if (updateError) throw updateError;
    } else {
      // Create new user_points record
      const { error: insertError } = await supabaseClient
        .from("user_points")
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
