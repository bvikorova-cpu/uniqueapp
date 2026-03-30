import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) throw new Error("Unauthorized");

    const { skinType, age, concerns, currentRoutine } = await req.json();

    // Check credits
    const { data: credits } = await supabase
      .from("ai_credits")
      .select("credits_remaining")
      .eq("user_id", user.id)
      .single();

    if (!credits || credits.credits_remaining < 8) {
      throw new Error("Insufficient credits. You need 8 credits for skin analysis.");
    }

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OpenAI API key not configured");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a professional dermatologist and skincare expert. Provide detailed, personalized skin analysis and recommendations. Return JSON."
          },
          {
            role: "user",
            content: `Analyze the following skin profile and provide a comprehensive skincare routine and product recommendations:
            
Skin Type: ${skinType}
Age: ${age || "Not specified"}
Concerns: ${concerns?.join(", ") || "None specified"}
Current Routine: ${currentRoutine || "None"}

Return JSON with:
{
  "skinAssessment": "detailed assessment",
  "skinScore": 1-100,
  "morningRoutine": [{"step": 1, "product": "name", "type": "cleanser/serum/etc", "why": "reason", "application": "how to apply"}],
  "eveningRoutine": [{"step": 1, "product": "name", "type": "type", "why": "reason", "application": "how to apply"}],
  "weeklyTreatments": [{"treatment": "name", "frequency": "1x/week", "benefits": "why"}],
  "ingredientsToAvoid": ["ingredient1"],
  "ingredientsToSeek": ["ingredient1"],
  "dietaryTips": ["tip1"],
  "lifestyleTips": ["tip1"]
}`
          }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      })
    });

    const aiData = await response.json();
    const recommendations = JSON.parse(aiData.choices[0].message.content);

    // Deduct credits
    await supabase.from("ai_credits").update({
      credits_remaining: credits.credits_remaining - 8,
      last_used_at: new Date().toISOString()
    }).eq("user_id", user.id);

    // Save analysis
    await supabase.from("beauty_skin_analyses").insert({
      user_id: user.id,
      skin_type: skinType,
      concerns: concerns || [],
      routine: currentRoutine,
      recommendations,
      credits_used: 8
    });

    // Log usage
    await supabase.from("ai_usage_history").insert({
      user_id: user.id,
      usage_type: "beauty_skin_analysis",
      credits_used: 8,
      description: `Skin analysis for ${skinType} skin`
    });

    return new Response(JSON.stringify({ recommendations }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
