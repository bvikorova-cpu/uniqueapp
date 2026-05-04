import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

    const { dungeonId, characterIds } = await req.json();

    const dungeons: Record<string, { name: string; difficulty: number; baseReward: number; cost: number }> = {
      "crystal-caves":     { name: "Crystal Caves",    difficulty: 1, baseReward: 50,  cost: 5 },
      "shadow-fortress":   { name: "Shadow Fortress",  difficulty: 2, baseReward: 100, cost: 10 },
      "dragon-lair":       { name: "Dragon's Lair",    difficulty: 3, baseReward: 200, cost: 15 },
      "void-realm":        { name: "Void Realm",       difficulty: 4, baseReward: 350, cost: 20 },
      "celestial-tower":   { name: "Celestial Tower",  difficulty: 5, baseReward: 500, cost: 25 },
    };
    const dungeon = dungeons[dungeonId] || dungeons["crystal-caves"];

    const { data: row } = await admin
      .from("character_credits")
      .select("credits_remaining")
      .eq("user_id", user.id)
      .maybeSingle();
    const balance = row?.credits_remaining ?? 0;
    if (balance < dungeon.cost) return j({ error: "Insufficient credits", required: dungeon.cost, remaining: balance }, 402);

    const partyPower = (characterIds?.length || 0) * 25 + Math.random() * 50;
    const requiredPower = dungeon.difficulty * 30;
    const victory = partyPower > requiredPower;

    const encounters = Array.from({ length: dungeon.difficulty + 1 }, (_, i) => ({
      round: i + 1,
      enemy: ["Goblin", "Skeleton", "Ogre", "Dark Mage", "Dragon"][Math.min(i, 4)],
      survived: i < dungeon.difficulty || victory,
    }));

    await admin
      .from("character_credits")
      .update({ credits_remaining: balance - dungeon.cost })
      .eq("user_id", user.id)
      .eq("credits_remaining", balance);

    return j({
      victory,
      dungeon: dungeon.name,
      encounters,
      rewards: victory ? { coins: dungeon.baseReward, xp: dungeon.baseReward * 2 } : { coins: 10, xp: 20 },
      loot: victory ? [{ name: "Enchanted Gem", rarity: "rare" }] : [],
      creditsRemaining: balance - dungeon.cost,
    });
  } catch (e) {
    return j({ error: e instanceof Error ? e.message : String(e) }, 500);
  }
});

function j(b: unknown, s = 200) {
  return new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
