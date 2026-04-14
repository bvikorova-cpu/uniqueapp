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

    const { data: credits } = await supabase.from("ai_credits").select("credits_remaining").eq("user_id", user.id).single();
    const remaining = credits?.credits_remaining || 0;

    const creditCosts: Record<string, number> = {
      age_progression: 5, skin_health: 5, lifestyle_impact: 4, celebrity_match: 4,
      anti_aging: 5, healthy_comparison: 6, skin_routine: 4, age_reversal: 4,
      ar_preview: 5, before_after_timeline: 5, dermatologist_review: 6,
      dna_aging: 6, social_share: 4, seasonal_report: 5,
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
      ar_preview: `You are an advanced AI face simulation specialist. The user is ${age} years old. Based on their request: "${prompt}", provide an extremely detailed AR-style face simulation analysis. Describe precisely what the user would see with the selected aging effect applied to their face: changes to skin texture, wrinkle formation patterns, nasolabial folds, crow's feet, forehead lines, skin elasticity, pigmentation changes, under-eye changes, jawline definition, and neck area. Include a confidence score for each prediction. Provide a "Visual Impact Score" (1-100) and a timeline of when each change would typically manifest. Format with markdown headers, tables, and bullet points.`,
      before_after_timeline: `You are an AI skin improvement timeline specialist. The user is ${age} years old. Based on their current skin state: "${prompt}", create a detailed before/after improvement timeline covering: Week 1-2 (initial changes), Month 1 (early results), Month 3 (visible improvements), Month 6 (significant transformation), Year 1 (full results). For each milestone, describe: expected skin texture changes, tone improvements, wrinkle reduction progress, hydration level changes, recommended product adjustments, and a "Progress Score" (0-100). Include a personalized improvement prediction chart description. Format with markdown.`,
      dermatologist_review: `You are an AI dermatologist providing a professional-grade clinical skin assessment. The user is ${age} years old. Based on their description: "${prompt}", provide a comprehensive dermatological review including: Clinical Assessment (skin type classification using Fitzpatrick scale, condition severity rating), Diagnosis Considerations (potential skin conditions, differential diagnosis), Treatment Plan (prescription-grade recommendations, OTC alternatives, procedural recommendations like chemical peels, microneedling, laser), Risk Assessment (skin cancer risk factors, sun damage assessment, aging acceleration factors), Follow-up Plan (recommended check-up schedule, warning signs to watch), and a Professional Summary with key action items. Include medical terminology with layman explanations. Format with markdown. Add disclaimer about consulting a real dermatologist.`,
      dna_aging: `You are an AI genetic aging prediction specialist. The user is ${age} years old. Based on their genetic background: "${prompt}", provide a comprehensive DNA-based aging prediction including: Genetic Aging Profile (ethnic background impact on aging, familial aging patterns analysis), Telomere Length Estimation (predicted biological age vs chronological age, cellular aging rate), Genetic Risk Factors (collagen degradation genes, melanin production patterns, oxidative stress susceptibility), Epigenetic Clock Analysis (lifestyle impact on gene expression, environmental factors affecting genetic aging), Personalized Genetic Aging Timeline (decade-by-decade prediction based on genetic background), and DNA-Optimized Anti-Aging Plan (genetically-tailored skincare ingredients, diet for your genetic profile, exercise optimized for your DNA type). Format with markdown headers, tables, and scores.`,
      social_share: `You are an AI social media transformation card creator. The user is ${age} years old. Based on their transformation story: "${prompt}", generate a complete social media transformation card package including: Viral Caption (3 options: Instagram, TikTok, Twitter/X), Hashtag Strategy (30 trending hashtags organized by category), Transformation Story Arc (hook, journey, result, call-to-action), Visual Layout Description (before/after card design with exact text placement), Engagement Optimization Tips (best posting times, story sequence ideas), Motivational Quote (personalized to their journey), and Community Challenge Idea (to inspire others). Format with markdown and emoji.`,
      seasonal_report: `You are an AI seasonal skincare adaptation specialist. The user is ${age} years old. Based on their request: "${prompt}", create a comprehensive seasonal skin report including: Current Season Impact Analysis (how this season affects skin aging, UV index considerations, humidity impact, temperature effects), Seasonal Skincare Routine Adjustment (modified morning routine, modified evening routine, new products to add, products to remove), Seasonal Nutrition Plan (season-specific foods for skin health, hydration adjustments, supplement changes), Lifestyle Adaptations (exercise modifications, sleep schedule adjustments, indoor/outdoor balance), Season-Specific Threats (environmental pollutants, allergens, weather damage), Transition Plan (how to prepare skin for the next season), and a Seasonal Skin Health Score with improvement targets. Format with markdown.`,
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
        max_tokens: 2500,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenAI error:", errText);
      throw new Error("AI processing failed");
    }

    const aiData = await response.json();
    const result = aiData.choices?.[0]?.message?.content || "No result";

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
