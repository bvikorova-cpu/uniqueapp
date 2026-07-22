import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = { "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version" };

const DAILY_FREE_VOTES = 1;
const CREDITS_PER_VOTE = 2;
const STREAK_BONUS_CREDITS = 20;
const STREAK_BONUS_DAYS = 7;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    // Create client with user's auth header so RLS works correctly
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user) throw new Error("User not authenticated");

    const { brandId } = await req.json();
    if (!brandId) throw new Error("Brand ID is required");

    // Get or create today's vote tracking
    const today = new Date().toISOString().split('T')[0];
    let { data: voteTracking } = await supabaseClient
      .from("user_daily_votes")
      .select("*")
      .eq("user_id", user.id)
      .eq("date", today)
      .single();

    if (!voteTracking) {
      const { data: newTracking, error } = await supabaseClient
        .from("user_daily_votes")
        .insert({ user_id: user.id,
          date: today,
          votes_used: 0,
          votes_purchased: 0,
          credits_earned: 0 })
        .select()
        .single();
      
      if (error) throw error;
      voteTracking = newTracking;
    }

    // Check if user has votes remaining
    const totalVotes = DAILY_FREE_VOTES + (voteTracking?.votes_purchased || 0);
    const votesRemaining = totalVotes - (voteTracking?.votes_used || 0);

    if (votesRemaining <= 0) {
      return new Response(JSON.stringify({ 
        error: "No votes remaining today",
        votesRemaining: 0
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400 });
    }

    // Record vote (allow multiple votes for same brand)
    const { error: voteError } = await supabaseClient
      .from("brand_votes")
      .insert({ user_id: user.id,
        brand_id: brandId,
        vote_date: today });

    if (voteError) throw voteError;

    // Update votes used and credits earned
    const newCreditsEarned = (voteTracking.credits_earned || 0) + CREDITS_PER_VOTE;
    const { error: updateError } = await supabaseClient
      .from("user_daily_votes")
      .update({ votes_used: (voteTracking.votes_used || 0) + 1,
        credits_earned: newCreditsEarned })
      .eq("user_id", user.id)
      .eq("date", today);

    if (updateError) throw updateError;

    // Update voting streak
    let streakData = await updateVotingStreak(supabaseClient, user.id, today);
    
    // Update brand_battle_credits
    await updateUserCredits(supabaseClient, user.id, CREDITS_PER_VOTE, streakData.streakBonusAwarded ? STREAK_BONUS_CREDITS : 0);

    return new Response(JSON.stringify({ success: true,
      votesRemaining: votesRemaining - 1,
      creditsEarned: CREDITS_PER_VOTE,
      currentStreak: streakData.currentStreak,
      streakBonusAwarded: streakData.streakBonusAwarded,
      totalCreditsEarned: streakData.streakBonusAwarded 
        ? CREDITS_PER_VOTE + STREAK_BONUS_CREDITS 
        : CREDITS_PER_VOTE }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200 });
  } catch (error: any) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500 });
  }
});

async function updateVotingStreak(supabaseClient: any, userId: string, today: string) {
  let streakBonusAwarded = false;
  
  // Get or create streak record
  let { data: streak } = await supabaseClient
    .from("voting_streaks")
    .select("*")
    .eq("user_id", userId)
    .single();

  const todayDate = new Date(today);
  
  if (!streak) {
    // Create new streak record
    const { data: newStreak, error } = await supabaseClient
      .from("voting_streaks")
      .insert({ user_id: userId,
        current_streak: 1,
        longest_streak: 1,
        last_vote_date: today,
        total_votes_cast: 1,
        credits_earned: CREDITS_PER_VOTE })
      .select()
      .single();
    
    if (error) {
      console.error("Error creating streak:", error);
    }
    return { currentStreak: 1, streakBonusAwarded: false };
  }

  // Check if already voted today
  if (streak.last_vote_date === today) { // Already voted today, just increment total votes
    await supabaseClient
      .from("voting_streaks")
      .update({
        total_votes_cast: streak.total_votes_cast + 1,
        credits_earned: streak.credits_earned + CREDITS_PER_VOTE })
      .eq("user_id", userId);
    
    return { currentStreak: streak.current_streak, streakBonusAwarded: false };
  }

  // Check if streak continues (voted yesterday)
  const lastVoteDate = new Date(streak.last_vote_date);
  const daysSinceLastVote = Math.floor((todayDate.getTime() - lastVoteDate.getTime()) / (1000 * 60 * 60 * 24));

  let newStreak = 1;
  if (daysSinceLastVote === 1) {
    // Streak continues
    newStreak = streak.current_streak + 1;
    
    // Check if streak bonus should be awarded (every 7 days)
    if (newStreak > 0 && newStreak % STREAK_BONUS_DAYS === 0) {
      // Check if bonus was already claimed for this streak milestone
      const lastBonusClaimed = streak.streak_bonus_claimed_at 
        ? new Date(streak.streak_bonus_claimed_at) 
        : null;
      
      // Award bonus if not claimed in the last week
      if (!lastBonusClaimed || daysSinceLastVote >= STREAK_BONUS_DAYS) {
        streakBonusAwarded = true;
      }
    }
  }

  const longestStreak = Math.max(streak.longest_streak, newStreak);

  // Update streak record
  const updateData: any = { current_streak: newStreak,
    longest_streak: longestStreak,
    last_vote_date: today,
    total_votes_cast: streak.total_votes_cast + 1,
    credits_earned: streak.credits_earned + CREDITS_PER_VOTE + (streakBonusAwarded ? STREAK_BONUS_CREDITS : 0) };

  if (streakBonusAwarded) {
    updateData.streak_bonus_claimed_at = new Date().toISOString();
  }

  await supabaseClient
    .from("voting_streaks")
    .update(updateData)
    .eq("user_id", userId);

  return { currentStreak: newStreak, streakBonusAwarded };
}

async function updateUserCredits(supabaseClient: any, userId: string, voteCredits: number, bonusCredits: number) {
  const totalCredits = voteCredits + bonusCredits;
  
  // Get or create credits record
  let { data: credits } = await supabaseClient
    .from("brand_battle_credits")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (!credits) { // Create new credits record
    await supabaseClient
      .from("brand_battle_credits")
      .insert({
        user_id: userId,
        credits_balance: totalCredits,
        total_credits_earned: totalCredits,
        total_credits_spent: 0 });
  } else { // Update existing credits
    await supabaseClient
      .from("brand_battle_credits")
      .update({
        credits_balance: credits.credits_balance + totalCredits,
        total_credits_earned: credits.total_credits_earned + totalCredits })
      .eq("user_id", userId);
  }
}
