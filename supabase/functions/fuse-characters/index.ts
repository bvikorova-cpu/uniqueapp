import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { character1Id, character2Id } = await req.json();
    if (!character1Id || !character2Id) throw new Error("Two characters required for fusion");

    const fusedName = `Fusion-${Date.now().toString(36).slice(-4).toUpperCase()}`;
    const stats = {
      strength: Math.floor(60 + Math.random() * 40),
      speed: Math.floor(60 + Math.random() * 40),
      intelligence: Math.floor(60 + Math.random() * 40),
      charisma: Math.floor(60 + Math.random() * 40),
    };

    return new Response(JSON.stringify({
      fusedCharacter: {
        name: fusedName,
        stats,
        rarity: stats.strength + stats.speed + stats.intelligence + stats.charisma > 320 ? "legendary" : "epic",
        description: `A powerful fusion warrior born from the combination of two heroes.`,
      },
      sourceCharacters: [character1Id, character2Id],
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
