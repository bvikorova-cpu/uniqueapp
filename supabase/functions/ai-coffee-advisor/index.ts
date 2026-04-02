import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { type, ...params } = await req.json();
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Not authenticated");

    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) throw new Error("OpenAI API key not configured");

    const prompts: Record<string, string> = {
      brewing: `You are a world-class barista and brewing expert. The user uses "${params.method}" brewing method. Answer their question: "${params.question}". Provide specific water temperature, grind size, timing, ratios, and pro tips. Be detailed and practical.`,
      bean_expert: `You are a coffee bean expert and Q-grader. Analyze this coffee: "${params.query}". Cover: origin details, altitude, processing method, flavor profile (acidity, body, sweetness, finish), best brewing methods, roast recommendations, and food pairings.`,
      cafe_recommend: `You are a local café guide expert. Based on these preferences: "${params.preferences}", recommend 3-5 ideal café types with: atmosphere description, what to order, best time to visit, and what makes each special. Be specific and creative.`,
      latte_art: `You are a latte art world champion coach. The student is "${params.skill}" level and wants to learn: "${params.pattern}". Provide: step-by-step pouring technique, milk texturing tips, common mistakes, practice drills, and progression path.`,
      food_pairing: `You are a specialty coffee and culinary pairing expert. For: "${params.input}", suggest 5 perfect pairings with: why they complement each other (flavor chemistry), preparation tips, and seasonal variations.`,
      health_analysis: `You are a nutritionist specializing in coffee and health. Analyze these habits: "${params.habits}". Cover: daily caffeine intake estimate, optimal timing, sleep impact, hydration needs, potential benefits, risks, and personalized recommendations.`,
    };

    const systemPrompt = prompts[type];
    if (!systemPrompt) throw new Error("Invalid analysis type");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: "Please provide your expert analysis." },
        ],
        max_tokens: 1500,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content || "No result generated";

    return new Response(JSON.stringify({ result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
