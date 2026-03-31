import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { mood, energy_level, context } = await req.json();
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OpenAI API key not configured");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{
          role: "system",
          content: "You are a fashion psychologist who matches outfits to moods and emotions using color therapy. Return JSON only."
        }, {
          role: "user",
          content: `Suggest outfits for mood="${mood}", energy=${energy_level}%, context="${context || 'general day'}". Return JSON: { "detected_mood": "", "mood_emoji": "😊", "mood_color": "#hex", "fashion_prescription": "", "outfits": [{"outfit_name":"","description":"","key_pieces":[],"color_palette":["#hex"],"accessories":[],"fragrance_suggestion":"","playlist_vibe":"","confidence_boost":""}], "color_therapy": [{"color":"","hex":"#hex","effect":""}], "mood_boosting_tips": [], "avoid_wearing": [] }`
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
