import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MATCH_COST = 5; // Credits to start a match

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization header" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "User not authenticated" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    // Optional filters from client + mode (preview | match)
    let filters: {
      location?: string;
      preferred_gender?: string;
      relationship_goal?: string;
      languages?: string[];
      min_shared_interests?: number;
    } = {};
    let mode: "preview" | "match" = "match";
    let targetUserId: string | undefined;
    if (req.method === "POST") {
      try {
        const body = await req.json();
        filters = body?.filters ?? {};
        if (body?.mode === "preview") mode = "preview";
        if (typeof body?.targetUserId === "string") targetUserId = body.targetUserId;
      } catch {
        // no body
      }
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
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
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
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Already-matched users
    const { data: existingMatches } = await supabaseClient
      .from("anonymous_dating_matches")
      .select("user1_id, user2_id")
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

    const matchedUserIds = existingMatches?.flatMap(m =>
      [m.user1_id, m.user2_id].filter(id => id !== user.id)
    ) || [];

    // Build query with filters
    let query = supabaseClient
      .from("anonymous_dating_profiles")
      .select("*")
      .eq("is_active", true)
      .neq("user_id", user.id);

    if (matchedUserIds.length > 0) {
      query = query.not("user_id", "in", `(${matchedUserIds.join(",")})`);
    }

    const wantedLocation = filters.location || userProfile.location;
    if (wantedLocation) query = query.ilike("location", `%${wantedLocation}%`);

    const wantedGender = filters.preferred_gender || userProfile.preferred_gender;
    if (wantedGender && wantedGender !== "Any") query = query.eq("gender", wantedGender);

    const wantedGoal = filters.relationship_goal || userProfile.relationship_goal;
    if (wantedGoal) query = query.eq("relationship_goal", wantedGoal);

    const wantedLanguages = filters.languages || userProfile.languages;
    if (wantedLanguages && wantedLanguages.length > 0) {
      query = query.overlaps("languages", wantedLanguages);
    }

    let { data: potentialMatches } = await query.limit(20);

    // Fallback: relax filters if nothing matches
    if (!potentialMatches || potentialMatches.length === 0) {
      let fb = supabaseClient
        .from("anonymous_dating_profiles")
        .select("*")
        .eq("is_active", true)
        .neq("user_id", user.id);
      if (matchedUserIds.length > 0) {
        fb = fb.not("user_id", "in", `(${matchedUserIds.join(",")})`);
      }
      const r = await fb.limit(20);
      potentialMatches = r.data ?? [];
    }

    if (!potentialMatches || potentialMatches.length === 0) {
      return new Response(
        JSON.stringify({ error: "No compatible matches found at the moment. Try again later!" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }

    // Rank by shared interests
    const ranked = potentialMatches
      .map((p: any) => ({
        profile: p,
        score: (p.interests || []).filter((i: string) => userProfile.interests?.includes(i)).length,
      }))
      .sort((a, b) => b.score - a.score);

    const minShared = filters.min_shared_interests ?? 0;
    const acceptable = ranked.filter(r => r.score >= minShared);
    const pool = acceptable.length > 0 ? acceptable : ranked;
    const top = pool.slice(0, Math.min(3, pool.length));
    const matchedProfile = top[Math.floor(Math.random() * top.length)].profile;

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