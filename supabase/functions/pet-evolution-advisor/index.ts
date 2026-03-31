import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { petName, species, level, happiness, energy, hunger, experience, battleWins, battleLosses, strategy } = await req.json();
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY not configured");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are an expert virtual pet evolution advisor. Provide detailed evolution path analysis including: potential evolution forms (3-5 stages), stat requirements for each form, recommended training activities, estimated time to reach each evolution, special conditions for rare mutations, and elemental advantages. Be creative, specific, and engaging. Use emojis sparingly for visual appeal." },
          { role: "user", content: `Analyze evolution paths for: Pet: ${petName}, Species: ${species}, Level: ${level}, Happiness: ${happiness}%, Energy: ${energy}%, Hunger: ${hunger}%, XP: ${experience}, Battles: ${battleWins}W/${battleLosses}L. Strategy: ${strategy}` }
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
