import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { pet1, pet2 } = await req.json();
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY not configured");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a virtual pet genetics expert. Analyze breeding compatibility and provide: 1) Compatibility score (0-100%), 2) Predicted offspring species/traits, 3) Potential rare mutations, 4) Genetic strengths & weaknesses, 5) Optimal breeding timing, 6) Offspring stat predictions, 7) Rarity probability assessment. Be scientific yet fun." },
          { role: "user", content: `Check compatibility:\nPet 1: ${pet1.name} (${pet1.species}, Lv${pet1.level}, H:${pet1.happiness}, E:${pet1.energy})\nPet 2: ${pet2.name} (${pet2.species}, Lv${pet2.level}, H:${pet2.happiness}, E:${pet2.energy})` }
        ],
      }),
    });
    if (!response.ok) throw new Error(`AI error: ${response.status}`);
    const data = await response.json();
    return new Response(JSON.stringify({ result: data.choices?.[0]?.message?.content || "No report generated" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
