import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { petName, species, theme, size } = await req.json();
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("Missing API key");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You design virtual pet habitats. Return JSON with: habitat_name (creative name), description (2-3 sentences), rooms (array of 4-6 objects with name, description, bonus), special_features (array of 4-5 unique features as strings), stat_boosts (string describing which pet stats improve from living here)." },
          { role: "user", content: `Design a ${size} ${theme}-themed habitat for ${petName} the ${species}.` },
        ],
        temperature: 0.85,
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
