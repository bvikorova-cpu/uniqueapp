import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) throw new Error("Unauthorized");

    const { tool, ...params } = await req.json();
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OpenAI API key not configured");

    let systemPrompt = "";
    let userPrompt = "";

    switch (tool) {
      case "parallel_life_simulator":
        systemPrompt = "You are a creative AI that simulates a day in someone's alternate life. Generate vivid, immersive scenarios.";
        userPrompt = `Generate a day-in-the-life simulation for this alternate reality scenario: "${params.scenario}". Return JSON: { "simulation": { "title": "Life as: [scenario title]", "days": [{ "time": "HH:MM AM/PM", "event": "detailed description", "mood": "one word mood", "choice": { "a": "option", "b": "option" } or null }] } }. Generate 6 time entries across one day, with 2 of them having choice options.`;
        break;

      case "leaderboard":
        systemPrompt = "You generate creative fictional leaderboard data for a multiverse exploration platform.";
        userPrompt = `Generate a creative leaderboard of 10 fictional multiverse explorers. Return JSON: { "leaderboard": [{ "rank": 1-10, "name": "creative username", "universes": number 5-50, "bestScore": number 70-99, "specialty": "field", "badge": "Grandmaster|Master|Expert|Adept|Explorer|Seeker|Novice" }] }. Make it diverse and interesting.`;
        break;

      case "reality_clash":
        systemPrompt = "You are an AI judge that compares two parallel versions of a person and determines which reality produced a more successful version.";
        userPrompt = `Compare these two parallel universe versions:
Universe 1: "${params.universe1.name}" - ${params.universe1.description} (Divergence: ${params.universe1.divergence}, Score: ${params.universe1.score})
Universe 2: "${params.universe2.name}" - ${params.universe2.description} (Divergence: ${params.universe2.divergence}, Score: ${params.universe2.score})

Return JSON: { "result": { "universe1": { "name": "${params.universe1.name}", "score": adjusted_score, "strengths": ["str1","str2"], "weaknesses": ["w1","w2"] }, "universe2": { "name": "${params.universe2.name}", "score": adjusted_score, "strengths": ["str1","str2"], "weaknesses": ["w1","w2"] }, "winner": "winning universe name", "analysis": "detailed analysis of why winner won", "categories": [{ "name": "Career|Relationships|Health|Happiness|Impact", "score1": 0-100, "score2": 0-100 }] } }. Generate 5 categories.`;
        break;

      case "quantum_destiny":
        systemPrompt = "You are a quantum oracle AI that predicts future outcomes across parallel timelines. Be creative but grounded.";
        userPrompt = `Forecast the future for this question: "${params.question}". Return JSON: { "forecast": { "overallOutlook": "detailed analysis text", "probability": 0-100, "timelines": [{ "year": "timeframe", "event": "prediction", "probability": 0-100, "trend": "up|down|neutral" }], "warnings": ["warning1","warning2","warning3"], "opportunities": ["opp1","opp2","opp3"] } }. Generate 5 timeline entries for 6months, 1year, 2years, 5years, 10years.`;
        break;

      default:
        throw new Error(`Unknown tool: ${tool}`);
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.9,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI error:", errorText);
      throw new Error("AI service unavailable");
    }

    const aiData = await response.json();
    const content = aiData.choices[0]?.message?.content;
    
    if (!content) throw new Error("No AI response");

    const parsed = JSON.parse(content);
    
    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
