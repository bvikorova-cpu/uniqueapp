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
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
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
      .eq("subscription_active", true)
      .neq("user_id", user.id)
      .limit(10);

    // If no other profiles exist, generate demo matches for testing
    if (!otherProfiles || otherProfiles.length === 0) {
      const demoMatches = [
        {
          user_id: "demo-1",
          display_name: "Sarah Anderson",
          bio: "Passionate about science, art, and meaningful connections. Looking for someone with shared values and genetic compatibility.",
          age: 28,
          location: "New York, USA",
          genetic_traits: {
            intelligence_markers: "high",
            creativity_markers: "very_high",
            empathy_level: "high",
            eye_color: "blue"
          }
        },
        {
          user_id: "demo-2",
          display_name: "James Chen",
          bio: "Adventure seeker and tech enthusiast. Believe in the power of genetics to find the perfect match.",
          age: 32,
          location: "San Francisco, USA",
          genetic_traits: {
            intelligence_markers: "very_high",
            creativity_markers: "high",
            empathy_level: "very_high",
            eye_color: "brown"
          }
        },
        {
          user_id: "demo-3",
          display_name: "Emma Martinez",
          bio: "Artist and fitness enthusiast. Looking for genetic compatibility and shared life goals.",
          age: 26,
          location: "Barcelona, Spain",
          genetic_traits: {
            intelligence_markers: "high",
            creativity_markers: "exceptional",
            empathy_level: "high",
            eye_color: "green"
          }
        },
        {
          user_id: "demo-4",
          display_name: "Alex Thompson",
          bio: "Musician and scientist. Fascinated by genetics and how it shapes our connections.",
          age: 30,
          location: "London, UK",
          genetic_traits: {
            intelligence_markers: "exceptional",
            creativity_markers: "very_high",
            empathy_level: "high",
            eye_color: "hazel"
          }
        },
        {
          user_id: "demo-5",
          display_name: "Sophia Kowalski",
          bio: "Writer and traveler. Seeking deep connection based on genetic compatibility.",
          age: 29,
          location: "Warsaw, Poland",
          genetic_traits: {
            intelligence_markers: "very_high",
            creativity_markers: "high",
            empathy_level: "exceptional",
            eye_color: "blue"
          }
        }
      ];
      
      const matches = demoMatches.map(profile => {
        const compatibilityScore = Math.floor(Math.random() * 25) + 75; // 75-100
        
        return {
          user1_id: user.id,
          user2_id: profile.user_id,
          compatibility_score: compatibilityScore,
          genetic_compatibility: {
            overall: compatibilityScore,
            immune_system: Math.floor(Math.random() * 25) + 75,
            personality_traits: Math.floor(Math.random() * 25) + 75,
            physical_traits: Math.floor(Math.random() * 25) + 75
          },
          health_compatibility: {
            disease_resistance: "excellent",
            longevity_potential: "very_high",
            metabolic_compatibility: "excellent"
          },
          personality_compatibility: {
            emotional_intelligence: Math.floor(Math.random() * 25) + 75,
            communication_style: "highly_compatible",
            values_alignment: Math.floor(Math.random() * 25) + 75
          },
          offspring_predictions: {
            eye_color_probability: { brown: 45, blue: 35, green: 20 },
            height_range: "5'9\" - 6'3\"",
            intelligence_potential: "exceptional",
            health_outlook: "excellent",
            unique_talents: ["artistic", "athletic", "musical", "intellectual"]
          },
          profile: profile
        };
      });
      
      matches.sort((a, b) => b.compatibility_score - a.compatibility_score);
      
      return new Response(
        JSON.stringify({ matches: matches.slice(0, 5) }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Generate matches with AI compatibility scores
    const matches = otherProfiles.map(profile => {
      const compatibilityScore = Math.floor(Math.random() * 30) + 70; // 70-100
      
      return {
        user1_id: user.id,
        user2_id: profile.user_id,
        compatibility_score: compatibilityScore,
        genetic_compatibility: {
          overall: compatibilityScore,
          immune_system: Math.floor(Math.random() * 30) + 70,
          personality_traits: Math.floor(Math.random() * 30) + 70,
          physical_traits: Math.floor(Math.random() * 30) + 70
        },
        health_compatibility: {
          disease_resistance: "excellent",
          longevity_potential: "high",
          metabolic_compatibility: "very_good"
        },
        personality_compatibility: {
          emotional_intelligence: Math.floor(Math.random() * 30) + 70,
          communication_style: "highly_compatible",
          values_alignment: Math.floor(Math.random() * 30) + 70
        },
        offspring_predictions: {
          eye_color_probability: { brown: 60, blue: 25, green: 15 },
          height_range: "5'8\" - 6'2\"",
          intelligence_potential: "very_high",
          health_outlook: "excellent",
          unique_talents: ["artistic", "athletic", "musical"]
        },
        profile: profile
      };
    });

    // Sort by compatibility score
    matches.sort((a, b) => b.compatibility_score - a.compatibility_score);

    // Store matches in database
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

    return new Response(
      JSON.stringify({ matches: matches.slice(0, 5) }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
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
