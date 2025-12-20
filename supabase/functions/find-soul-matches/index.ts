import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Unauthorized");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        auth: { persistSession: false },
        global: { headers: { Authorization: authHeader } },
      }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    
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

    // Get other active profiles
    const { data: otherProfiles } = await supabaseClient
      .from("soul_profiles")
      .select("*")
      .eq("is_active", true)
      .neq("user_id", user.id)
      .limit(10);

    // Generate demo matches if no profiles exist
    if (!otherProfiles || otherProfiles.length === 0) {
      const demoMatches = [
        {
          user_id: "demo-soul-1",
          display_name: "Elena Starweaver",
          bio: "Old soul seeking karmic connections. Past lives in ancient Greece and Renaissance Italy.",
          age: 32,
          location: "Barcelona, Spain",
          spiritual_level: 7,
          past_lives_count: 12,
          karma_balance: 85,
          soul_age: "old"
        },
        {
          user_id: "demo-soul-2",
          display_name: "Marcus Lightbringer",
          bio: "Ancient warrior soul on a path of redemption. Seeking souls from past lifetimes.",
          age: 38,
          location: "Edinburgh, Scotland",
          spiritual_level: 8,
          past_lives_count: 15,
          karma_balance: 78,
          soul_age: "ancient"
        },
        {
          user_id: "demo-soul-3",
          display_name: "Aria Moonchild",
          bio: "Young soul exploring past connections. Healer archetype across multiple lives.",
          age: 28,
          location: "Portland, USA",
          spiritual_level: 6,
          past_lives_count: 8,
          karma_balance: 92,
          soul_age: "mature"
        }
      ];

      const matches = demoMatches.map(profile => {
        const compatibilityScore = Math.floor(Math.random() * 25) + 75;
        const pastLivesTogether = Math.floor(Math.random() * 5) + 1;

        return {
          user1_id: user.id,
          user2_id: profile.user_id,
          connection_type: ["Soulmate", "Twin Flame", "Soul Family", "Karmic Partner"][Math.floor(Math.random() * 4)],
          past_lives_together: pastLivesTogether,
          relationship_history: [
            { era: "Ancient Egypt", relationship: "Siblings", lesson: "Loyalty" },
            { era: "Medieval Europe", relationship: "Master & Student", lesson: "Wisdom" },
            { era: "Victorian Era", relationship: "Lovers", lesson: "True Love" }
          ].slice(0, pastLivesTogether),
          soul_contract: "You agreed to meet again in this lifetime to complete unfinished spiritual lessons and support each other's growth.",
          compatibility_score: compatibilityScore,
          karmic_lessons: [
            { lesson: "Forgiveness", progress: 75 },
            { lesson: "Trust", progress: 82 },
            { lesson: "Compassion", progress: 90 }
          ],
          reunion_probability: Math.floor(Math.random() * 30) + 70,
          profile: profile
        };
      });

      return new Response(
        JSON.stringify({ matches }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Generate matches with real profiles
    const matches = otherProfiles.map(profile => {
      const compatibilityScore = Math.floor(Math.random() * 30) + 70;
      const pastLivesTogether = Math.floor(Math.random() * 5) + 1;

      return {
        user1_id: user.id,
        user2_id: profile.user_id,
        connection_type: ["Soulmate", "Twin Flame", "Soul Family", "Karmic Partner"][Math.floor(Math.random() * 4)],
        past_lives_together: pastLivesTogether,
        relationship_history: [
          { era: "Ancient Civilization", relationship: "Connected Souls", lesson: "Growth" }
        ],
        soul_contract: "A karmic connection spanning lifetimes",
        compatibility_score: compatibilityScore,
        karmic_lessons: [
          { lesson: "Understanding", progress: Math.floor(Math.random() * 40) + 60 }
        ],
        reunion_probability: Math.floor(Math.random() * 30) + 70,
        profile: profile
      };
    });

    // Store matches in database
    const matchRecords = matches.map(m => ({
      user1_id: m.user1_id,
      user2_id: m.user2_id,
      connection_type: m.connection_type,
      past_lives_together: m.past_lives_together,
      relationship_history: m.relationship_history,
      soul_contract: m.soul_contract,
      compatibility_score: m.compatibility_score,
      karmic_lessons: m.karmic_lessons,
      reunion_probability: m.reunion_probability,
      match_status: "discovered"
    }));

    await supabaseClient.from("soul_matches").insert(matchRecords);

    return new Response(
      JSON.stringify({ matches: matches.slice(0, 5) }),
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
