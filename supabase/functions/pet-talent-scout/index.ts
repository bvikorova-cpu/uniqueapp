import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { petName, species, level, happiness, energy, hunger, experience, battleWins, battleLosses } = await req.json();
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY not configured");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are an elite virtual pet talent scout. Analyze a pet's stats and history to discover hidden abilities, special moves, rare talents, and untapped potential. Provide: 1) Primary Talent Class (e.g., Elemental Mage, Shadow Assassin, Divine Healer), 2) 3-5 discovered special moves with descriptions, 3) Hidden passive abilities, 4) Talent rarity rating (Common/Uncommon/Rare/Epic/Legendary), 5) Training recommendations to unlock more talents, 6) Synergies with other pet types. Be creative and detailed." },
          { role: "user", content: `Scout talents for: Pet: ${petName}, Species: ${species}, Level: ${level}, Happiness: ${happiness}%, Energy: ${energy}%, Hunger: ${hunger}%, XP: ${experience}, Battles: ${battleWins}W/${battleLosses}L` }
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
