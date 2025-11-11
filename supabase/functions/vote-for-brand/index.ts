import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DAILY_FREE_VOTES = 5;

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
        .insert({
          user_id: user.id,
          date: today,
          votes_used: 0,
          votes_purchased: 0,
        })
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
        status: 400,
      });
    }

    // Check if user already voted for this brand today
    const { data: existingVote } = await supabaseClient
      .from("brand_votes")
      .select("*")
      .eq("user_id", user.id)
      .eq("brand_id", brandId)
      .eq("vote_date", today)
      .single();

    if (existingVote) {
      return new Response(JSON.stringify({ 
        error: "Already voted for this brand today",
        votesRemaining: votesRemaining
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Record vote
    const { error: voteError } = await supabaseClient
      .from("brand_votes")
      .insert({
        user_id: user.id,
        brand_id: brandId,
        vote_date: today,
      });

    if (voteError) throw voteError;

    // Update votes used
    const { error: updateError } = await supabaseClient
      .from("user_daily_votes")
      .update({
        votes_used: (voteTracking.votes_used || 0) + 1,
      })
      .eq("user_id", user.id)
      .eq("date", today);

    if (updateError) throw updateError;

    return new Response(JSON.stringify({ 
      success: true,
      votesRemaining: votesRemaining - 1
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});