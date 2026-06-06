import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import {
  corsHeaders,
  json,
  errorResponse,
  findMatchSchema,
} from "../_shared/anonymous-dating.ts";

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
      return errorResponse("UNAUTHORIZED", "Missing authorization header", 401);
    }
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      return errorResponse("UNAUTHORIZED", "User not authenticated", 401);
    }

    // ── Rate limit: 30 match requests per minute per user ──
    const { data: rateOk } = await supabaseClient.rpc("check_anon_dating_rate_limit", {
      p_user_id: user.id,
      p_action: "find_anonymous_match",
      p_max_per_minute: 30,
    });
    if (rateOk === false) {
      return errorResponse("RATE_LIMITED", "Too many match requests. Please wait a minute.", 429);
    }

    // ── Zod validation ──
    let rawBody: unknown = {};
    if (req.method === "POST") {
      try {
        rawBody = await req.json();
      } catch {
        rawBody = {};
      }
    }
    const parsedBody = findMatchSchema.safeParse(rawBody);
    if (!parsedBody.success) {
      return errorResponse("VALIDATION_ERROR", "Invalid request payload", 400, {
        issues: parsedBody.error.flatten().fieldErrors,
      });
    }
    const { mode, targetUserId, filters } = parsedBody.data;


    // Credit check is only required when actually creating a match
    const { data: creditsData } = await supabaseClient
      .from("anonymous_dating_credits")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (mode === "match" && (!creditsData || creditsData.credits_remaining < MATCH_COST)) {
      return errorResponse("INSUFFICIENT_CREDITS", "Not enough credits to start a match.", 402, { required: MATCH_COST });
    }

    // Get user profile
    const { data: userProfile } = await supabaseClient
      .from("anonymous_dating_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (!userProfile) {
      return errorResponse("PROFILE_REQUIRED", "Profile not found. Please create a profile first.", 400);
    }

    // Already-matched users
    const { data: existingMatches } = await supabaseClient
      .from("anonymous_dating_matches")
      .select("user1_id, user2_id")
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

    const matchedUserIds = existingMatches?.flatMap(m =>
      [m.user1_id, m.user2_id].filter(id => id !== user.id)
    ) || [];

    // Excluded via blocks (both directions)
    const [{ data: myBlocks }, { data: theirBlocks }] = await Promise.all([
      supabaseClient.from("blocked_users").select("blocked_user_id").eq("user_id", user.id),
      supabaseClient.from("blocked_users").select("user_id").eq("blocked_user_id", user.id),
    ]);
    const blockedIds = new Set<string>([
      ...(myBlocks ?? []).map((b: any) => b.blocked_user_id),
      ...(theirBlocks ?? []).map((b: any) => b.user_id),
    ]);

    const excludedIds = Array.from(new Set([...matchedUserIds, ...blockedIds]));

    // Build query with filters
    let query = supabaseClient
      .from("anonymous_dating_profiles")
      .select("*")
      .eq("is_active", true)
      .neq("user_id", user.id);

    if (excludedIds.length > 0) {
      query = query.not("user_id", "in", `(${excludedIds.join(",")})`);
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

    let { data: potentialMatches } = await query.limit(40);

    // Fallback: relax filters if nothing matches
    if (!potentialMatches || potentialMatches.length === 0) {
      let fb = supabaseClient
        .from("anonymous_dating_profiles")
        .select("*")
        .eq("is_active", true)
        .neq("user_id", user.id);
      if (excludedIds.length > 0) {
        fb = fb.not("user_id", "in", `(${excludedIds.join(",")})`);
      }
      const r = await fb.limit(40);
      potentialMatches = r.data ?? [];
    }

    if (!potentialMatches || potentialMatches.length === 0) {
      return errorResponse("NO_MATCHES", "No compatible matches found at the moment. Try again later!", 404);
    }

    // Multi-axis compatibility scoring (0-100)
    const myInterests: string[] = userProfile.interests ?? [];
    const myLanguages: string[] = userProfile.languages ?? [];
    const myTraits: string[] = userProfile.personality_traits ?? [];

    const scored = potentialMatches.map((p: any) => {
      const sharedInterests = (p.interests || []).filter((i: string) => myInterests.includes(i));
      const sharedLanguages = (p.languages || []).filter((l: string) => myLanguages.includes(l));
      const sharedTraits = (p.personality_traits || []).filter((t: string) => myTraits.includes(t));

      const interestScore = Math.min(sharedInterests.length, 6) * 8;       // up to 48
      const languageScore = Math.min(sharedLanguages.length, 3) * 6;       // up to 18
      const traitScore = Math.min(sharedTraits.length, 4) * 5;             // up to 20
      const goalScore = p.relationship_goal && p.relationship_goal === userProfile.relationship_goal ? 8 : 0;
      const locationScore = p.location && userProfile.location &&
        p.location.toLowerCase().includes(userProfile.location.toLowerCase()) ? 6 : 0;

      const compatibility = Math.min(100, interestScore + languageScore + traitScore + goalScore + locationScore);

      return {
        profile: p,
        compatibility,
        breakdown: {
          shared_interests: sharedInterests,
          shared_languages: sharedLanguages,
          shared_traits: sharedTraits,
          same_goal: !!goalScore,
          same_location: !!locationScore,
        },
      };
    }).sort((a, b) => b.compatibility - a.compatibility);

    const minShared = filters.min_shared_interests ?? 0;
    const acceptable = scored.filter(r => r.breakdown.shared_interests.length >= minShared);
    const pool = acceptable.length > 0 ? acceptable : scored;

    // PREVIEW MODE — return top 5 candidates without creating a match or spending credits
    if (mode === "preview") {
      const candidates = pool.slice(0, 5).map(r => ({
        user_id: r.profile.user_id,
        anonymous_name: r.profile.anonymous_name,
        age_range: r.profile.age_range,
        location: r.profile.location ?? null,
        interests: r.profile.interests ?? [],
        personality_traits: r.profile.personality_traits ?? [],
        compatibility: r.compatibility,
        breakdown: r.breakdown,
      }));
      return new Response(
        JSON.stringify({ candidates, cost: MATCH_COST }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // MATCH MODE — pick a specific candidate (targetUserId) or randomize top 3
    let chosen = pool[0];
    if (targetUserId) {
      const found = pool.find(r => r.profile.user_id === targetUserId);
      if (!found) {
        return new Response(
          JSON.stringify({ error: "Selected candidate is no longer available." }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 409 }
        );
      }
      chosen = found;
    } else {
      const top = pool.slice(0, Math.min(3, pool.length));
      chosen = top[Math.floor(Math.random() * top.length)];
    }

    const matchedProfile = chosen.profile;

    // ── Atomic credit deduction first (prevents double-spend) ──
    const { error: deductErr } = await supabaseClient.rpc(
      "deduct_anonymous_dating_credits",
      { p_user_id: user.id, p_amount: MATCH_COST },
    );
    if (deductErr) {
      const msg = deductErr.message || "";
      const status = msg.includes("INSUFFICIENT_CREDITS") ? 402 : 500;
      return new Response(
        JSON.stringify({ error: msg.includes("INSUFFICIENT") ? "Insufficient credits" : msg, required: MATCH_COST }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status }
      );
    }

    // Create match
    const { data: newMatch, error: matchError } = await supabaseClient
      .from("anonymous_dating_matches")
      .insert({
        user1_id: user.id,
        user2_id: matchedProfile.user_id,
        status: "active",
        match_interests: {
          common: chosen.breakdown.shared_interests,
          compatibility: chosen.compatibility,
        },
      })
      .select()
      .single();

    if (matchError) {
      // Refund on failure
      await supabaseClient.rpc("grant_anonymous_dating_credits", { p_user_id: user.id, p_amount: MATCH_COST });
      throw matchError;
    }

    return new Response(
      JSON.stringify({
        match: newMatch,
        partner: {
          anonymous_name: matchedProfile.anonymous_name,
          age_range: matchedProfile.age_range,
          interests: matchedProfile.interests,
          personality_traits: matchedProfile.personality_traits,
          compatibility: chosen.compatibility,
        },
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