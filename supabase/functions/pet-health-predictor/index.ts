import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { petName, species, level, happiness, energy, hunger, experience, timeframeDays } = await req.json();
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY not configured");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a virtual pet health prediction AI. Analyze stats and predict: 1) Level progression forecast, 2) Health risk assessment, 3) Evolution probability, 4) Stat trend predictions (happiness, energy, hunger), 5) Recommended interventions, 6) Breeding readiness score. Be specific with numbers." },
          { role: "user", content: `Predict health trends for ${timeframeDays} days:\nPet: ${petName}\nSpecies: ${species}\nLevel: ${level}\nXP: ${experience}\nHappiness: ${happiness}/100\nEnergy: ${energy}/100\nHunger: ${hunger}/100` }
        ],
      }),
    });

    if (!response.ok) throw new Error(`AI error: ${response.status}`);

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content || "No prediction generated";

    return new Response(JSON.stringify({ result }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
