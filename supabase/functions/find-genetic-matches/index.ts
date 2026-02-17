import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user) throw new Error("User not authenticated");

    // Get user's profile
    const { data: userProfile } = await supabaseClient
      .from("genetic_dating_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (!userProfile) {
      return new Response(
        JSON.stringify({ error: "Please create your dating profile first" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Get other active profiles
    const { data: otherProfiles } = await supabaseClient
      .from("genetic_dating_profiles")
      .select("*")
      .eq("is_active", true)
      .neq("user_id", user.id)
      .limit(10);

    const openaiKey = Deno.env.get("OPENAI_API_KEY");

    // Generate AI-powered demo matches if no real profiles exist
    const profilesToMatch = (otherProfiles && otherProfiles.length > 0) ? otherProfiles : null;

    if (!profilesToMatch && openaiKey) {
      // Use AI to generate personalized demo matches based on user's profile
      try {
        const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${openaiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content: `You are a genetic dating AI that generates personalized match profiles. Generate 5 fictional but realistic dating matches. Return ONLY valid JSON array with this structure:
[
  {
    "display_name": "Full Name",
    "bio": "2-3 sentence personality bio",
    "age": number,
    "location": "City, Country",
    "compatibility_score": number (75-98),
    "genetic_compatibility": { "overall": number, "immune_system": number, "personality_traits": number, "physical_traits": number },
    "personality_compatibility": { "emotional_intelligence": number, "communication_style": "description", "values_alignment": number },
    "offspring_predictions": { "height_range": "range string", "intelligence_potential": "description", "health_outlook": "description", "unique_talents": ["talent1", "talent2", "talent3"] },
    "match_reason": "Why this is a good genetic match"
  }
]
All number fields for compatibility should be 60-98 range. Make profiles diverse in ethnicity, location, and personality.`
              },
              {
                role: "user",
                content: `Generate matches for: ${userProfile.display_name}, age ${userProfile.age}, from ${userProfile.location}. Bio: ${userProfile.bio}. Genetic traits: ${JSON.stringify(userProfile.genetic_traits)}. Personality DNA: ${JSON.stringify(userProfile.personality_dna)}.`
              }
            ],
            temperature: 0.9,
          }),
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          const content = aiData.choices[0].message.content;
          const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
          const aiMatches = JSON.parse(jsonMatch[1].trim());

          const matches = aiMatches.map((m: any, i: number) => ({
            user1_id: user.id,
            user2_id: `ai-match-${i}`,
            compatibility_score: m.compatibility_score,
            genetic_compatibility: m.genetic_compatibility,
            health_compatibility: { disease_resistance: "excellent", longevity_potential: "high", metabolic_compatibility: "very_good" },
            personality_compatibility: m.personality_compatibility,
            offspring_predictions: m.offspring_predictions,
            profile: {
              display_name: m.display_name,
              bio: m.bio,
              age: m.age,
              location: m.location,
            }
          }));

          matches.sort((a: any, b: any) => b.compatibility_score - a.compatibility_score);

          return new Response(
            JSON.stringify({ matches }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
          );
        }
      } catch (e) {
        console.error("AI match generation error:", e);
      }
    }

    // For real profiles or fallback - generate compatibility analysis with AI
    const profiles = profilesToMatch || [];
    const matches = [];

    for (const profile of profiles) {
      let matchData: any = null;

      if (openaiKey) {
        try {
          const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${openaiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "gpt-4o-mini",
              messages: [
                {
                  role: "system",
                  content: "You are a genetic compatibility analyzer. Analyze two profiles and return ONLY JSON: { \"compatibility_score\": number(60-98), \"genetic_compatibility\": { \"overall\": number, \"immune_system\": number, \"personality_traits\": number, \"physical_traits\": number }, \"personality_compatibility\": { \"emotional_intelligence\": number, \"communication_style\": \"description\", \"values_alignment\": number }, \"offspring_predictions\": { \"height_range\": \"range\", \"intelligence_potential\": \"desc\", \"health_outlook\": \"desc\", \"unique_talents\": [\"talent1\",\"talent2\",\"talent3\"] } }"
                },
                {
                  role: "user",
                  content: `Analyze compatibility between: Profile 1: ${JSON.stringify({ name: userProfile.display_name, traits: userProfile.genetic_traits, personality: userProfile.personality_dna })} and Profile 2: ${JSON.stringify({ name: profile.display_name, traits: profile.genetic_traits, personality: profile.personality_dna })}`
                }
              ],
              temperature: 0.7,
            }),
          });

          if (aiResponse.ok) {
            const aiData = await aiResponse.json();
            const content = aiData.choices[0].message.content;
            const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
            matchData = JSON.parse(jsonMatch[1].trim());
          }
        } catch (e) {
          console.error("AI compatibility error:", e);
        }
      }

      // Fallback
      if (!matchData) {
        const score = Math.floor(Math.random() * 25) + 75;
        matchData = {
          compatibility_score: score,
          genetic_compatibility: { overall: score, immune_system: score - 5, personality_traits: score + 3, physical_traits: score - 2 },
          personality_compatibility: { emotional_intelligence: score, communication_style: "compatible", values_alignment: score + 2 },
          offspring_predictions: { height_range: "5'8\" - 6'2\"", intelligence_potential: "high", health_outlook: "excellent", unique_talents: ["creative", "athletic"] }
        };
      }

      matches.push({
        user1_id: user.id,
        user2_id: profile.user_id,
        ...matchData,
        health_compatibility: { disease_resistance: "excellent", longevity_potential: "high", metabolic_compatibility: "very_good" },
        profile: profile
      });
    }

    matches.sort((a, b) => b.compatibility_score - a.compatibility_score);

    // Store matches
    if (matches.length > 0) {
      const matchRecords = matches.map(m => ({
        user1_id: m.user1_id,
        user2_id: m.user2_id,
        compatibility_score: m.compatibility_score,
        genetic_compatibility: m.genetic_compatibility,
        health_compatibility: m.health_compatibility,
        personality_compatibility: m.personality_compatibility,
        offspring_predictions: m.offspring_predictions,
        match_status: "active"
      }));

      await supabaseClient.from("genetic_matches").insert(matchRecords);
    }

    return new Response(
      JSON.stringify({ matches: matches.slice(0, 5) }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
