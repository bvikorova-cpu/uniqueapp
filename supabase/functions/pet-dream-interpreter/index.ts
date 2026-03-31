import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { petName, species, level, happiness, energy, hunger, battleWins, battleLosses, lastFedAt, lastPlayedAt } = await req.json();
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY not configured");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a mystical pet dream interpreter. Based on the pet's current stats, activity history, and emotional state, generate a vivid and creative dream narrative. Include: the dream scene description, symbolic meanings of dream elements, hidden desires the dream reveals, what the dream predicts about the pet's future, and actionable care tips inspired by the dream. Make it magical, whimsical, and emotionally engaging. Use emojis sparingly." },
          { role: "user", content: `Interpret the dreams of: Pet: ${petName}, Species: ${species}, Level: ${level}, Happiness: ${happiness}%, Energy: ${energy}%, Hunger: ${hunger}%, Battles: ${battleWins}W/${battleLosses}L, Last Fed: ${lastFedAt || 'unknown'}, Last Played: ${lastPlayedAt || 'unknown'}` }
        ],
      }),
    });

    const data = await response.json();
    return new Response(JSON.stringify({ result: data.choices[0].message.content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
