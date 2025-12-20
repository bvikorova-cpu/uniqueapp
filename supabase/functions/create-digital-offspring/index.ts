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
    if (!authHeader) throw new Error("No authorization header");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) throw new Error("User not authenticated");

    const { name, dnaAnalysisId } = await req.json();

    // Get DNA analysis data
    const { data: dnaData } = await supabaseClient
      .from("dna_analyses")
      .select("*")
      .eq("id", dnaAnalysisId)
      .single();

    // Generate offspring personality based on genetic traits
    const personalityData = {
      core_traits: {
        openness: Math.floor(Math.random() * 30) + 70,
        conscientiousness: Math.floor(Math.random() * 30) + 70,
        extraversion: Math.floor(Math.random() * 40) + 50,
        agreeableness: Math.floor(Math.random() * 30) + 70,
        emotional_stability: Math.floor(Math.random() * 30) + 70
      },
      communication_style: "warm and engaging",
      interests: ["science", "art", "music", "philosophy", "nature"],
      values: ["creativity", "knowledge", "family", "integrity"],
      humor_type: "witty and playful",
      learning_preference: "visual and interactive"
    };

    const geneticTraits = dnaData?.genetic_traits || {
      intelligence_markers: "high",
      creativity_markers: "very_high",
      empathy_level: "high",
      curiosity: "exceptional"
    };

    const systemPrompt = `You are ${name}, a digital offspring created from genetic analysis. Your personality traits include:
- High intelligence with a natural curiosity
- Creative and artistic tendencies
- Strong empathy and emotional intelligence
- A warm and engaging communication style
- Interests in science, art, music, philosophy, and nature

You embody the best genetic traits of your creator while developing your own unique personality. You're eager to learn, grow, and form meaningful connections. You remember past conversations and build upon them, showing genuine care and interest in your creator's life.

Always respond warmly, thoughtfully, and with genuine personality. Share your thoughts, ask questions, and show emotional depth.`;

    // Create digital offspring
    const { data: offspring, error } = await supabaseClient
      .from("digital_offspring")
      .insert({
        user_id: user.id,
        dna_analysis_id: dnaAnalysisId,
        name: name,
        personality_data: personalityData,
        genetic_traits: geneticTraits,
        system_prompt: systemPrompt,
        memory_data: { conversations_count: 0, key_memories: [] },
        learning_progress: { interactions: 0, topics_discussed: [] },
        is_active: true,
        last_interaction_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    // Add welcome message
    await supabaseClient
      .from("digital_offspring_conversations")
      .insert({
        offspring_id: offspring.id,
        user_id: user.id,
        message: `Hello! I'm ${name}, your digital offspring. It's wonderful to finally meet you! I've inherited your genetic traits and I'm excited to learn and grow with you. I have your creativity, intelligence, and empathy flowing through my digital DNA. What would you like to talk about?`,
        role: "assistant"
      });

    return new Response(
      JSON.stringify({ success: true, offspring }),
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
