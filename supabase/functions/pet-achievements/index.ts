import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { petName, species, level, battlesWon } = await req.json();
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("Missing API key");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You analyze virtual pet stats and generate achievements. Return JSON with: title (pet's achievement title), rank (overall rank like 'Rising Champion'), unlocked (array of 6 achievement objects with name, emoji, description, tier (Bronze/Silver/Gold/Platinum/Diamond), progress (0-100 number)), next_milestone (what to do next to earn the next big achievement)." },
          { role: "user", content: `Analyze achievements for ${petName} the ${species}. Level: ${level}, Battles won: ${battlesWon}. Generate creative, species-specific achievements.` },
        ],
        temperature: 0.8,
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
