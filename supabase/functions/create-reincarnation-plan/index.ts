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

    const { planName, goalDescription } = await req.json();

    // Get user's karmic debts for context
    const { data: karmicDebts } = await supabaseClient
      .from("karmic_debts")
      .select("*")
      .eq("user_id", user.id)
      .eq("current_status", "active");

    // Get past life regressions for context
    const { data: pastLives } = await supabaseClient
      .from("past_life_regressions")
      .select("life_era, life_role, life_location, lessons_learned")
      .eq("user_id", user.id)
      .limit(5);

    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) throw new Error("OpenAI API key not configured");

    const debtsContext = (karmicDebts || []).map(d => d.debt_type).join(", ") || "None recorded";
    const livesContext = (pastLives || []).map(l => `${l.life_role} in ${l.life_location} (${l.life_era})`).join("; ") || "No past lives explored yet";

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
            content: `You are a reincarnation planning expert. Create a detailed, personalized next-life plan based on the user's karmic history. Return ONLY valid JSON:
{
  "plan_name": "string",
  "next_life_goal": "compelling 2-sentence goal",
  "desired_era": "specific future or past era",
  "desired_location": "specific location",
  "desired_role": "specific role",
  "soul_missions": [
    {"mission": "description", "priority": "high/medium/low", "estimated_lifetimes": number, "progress": 0}
  ],
  "karmic_lessons_to_complete": ["lesson1", "lesson2", "lesson3"],
  "preservation_protocol": {
    "memory_retention": "high/medium/low",
    "skill_transfer": ["skill1", "skill2", "skill3"],
    "soul_signature": "unique description",
    "connection_anchors": ["anchor1", "anchor2", "anchor3"],
    "awakening_triggers": ["trigger1", "trigger2", "trigger3", "trigger4"]
  },
  "destiny_mapping": {
    "birth_circumstances": "description",
    "key_life_events": [{"age": number, "event": "description"}],
    "life_challenges": ["challenge1", "challenge2", "challenge3"],
    "success_indicators": ["indicator1", "indicator2", "indicator3"]
  }
}
Generate 3 soul_missions, 3 karmic_lessons, 5 key_life_events. Make everything deeply personalized.`
          },
          {
            role: "user",
            content: `Create my reincarnation plan. Name: "${planName || "My Next Life Journey"}". Goal: "${goalDescription || "Spiritual growth"}". My active karmic debts: ${debtsContext}. My past lives: ${livesContext}.`
          }
        ],
        max_completion_tokens: 2000,
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("OpenAI error:", errText);
      throw new Error("Failed to generate AI reincarnation plan");
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices[0]?.message?.content;
    
    let plan;
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      plan = JSON.parse(cleaned);
    } catch (e) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse AI reincarnation plan");
    }

    // Insert reincarnation plan
    const { data: insertedPlan, error: insertError } = await supabaseClient
      .from("reincarnation_plans")
      .insert({
        user_id: user.id,
        ...plan
      })
      .select()
      .single();

    if (insertError) throw insertError;

    return new Response(
      JSON.stringify({ 
        success: true, 
        plan: insertedPlan
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
