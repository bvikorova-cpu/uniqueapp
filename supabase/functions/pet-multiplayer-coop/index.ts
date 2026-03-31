import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { team, dungeonName, difficulty } = await req.json();
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY not configured");

    const teamDesc = team.map((p: any) => `${p.name} (Lv${p.level} ${p.species}, H:${p.happiness}, E:${p.energy})`).join(", ");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: `You are a dungeon master for a virtual pet co-op dungeon crawl. The dungeon is "${dungeonName}" (${difficulty} difficulty). Create an exciting adventure including: 1) Dungeon entrance description, 2) 3-4 rooms/encounters with unique challenges, 3) Each pet's role and contributions based on their species/stats, 4) A boss fight at the end, 5) Loot and XP rewards for each pet (be specific), 6) Team synergy assessment, 7) A dramatic conclusion. Make it 400-600 words, action-packed and tactical.` },
          { role: "user", content: `Team entering ${dungeonName}:\n${teamDesc}\n\nGenerate their dungeon adventure!` }
        ],
      }),
    });
    if (!response.ok) throw new Error(`AI error: ${response.status}`);
    const data = await response.json();
    return new Response(JSON.stringify({ result: data.choices?.[0]?.message?.content || "No adventure generated" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
