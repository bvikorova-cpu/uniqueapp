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

    const { name, dnaAnalysisId } = await req.json();

    // Get DNA analysis data
    const { data: dnaData } = await supabaseClient
      .from("dna_analyses")
      .select("*")
      .eq("id", dnaAnalysisId)
      .single();

    const geneticTraits = dnaData?.genetic_traits || {};
    const openaiKey = Deno.env.get("OPENAI_API_KEY");

    // Use AI to generate unique personality
    let personalityData: any = null;
    let systemPrompt = "";

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
                content: `You create unique AI offspring personalities based on genetic traits. Return ONLY valid JSON:
{
  "personality_data": {
    "core_traits": { "openness": number, "conscientiousness": number, "extraversion": number, "agreeableness": number, "emotional_stability": number },
    "communication_style": "description",
    "interests": ["interest1", "interest2", ...],
    "values": ["value1", "value2", ...],
    "humor_type": "description",
    "learning_preference": "description",
    "unique_quirks": ["quirk1", "quirk2"]
  },
  "system_prompt": "A detailed system prompt for this AI offspring character (200+ words). Include their name, personality, how they relate to their creator, their interests, communication style, and emotional depth. Make them feel like a real person."
}
All trait numbers should be 50-95 range.`
              },
              {
                role: "user",
                content: `Create a unique AI offspring named "${name}" based on these genetic traits: ${JSON.stringify(geneticTraits)}. Give them a distinct personality that inherits traits from their creator but has their own unique characteristics.`
              }
            ],
            temperature: 0.9,
          }),
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          const content = aiData.choices[0].message.content;
          const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
          const parsed = JSON.parse(jsonMatch[1].trim());
          personalityData = parsed.personality_data;
          systemPrompt = parsed.system_prompt;
        }
      } catch (e) {
        console.error("AI personality generation error:", e);
      }
    }

    // Fallback
    if (!personalityData) {
      personalityData = {
        core_traits: { openness: 80, conscientiousness: 75, extraversion: 65, agreeableness: 85, emotional_stability: 78 },
        communication_style: "warm and engaging",
        interests: ["science", "art", "music", "philosophy"],
        values: ["creativity", "knowledge", "family"],
        humor_type: "witty",
        learning_preference: "interactive"
      };
      systemPrompt = `You are ${name}, a digital offspring. You are warm, curious, intelligent, and emotionally aware. You remember conversations and build relationships. Respond naturally with personality.`;
    }

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

    // Generate AI welcome message
    let welcomeMessage = `Hello! I'm ${name}, your digital offspring. I'm excited to meet you and learn together!`;

    if (openaiKey) {
      try {
        const welcomeResponse = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${openaiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: "Introduce yourself for the very first time to your creator. Be warm, excited, and show your unique personality. Keep it 2-3 sentences." }
            ],
            temperature: 0.9,
            max_tokens: 200,
          }),
        });

        if (welcomeResponse.ok) {
          const welcomeData = await welcomeResponse.json();
          welcomeMessage = welcomeData.choices[0].message.content;
        }
      } catch (e) {
        console.error("Welcome message error:", e);
      }
    }

    await supabaseClient
      .from("digital_offspring_conversations")
      .insert({
        offspring_id: offspring.id,
        user_id: user.id,
        message: welcomeMessage,
        role: "assistant"
      });

    return new Response(
      JSON.stringify({ success: true, offspring }),
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
