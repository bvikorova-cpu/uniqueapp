import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const openaiKey = Deno.env.get("OPENAI_API_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) throw new Error("Unauthorized");

    const { action, prompt, age } = await req.json();

    // Check credits
    const { data: credits } = await supabase.from("ai_credits").select("credits_remaining").eq("user_id", user.id).single();
    const remaining = credits?.credits_remaining || 0;

    const creditCosts: Record<string, number> = {
      age_progression: 5, skin_health: 5, lifestyle_impact: 4, celebrity_match: 4,
      anti_aging: 5, healthy_comparison: 6, skin_routine: 4, age_reversal: 4,
    };
    const cost = creditCosts[action] || 5;
    if (remaining < cost) throw new Error(`Insufficient credits. Need ${cost}, have ${remaining}.`);

    const prompts: Record<string, string> = {
      age_progression: `You are an expert AI age progression analyst. The user is ${age} years old. Based on their description: "${prompt}", provide a detailed analysis of how they will age over the next 10, 20, 30, 40, and 50 years. Include skin changes, facial structure changes, hair changes, and overall appearance evolution. Format with markdown headers and bullet points.`,
      skin_health: `You are an expert AI dermatologist and skin health analyzer. The user is ${age} years old. Based on their description: "${prompt}", provide a comprehensive skin health analysis including: skin type assessment, aging factors, UV damage risk, hydration levels, elasticity score (0-100), wrinkle risk areas, recommended skincare ingredients, and a personalized skin health score. Format with markdown.`,
      lifestyle_impact: `You are an AI lifestyle impact calculator for aging. The user is ${age} years old. Based on their lifestyle description: "${prompt}", calculate and explain how their current habits will affect their aging trajectory over the next 10-50 years. Cover: diet impact, exercise impact, sleep quality, stress levels, sun exposure, smoking/alcohol, hydration. Give a "Biological Age" estimate vs chronological age. Format with markdown.`,
      celebrity_match: `You are an AI celebrity age matching expert. The user is ${age} years old. Based on their description: "${prompt}", find their celebrity "age twin" - a celebrity who ages similarly. Provide: top 3 celebrity matches with similarity scores, side-by-side aging comparison predictions, what aging traits they share, and fun facts about how those celebrities maintain their appearance. Format with markdown.`,
      anti_aging: `You are a premium AI anti-aging coach. The user is ${age} years old. Based on their description: "${prompt}", create a comprehensive personalized anti-aging plan including: daily skincare routine (morning & night), weekly treatments, dietary recommendations, exercise plan, supplement suggestions, sleep optimization, stress management techniques, and a 90-day improvement timeline. Format with markdown headers and detailed steps.`,
      healthy_comparison: `You are an AI aging comparison specialist. The user is ${age} years old. Based on their description: "${prompt}", provide a dramatic comparison of how they will look in 10, 20, and 30 years under two scenarios: (1) Optimal healthy lifestyle, and (2) Unhealthy lifestyle with poor habits. Include detailed descriptions of skin quality, facial features, energy levels, and overall appearance for each scenario. Format with markdown.`,
      skin_routine: `You are an AI skincare routine specialist. The user is ${age} years old. Based on their skin description: "${prompt}", create a complete personalized skincare regimen including: morning routine (5-7 steps), evening routine (5-7 steps), weekly treatments, monthly treatments, product recommendations by category, ingredient do's and don'ts, seasonal adjustments, and expected results timeline. Format with markdown.`,
      age_reversal: `You are a science-backed AI age reversal specialist. The user is ${age} years old. Based on their description: "${prompt}", provide the top evidence-based strategies to reverse visible aging signs including: scientifically proven treatments, lifestyle modifications with impact scores, dietary interventions, exercise protocols, sleep optimization, stress reduction techniques, and emerging anti-aging technologies. Include references to studies. Format with markdown.`,
    };

    const systemPrompt = prompts[action] || prompts.age_progression;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${openaiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenAI error:", errText);
      throw new Error("AI processing failed");
    }

    const aiData = await response.json();
    const result = aiData.choices?.[0]?.message?.content || "No result";

    // Deduct credits
    await supabase.from("ai_credits").update({ credits_remaining: remaining - cost }).eq("user_id", user.id);

    return new Response(JSON.stringify({ result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("future-face-ai error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
