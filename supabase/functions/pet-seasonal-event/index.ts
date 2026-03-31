import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { petName, species, level, happiness, energy, seasonName, seasonId } = await req.json();
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY not configured");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: `You are the narrator of a virtual pet ${seasonName} seasonal event. Create an immersive seasonal adventure including: 1) A unique seasonal quest tailored to the pet, 2) Challenges and obstacles faced, 3) Special seasonal items discovered, 4) XP and rewards earned (be specific with numbers), 5) A seasonal transformation or temporary power-up, 6) A memorable climax moment. Make it 300-500 words, festive, exciting, and relevant to the ${seasonId} season.` },
          { role: "user", content: `Pet joining the ${seasonName}:\nName: ${petName} (Level ${level} ${species})\nHappiness: ${happiness}/100, Energy: ${energy}/100\n\nGenerate their seasonal adventure!` }
        ],
      }),
    });
    if (!response.ok) throw new Error(`AI error: ${response.status}`);
    const data = await response.json();
    return new Response(JSON.stringify({ result: data.choices?.[0]?.message?.content || "No event generated" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
