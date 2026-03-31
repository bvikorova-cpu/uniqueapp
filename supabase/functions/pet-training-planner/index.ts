import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { petName, species, level, happiness, energy, hunger, experience, goal, battleWins, battleLosses } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are an expert virtual pet training strategist. Create detailed, actionable training plans. Provide: 1) 7-day daily schedule with specific activities, 2) Priority actions for the chosen goal, 3) XP optimization tips, 4) Energy management strategy, 5) Milestone targets with expected timelines, 6) Rest/recovery schedule, 7) Game recommendations for max XP. Format with clear sections and bullet points." },
          { role: "user", content: `Create training plan:\nGoal: ${goal}\nPet: ${petName} (${species})\nLevel: ${level}, XP: ${experience}\nHappiness: ${happiness}/100, Energy: ${energy}/100, Hunger: ${hunger}/100\nBattle Record: ${battleWins || 0}W/${battleLosses || 0}L` }
        ],
      }),
    });
    if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limited" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (response.status === 402) return new Response(JSON.stringify({ error: "Payment required" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (!response.ok) throw new Error("AI gateway error");
    const data = await response.json();
    return new Response(JSON.stringify({ result: data.choices?.[0]?.message?.content || "No plan generated" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
