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

    const { style, occasion, colors, shape } = await req.json();

    const { data: credits } = await supabase
      .from("ai_credits").select("credits_remaining").eq("user_id", user.id).single();

    if (!credits || credits.credits_remaining < 5) {
      throw new Error("Insufficient credits. You need 5 credits for nail art design.");
    }

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OpenAI API key not configured");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a professional nail art designer. Create detailed nail art designs. Return JSON." },
          {
            role: "user",
            content: `Design a nail art set with these preferences:
Style: ${style}
Occasion: ${occasion || "Everyday"}
Preferred Colors: ${colors?.join(", ") || "Any"}
Nail Shape: ${shape || "Almond"}

Return JSON:
{
  "designName": "creative name",
  "description": "detailed visual description",
  "nailByNail": [
    {"finger": "Thumb", "design": "detailed description", "colors": ["#hex1"], "technique": "technique used"},
    {"finger": "Index", "design": "...", "colors": ["#hex1"], "technique": "..."},
    {"finger": "Middle", "design": "...", "colors": ["#hex1"], "technique": "..."},
    {"finger": "Ring", "design": "...", "colors": ["#hex1"], "technique": "..."},
    {"finger": "Pinky", "design": "...", "colors": ["#hex1"], "technique": "..."}
  ],
  "productsNeeded": [{"product": "name", "brand": "suggestion", "priceRange": "$X-$Y"}],
  "difficulty": "Beginner/Intermediate/Advanced",
  "estimatedTime": "X minutes",
  "proTips": ["tip1", "tip2"],
  "trendingScore": 1-10
}`
          }
        ],
        temperature: 0.8,
        response_format: { type: "json_object" }
      })
    });

    const aiData = await response.json();
    const design = JSON.parse(aiData.choices[0].message.content);

    await supabase.from("ai_credits").update({
      credits_remaining: credits.credits_remaining - 5,
      last_used_at: new Date().toISOString()
    }).eq("user_id", user.id);

    await supabase.from("beauty_nail_designs").insert({
      user_id: user.id, style, occasion, colors: colors || [],
      design_description: JSON.stringify(design), credits_used: 5
    });

    await supabase.from("ai_usage_history").insert({
      user_id: user.id, usage_type: "beauty_nail_art", credits_used: 5,
      description: `Nail art design: ${style}`
    });

    return new Response(JSON.stringify({ design }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
