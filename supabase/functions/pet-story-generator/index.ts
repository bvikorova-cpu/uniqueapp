import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { pets, genre, setting } = await req.json();
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY not configured");

    const petDescriptions = pets.map((p: any) => `${p.name} (Level ${p.level} ${p.species})`).join(", ");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a creative storyteller for virtual pet adventures. Write engaging, immersive short stories (500-800 words) featuring the user's pets as main characters. Include dialogue, action scenes, and character development. Make each pet's species and level relevant to the story." },
          { role: "user", content: `Write a ${genre} story starring: ${petDescriptions}.${setting ? ` Setting: ${setting}.` : ""} Make it exciting and unique!` }
        ],
      }),
    });

    if (!response.ok) throw new Error(`AI error: ${response.status}`);

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content || "No story generated";

    return new Response(JSON.stringify({ result }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
