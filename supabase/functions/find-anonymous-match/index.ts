import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MATCH_COST = 5; // Credits to start a match

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError || !user) {
      throw new Error("User not authenticated");
    }

    // Check credits
    const { data: creditsData } = await supabaseClient
      .from("anonymous_dating_credits")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (!creditsData || creditsData.credits_remaining < MATCH_COST) {
      return new Response(
        JSON.stringify({ error: "Insufficient credits", required: MATCH_COST }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // Get user profile
    const { data: userProfile } = await supabaseClient
      .from("anonymous_dating_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (!userProfile) {
      return new Response(
        JSON.stringify({ error: "Profile not found. Please create a profile first." }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // Find potential matches (users not already matched with)
    const { data: existingMatches } = await supabaseClient
      .from("anonymous_dating_matches")
      .select("user1_id, user2_id")
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

    const matchedUserIds = existingMatches?.flatMap(m => 
      [m.user1_id, m.user2_id].filter(id => id !== user.id)
    ) || [];

    // Find compatible profile
    let query = supabaseClient
      .from("anonymous_dating_profiles")
      .select("*")
      .eq("is_active", true)
      .neq("user_id", user.id);

    if (matchedUserIds.length > 0) {
      query = query.not("user_id", "in", `(${matchedUserIds.join(",")})`);
    }

    const { data: potentialMatches } = await query.limit(10);

    if (!potentialMatches || potentialMatches.length === 0) {
      return new Response(
        JSON.stringify({ error: "No compatible matches found at the moment. Try again later!" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 404,
        }
      );
    }

    // Randomly select a match
    const matchedProfile = potentialMatches[Math.floor(Math.random() * potentialMatches.length)];

    // Create match
    const { data: newMatch, error: matchError } = await supabaseClient
      .from("anonymous_dating_matches")
      .insert({
        user1_id: user.id,
        user2_id: matchedProfile.user_id,
        status: "active",
        match_interests: {
          common: userProfile.interests?.filter((i: string) => 
            matchedProfile.interests?.includes(i)
          ) || []
        }
      })
      .select()
      .single();

    if (matchError) throw matchError;

    // Deduct credits
    await supabaseClient
      .from("anonymous_dating_credits")
      .update({ 
        credits_remaining: creditsData.credits_remaining - MATCH_COST 
      })
      .eq("user_id", user.id);

    return new Response(
      JSON.stringify({ 
        match: newMatch,
        partner: {
          anonymous_name: matchedProfile.anonymous_name,
          age_range: matchedProfile.age_range,
          interests: matchedProfile.interests,
          personality_traits: matchedProfile.personality_traits
        }
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});