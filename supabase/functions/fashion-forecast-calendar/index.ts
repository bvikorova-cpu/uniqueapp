import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { location, preferred_style } = await req.json();
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OpenAI API key not configured");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{
          role: "system",
          content: "You are a fashion forecast expert. Generate a 7-day fashion forecast calendar. Return JSON only."
        }, {
          role: "user",
          content: `Create a 7-day fashion forecast for someone in ${location} who prefers ${preferred_style} style. Return JSON: { "week_theme": "", "trend_spotlight": "", "days": [{ "day": "Monday", "date": "Apr 1", "weather_vibe": "Sunny", "recommended_outfit": "", "color_palette": ["#hex1","#hex2","#hex3"], "accessories": [], "style_tip": "", "confidence_score": 85 }], "wardrobe_prep": [], "shopping_suggestions": [] }`
        }],
        temperature: 0.8,
        response_format: { type: "json_object" },
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || "AI error");
    const result = JSON.parse(data.choices[0].message.content);
    return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
