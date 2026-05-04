import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const COST = 30;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const auth = req.headers.get("Authorization");
    if (!auth) return j({ error: "Unauthorized" }, 401);

    const anon = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!);
    const { data: { user } } = await anon.auth.getUser(auth.replace("Bearer ", ""));
    if (!user) return j({ error: "Unauthorized" }, 401);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } },
    );

    const { data: row } = await admin
      .from("character_credits")
      .select("credits_remaining")
      .eq("user_id", user.id)
      .maybeSingle();
    const balance = row?.credits_remaining ?? 0;
    if (balance < COST) return j({ error: "Insufficient credits", required: COST, remaining: balance }, 402);

    const { character1Id, character2Id } = await req.json();
    if (!character1Id || !character2Id) return j({ error: "Two characters required for fusion" }, 400);

    const fusedName = `Fusion-${Date.now().toString(36).slice(-4).toUpperCase()}`;
    const stats = {
      strength: Math.floor(60 + Math.random() * 40),
      speed: Math.floor(60 + Math.random() * 40),
      intelligence: Math.floor(60 + Math.random() * 40),
      charisma: Math.floor(60 + Math.random() * 40),
    };

    await admin
      .from("character_credits")
      .update({ credits_remaining: balance - COST })
      .eq("user_id", user.id)
      .eq("credits_remaining", balance);

    return j({
      fusedCharacter: {
        name: fusedName,
        stats,
        rarity: stats.strength + stats.speed + stats.intelligence + stats.charisma > 320 ? "legendary" : "epic",
        description: "A powerful fusion warrior born from the combination of two heroes.",
      },
      sourceCharacters: [character1Id, character2Id],
      creditsRemaining: balance - COST,
    });
  } catch (e) {
    return j({ error: e instanceof Error ? e.message : String(e) }, 500);
  }
});

function j(b: unknown, s = 200) {
  return new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
