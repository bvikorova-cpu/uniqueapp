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

    // Generate AI past life regression
    const eras = ["Ancient Egypt 2500 BC", "Roman Empire 100 AD", "Medieval Europe 1200s", "Renaissance Italy 1500s", "Victorian England 1850s", "Ancient China 500 BC", "Mayan Civilization 800 AD"];
    const roles = ["Artisan", "Scholar", "Warrior", "Healer", "Merchant", "Noble", "Farmer", "Artist", "Priest", "Builder"];
    const locations = ["Alexandria", "Rome", "Paris", "Florence", "London", "Beijing", "Cairo", "Athens", "Constantinople", "Kyoto"];

    const randomEra = eras[Math.floor(Math.random() * eras.length)];
    const randomRole = roles[Math.floor(Math.random() * roles.length)];
    const randomLocation = locations[Math.floor(Math.random() * locations.length)];

    const regression = {
      life_era: randomEra,
      life_location: randomLocation,
      life_role: randomRole,
      life_name: `${randomRole} of ${randomLocation}`,
      life_story: `You were a ${randomRole.toLowerCase()} in ${randomLocation} during ${randomEra}. Your days were filled with purpose and meaning. You lived through significant historical events and made choices that shaped not only your life but the lives of those around you. The memories of this life carry lessons that echo into your present existence.`,
      key_events: [
        { event: "Coming of age ceremony", age: 16, significance: "Marked transition to adulthood" },
        { event: "Major achievement", age: 28, significance: "Gained recognition in community" },
        { event: "Life-changing decision", age: 35, significance: "Altered the course of your destiny" },
        { event: "Legacy creation", age: 52, significance: "Left lasting impact on community" }
      ],
      relationships: [
        { person: "Soulmate", connection: "Deep romantic bond", lesson: "Unconditional love" },
        { person: "Mentor", connection: "Spiritual guide", lesson: "Wisdom and patience" },
        { person: "Rival", connection: "Challenging adversary", lesson: "Strength through adversity" }
      ],
      lessons_learned: [
        "Patience in the face of adversity",
        "The power of compassion",
        "Balance between ambition and contentment",
        "Importance of community bonds"
      ],
      emotional_themes: ["Love", "Loss", "Growth", "Redemption", "Purpose"],
      historical_context: `During ${randomEra}, the world was experiencing significant changes. As a ${randomRole.toLowerCase()}, you played a vital role in your society, contributing to the cultural and social fabric of your time.`,
      verification_score: Math.floor(Math.random() * 30) + 70
    };

    // Insert regression
    const { data: insertedRegression, error: insertError } = await supabaseClient
      .from("past_life_regressions")
      .insert({
        user_id: user.id,
        ...regression
      })
      .select()
      .single();

    if (insertError) throw insertError;

    // Generate karmic debts based on past life
    const karmicDebts = [
      {
        user_id: user.id,
        debt_type: "Unfinished Business",
        description: "A promise left unfulfilled in your past life requires attention",
        origin_life: randomEra,
        severity: Math.floor(Math.random() * 5) + 3,
        balance_score: Math.floor(Math.random() * 40) + 20,
        resolution_steps: [
          { step: 1, action: "Acknowledge the past", status: "pending" },
          { step: 2, action: "Make amends in current life", status: "pending" },
          { step: 3, action: "Learn the lesson", status: "pending" }
        ]
      }
    ];

    await supabaseClient.from("karmic_debts").insert(karmicDebts);

    return new Response(
      JSON.stringify({ 
        success: true, 
        regression: insertedRegression,
        karmic_insights: karmicDebts.length 
      }),
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
