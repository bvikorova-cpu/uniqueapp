import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { petName, species, birthMonth, birthDay } = await req.json();
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("Missing API key");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a mystical pet astrologer. Return JSON with: zodiac_sign, zodiac_emoji, element (Fire/Water/Earth/Air), ruling_planet, personality (2-3 sentences), daily_horoscope (today's prediction), compatibility (which zodiac pet signs are most compatible), lucky_traits (lucky color, number, day), battle_prediction (combat fortune), cosmic_advice (mystical guidance for the owner)." },
          { role: "user", content: `Generate a horoscope for ${petName} the ${species}, born on ${birthMonth} ${birthDay}. Make it magical and species-appropriate.` },
        ],
        temperature: 0.9,
      }),
    });

    const result = await response.json();
    const content = result.choices[0].message.content;
    const parsed = JSON.parse(content.replace(/```json\n?|\n?```/g, "").trim());

    return new Response(JSON.stringify(parsed), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
