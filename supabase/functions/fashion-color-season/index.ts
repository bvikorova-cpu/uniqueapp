import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { skin_tone, hair_color, eye_color, undertone } = await req.json();
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OpenAI API key not configured");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{
          role: "system",
          content: "You are an expert color analyst specializing in seasonal color analysis for fashion. Return JSON only."
        }, {
          role: "user",
          content: `Perform seasonal color analysis for: skin tone=${skin_tone}, hair=${hair_color}, eyes=${eye_color}, undertone=${undertone}. Return JSON: { "season": "Spring/Summer/Autumn/Winter", "sub_season": "e.g. Deep Winter", "description": "", "best_colors": [{"name":"","hex":"#hex","usage":""}], "avoid_colors": [{"name":"","hex":"#hex","reason":""}], "metal_preference": "Gold/Silver/Rose Gold", "best_neutrals": [{"name":"","hex":"#hex"}], "makeup_palette": [{"category":"Lips","shades":[]}], "celebrity_examples": [], "wardrobe_essentials": [], "color_combinations": [{"combo":["#hex1","#hex2","#hex3"],"occasion":""}] }`
        }],
        temperature: 0.7,
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
