import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { pets } = await req.json();
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY not configured");

    const petDescriptions = pets.map((p: any) => `${p.name} (${p.species}, Lv${p.level}, H:${p.happiness}, E:${p.energy}, ${p.battleWins || 0}W/${p.battleLosses || 0}L)`).join("\n");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a virtual pet battle strategist. Analyze the team and provide: 1) Optimal battle order/formation, 2) Team synergies & weaknesses, 3) Pre-battle preparation checklist, 4) Power score analysis vs typical AI opponents, 5) Win probability estimate, 6) Specific tactics for each pet, 7) Counter-strategies for common opponent types. Be strategic and actionable." },
          { role: "user", content: `Analyze battle team:\n${petDescriptions}\n\nProvide optimal strategy for AI arena battles.` }
        ],
      }),
    });
    if (!response.ok) throw new Error(`AI error: ${response.status}`);
    const data = await response.json();
    return new Response(JSON.stringify({ result: data.choices?.[0]?.message?.content || "No strategy generated" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
