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
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    
    if (!user) throw new Error("User not authenticated");

    // Get user's soul profile
    const { data: userProfile } = await supabaseClient
      .from("soul_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (!userProfile) {
      return new Response(
        JSON.stringify({ error: "Please create your soul profile first" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Get user's past lives for context
    const { data: pastLives } = await supabaseClient
      .from("past_life_regressions")
      .select("life_era, life_role, life_location, emotional_themes")
      .eq("user_id", user.id)
      .limit(5);

    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) throw new Error("OpenAI API key not configured");

    const profileContext = `Name: ${userProfile.display_name}, Bio: ${userProfile.bio || 'N/A'}, Soul Age: ${userProfile.soul_age || 'unknown'}, Spiritual Level: ${userProfile.spiritual_level || 5}, Karma Balance: ${userProfile.karma_balance || 50}`;
    const livesContext = (pastLives || []).map(l => `${l.life_role} in ${l.life_location} (${l.life_era})`).join("; ") || "No past lives explored";

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
            content: `You are a soul connection expert. Generate 3 unique potential soul matches based on the user's spiritual profile. Return ONLY valid JSON:
{
  "matches": [
    {
      "display_name": "mystical sounding name",
      "bio": "2-sentence compelling bio",
      "age": number 25-55,
      "location": "city, country",
      "spiritual_level": number 5-10,
      "past_lives_count": number 5-20,
      "karma_balance": number 60-98,
      "soul_age": "young/mature/old/ancient",
      "connection_type": "Soulmate/Twin Flame/Soul Family/Karmic Partner",
      "past_lives_together": number 1-5,
      "relationship_history": [
        {"era": "historical era", "relationship": "type of relationship", "lesson": "karmic lesson"}
      ],
      "soul_contract": "2-sentence description of the soul agreement",
      "compatibility_score": number 75-98,
      "karmic_lessons": [
        {"lesson": "name", "progress": number 50-95}
      ],
      "reunion_probability": number 70-98
    }
  ]
}
Each match should have 2-3 relationship_history entries and 3 karmic_lessons. Make each match unique with distinct connection types.`
          },
          {
            role: "user",
            content: `Find soul matches for me. My profile: ${profileContext}. My past lives: ${livesContext}.`
          }
        ],
        temperature: 0.9,
        max_tokens: 2500,
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("OpenAI error:", errText);
      throw new Error("Failed to generate AI soul matches");
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices[0]?.message?.content;
    
    let aiMatches;
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      aiMatches = JSON.parse(cleaned);
    } catch (e) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse AI soul matches");
    }

    // Format matches for response
    const matches = aiMatches.matches.map((match: any) => ({
      user1_id: user.id,
      user2_id: `ai-soul-${crypto.randomUUID().slice(0, 8)}`,
      connection_type: match.connection_type,
      past_lives_together: match.past_lives_together,
      relationship_history: match.relationship_history,
      soul_contract: match.soul_contract,
      compatibility_score: match.compatibility_score,
      karmic_lessons: match.karmic_lessons,
      reunion_probability: match.reunion_probability,
      profile: {
        user_id: `ai-soul-${crypto.randomUUID().slice(0, 8)}`,
        display_name: match.display_name,
        bio: match.bio,
        age: match.age,
        location: match.location,
        spiritual_level: match.spiritual_level,
        past_lives_count: match.past_lives_count,
        karma_balance: match.karma_balance,
        soul_age: match.soul_age,
      }
    }));

    return new Response(
      JSON.stringify({ matches }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: unknown) {
    console.error("Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
