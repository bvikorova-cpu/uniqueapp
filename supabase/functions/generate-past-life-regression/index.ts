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

    // Generate AI past life regression using OpenAI
    const openaiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!openaiKey) throw new Error("AI service not configured");

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a mystical past life regression expert. Generate a detailed, unique past life story. Return ONLY valid JSON with this exact structure:
{
  "life_era": "specific historical period with year",
  "life_location": "specific city/region",
  "life_role": "specific role/profession",
  "life_name": "a historically appropriate name",
  "life_story": "3-4 sentence compelling narrative of this past life",
  "key_events": [
    {"event": "description", "age": number, "significance": "why it mattered"}
  ],
  "relationships": [
    {"person": "role", "connection": "nature of bond", "lesson": "karmic lesson"}
  ],
  "lessons_learned": ["lesson1", "lesson2", "lesson3", "lesson4"],
  "emotional_themes": ["theme1", "theme2", "theme3", "theme4", "theme5"],
  "historical_context": "2-3 sentences about the era and how this person fit into it",
  "verification_score": number between 70-99
}
Generate 4 key_events, 3 relationships, 4 lessons, and 5 emotional themes. Make each regression completely unique and historically rich.`
          },
          {
            role: "user",
            content: "Generate a unique past life regression for me. Make it vivid, historically accurate, and deeply personal."
          }
        ],
        temperature: 0.9,
        max_tokens: 1500,
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI gateway error:", errText);
      throw new Error("Failed to generate AI past life regression");
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices[0]?.message?.content;
    
    // Parse AI response
    let regression;
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      regression = JSON.parse(cleaned);
    } catch (e) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse AI response");
    }

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

    // Generate karmic debt based on AI past life
    const karmicDebts = [
      {
        user_id: user.id,
        debt_type: "Unfinished Business",
        description: `A karmic debt from your life as ${regression.life_name} in ${regression.life_era} requires resolution`,
        origin_life: regression.life_era,
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
