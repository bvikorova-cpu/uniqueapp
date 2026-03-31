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
          { role: "system", content: "You are a virtual pet emotional intelligence expert. Analyze the pet's emotional state and provide: 1) Current mood assessment (with emoji indicator), 2) Emotional health score (0-100), 3) Stress indicators, 4) Happiness triggers identified, 5) Recommended mood-boosting activities, 6) Behavioral pattern analysis based on activity history, 7) Social needs assessment. Be empathetic and specific." },
          { role: "user", content: `Analyze emotional state:\nPet: ${petName} (${species})\nLevel: ${level}\nHappiness: ${happiness}/100\nEnergy: ${energy}/100\nHunger: ${hunger}/100\nBattle Record: ${battleWins || 0}W / ${battleLosses || 0}L\nLast Fed: ${lastFedAt || 'Unknown'}\nLast Played: ${lastPlayedAt || 'Unknown'}` }
        ],
      }),
    });
    if (!response.ok) throw new Error(`AI error: ${response.status}`);
    const data = await response.json();
    return new Response(JSON.stringify({ result: data.choices?.[0]?.message?.content || "No analysis generated" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
