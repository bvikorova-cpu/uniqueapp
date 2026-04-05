import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { dungeonId, characterIds } = await req.json();

    const dungeons: Record<string, any> = {
      "crystal-caves": { name: "Crystal Caves", difficulty: 1, baseReward: 50 },
      "shadow-fortress": { name: "Shadow Fortress", difficulty: 2, baseReward: 100 },
      "dragon-lair": { name: "Dragon's Lair", difficulty: 3, baseReward: 200 },
      "void-realm": { name: "Void Realm", difficulty: 4, baseReward: 350 },
      "celestial-tower": { name: "Celestial Tower", difficulty: 5, baseReward: 500 },
    };

    const dungeon = dungeons[dungeonId] || { name: "Unknown Dungeon", difficulty: 1, baseReward: 50 };
    const partyPower = characterIds.length * 25 + Math.random() * 50;
    const requiredPower = dungeon.difficulty * 30;
    const victory = partyPower > requiredPower;

    const encounters = Array.from({ length: dungeon.difficulty + 1 }, (_, i) => ({
      round: i + 1,
      enemy: ["Goblin", "Skeleton", "Ogre", "Dark Mage", "Dragon"][Math.min(i, 4)],
      survived: i < dungeon.difficulty || victory,
    }));

    return new Response(JSON.stringify({
      victory,
      dungeon: dungeon.name,
      encounters,
      rewards: victory ? { coins: dungeon.baseReward, xp: dungeon.baseReward * 2 } : { coins: 10, xp: 20 },
      loot: victory ? [{ name: "Enchanted Gem", rarity: "rare" }] : [],
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
