import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { species, theme, personality } = await req.json();
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY not configured");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a creative pet naming expert. Generate exactly 8 unique, creative pet names. Return ONLY a JSON array of strings, no other text." },
          { role: "user", content: `Generate 8 names for a ${species} pet.${theme ? ` Theme: ${theme}.` : ""}${personality ? ` Personality: ${personality}.` : ""} Return only JSON array.` }
        ],
      }),
    });

    if (!response.ok) throw new Error(`AI error: ${response.status}`);

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "[]";
    let names: string[];
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```/g, "").trim();
      names = JSON.parse(cleaned);
    } catch { names = content.split("\n").filter((n: string) => n.trim()).slice(0, 8); }

    return new Response(JSON.stringify({ names }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
