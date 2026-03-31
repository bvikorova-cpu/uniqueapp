import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { petName, species, level, happiness, energy, hunger } = await req.json();
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY not configured");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are an expert virtual pet personality coach. Analyze the pet's stats and provide: 1) Personality type assessment, 2) Optimal daily care routine, 3) Training tips to boost stats, 4) Predicted evolution path, 5) Bonding activities. Be fun, engaging and specific." },
          { role: "user", content: `Analyze my pet:\nName: ${petName}\nSpecies: ${species}\nLevel: ${level}\nHappiness: ${happiness}/100\nEnergy: ${energy}/100\nHunger: ${hunger}/100\n\nProvide a detailed personality analysis and care plan.` }
        ],
      }),
    });

    if (!response.ok) {
      const t = await response.text();
      console.error("OpenAI error:", response.status, t);
      throw new Error(`AI error: ${response.status}`);
    }

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content || "No analysis generated";

    return new Response(JSON.stringify({ result }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
