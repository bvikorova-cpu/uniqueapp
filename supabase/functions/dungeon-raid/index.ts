import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { askAIJSON } from "../_shared/unifiedAI.ts";

const corsHeaders = { "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };

/** Must stay in sync with DUNGEONS in src/components/character/AIDungeonRaids.tsx */
const DUNGEONS: Record<string, {
  name: string; boss: string; difficulty: number; cost: number; requiredPower: number; xp: [number, number];
}> = {
  goblin_cave:  { name: "Goblin Cave",   boss: "Grimtooth the Goblin King", difficulty: 1, cost: 5,  requiredPower: 260,  xp: [50, 100] },
  dragon_lair:  { name: "Dragon's Lair", boss: "Vaerothys the Emberwyrm",   difficulty: 3, cost: 10, requiredPower: 900,  xp: [200, 500] },
  shadow_realm: { name: "Shadow Realm",  boss: "Nyxaros, Warden of Shadows", difficulty: 4, cost: 15, requiredPower: 1800, xp: [500, 1500] },
  titans_forge: { name: "Titan's Forge", boss: "Ordrakh, the Molten Titan",  difficulty: 5, cost: 25, requiredPower: 3200, xp: [1000, 5000] },
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
    const dungeon = DUNGEONS[dungeonId];
    if (!dungeon) return j({ error: "Unknown dungeon" }, 400);
    if (!Array.isArray(characterIds) || characterIds.length === 0) return j({ error: "Select at least one hero" }, 400);

    // ---- Load the real party (owned by this user) --------------------------
    const { data: party } = await admin
      .from("characters")
      .select("id, name, level, hp, attack, defense, speed, special_power, experience")
      .eq("user_id", user.id)
      .in("id", characterIds.slice(0, 4));
    if (!party || party.length === 0) return j({ error: "No heroes found" }, 400);

    const { data: gear } = await admin
      .from("character_equipment")
      .select("character_id, name, boost_stat, boost_value")
      .eq("user_id", user.id)
      .in("character_id", party.map((p: any) => p.id));

    const bonusFor = (id: string, stat: string) =>
      (gear ?? []).filter((g: any) => g.character_id === id && g.boost_stat === stat)
        .reduce((s: number, g: any) => s + (g.boost_value ?? 0), 0);

    const members = party.map((c: any) => {
      const attack = (c.attack ?? 0) + bonusFor(c.id, "attack");
      const defense = (c.defense ?? 0) + bonusFor(c.id, "defense");
      const hp = (c.hp ?? 0) + bonusFor(c.id, "hp");
      const speed = (c.speed ?? 0) + bonusFor(c.id, "speed");
      const power = Math.round(attack * 1.4 + defense * 1.1 + hp * 0.35 + speed * 0.8 + (c.level ?? 1) * 10);
      return { id: c.id, name: c.name, level: c.level ?? 1, attack, defense, hp, speed, power,
        gearCount: (gear ?? []).filter((g: any) => g.character_id === c.id).length,
        special_power: c.special_power, experience: c.experience ?? 0 };
    });

    const partyPower = members.reduce((s, m) => s + m.power, 0);
    const powerRatio = partyPower / dungeon.requiredPower;
    // Deterministic-but-fair: stronger party => higher win chance.
    const winChance = Math.max(0.05, Math.min(0.95, powerRatio * 0.7));
    const roll = Math.random();
    const victory = roll < winChance;

    // ---- Credits: check, deduct, ledger ----------------------------------
    const { data: row } = await admin
      .from("ai_credits")
      .select("credits_remaining")
      .eq("user_id", user.id)
      .maybeSingle();
    const balance = row?.credits_remaining ?? 0;
    if (balance < dungeon.cost) return j({ error: "Insufficient credits", required: dungeon.cost, remaining: balance }, 402);

    const { error: dedErr } = await admin
      .from("ai_credits")
      .update({ credits_remaining: balance - dungeon.cost, last_used_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .eq("credits_remaining", balance);
    if (dedErr) return j({ error: "Could not deduct credits, please try again" }, 409);

    await admin.from("ai_credits_ledger").insert({ user_id: user.id,
      delta: -dungeon.cost,
      balance_before: balance,
      balance_after: balance - dungeon.cost,
      reason: "dungeon_raid",
      source: "character_arena",
      metadata: { dungeon: dungeon.name, party: members.map((m) => m.name) } });

    // ---- Round-by-round simulation ---------------------------------------
    const enemyNames = ["Cave Sentry", "Bone Warden", "Ashen Brute", "Void Acolyte", dungeon.boss];
    const rounds: any[] = [];
    let partyHp = members.reduce((s, m) => s + m.hp, 0);
    const totalRounds = dungeon.difficulty + 1;
    for (let i = 0; i < totalRounds; i++) {
      const isBoss = i === totalRounds - 1;
      const attacker = members[i % members.length];
      const enemy = isBoss ? dungeon.boss : enemyNames[Math.min(i, 3)];
      const enemyPower = Math.round(dungeon.requiredPower / totalRounds * (isBoss ? 1.8 : 1));
      const damageDealt = Math.max(10, Math.round(attacker.attack * (0.8 + Math.random() * 0.6)));
      const damageTaken = Math.max(5, Math.round(enemyPower * (0.25 + Math.random() * 0.35) - attacker.defense * 0.3));
      const cleared = isBoss ? victory : damageDealt >= enemyPower * 0.5 || victory;
      partyHp = Math.max(0, partyHp - damageTaken);
      rounds.push({ round: i + 1, isBoss, enemy, hero: attacker.name, damageDealt, damageTaken, partyHpLeft: partyHp, cleared });
    }

    // ---- AI narrative -----------------------------------------------------
    let narrative = "";
    let mvp = members.slice().sort((a, b) => b.power - a.power)[0]?.name ?? "";
    try {
      const ai = await askAIJSON<{ narrative: string; mvp?: string; bossQuote?: string }>(
        "You are a fantasy dungeon master. Write vivid, concise battle reports. Return JSON only.",
        `Dungeon: ${dungeon.name} (boss: ${dungeon.boss}).
Party: ${members.map((m) => `${m.name} (Lv.${m.level}, ATK ${m.attack}, DEF ${m.defense}, HP ${m.hp}${m.special_power ? `, power: ${m.special_power}` : ""})`).join("; ")}.
Outcome: ${victory ? "VICTORY" : "DEFEAT"}.
Rounds: ${rounds.map((r) => `R${r.round} vs ${r.enemy}: ${r.hero} dealt ${r.damageDealt}, took ${r.damageTaken}`).join(" | ")}.
Return JSON: { "narrative": "4-6 sentence battle report naming the heroes and the boss, ending with the ${victory ? "victory" : "defeat"}", "mvp": "hero name", "bossQuote": "one short line the boss says" }`,
        { max_tokens: 700, temperature: 0.9 },
      );
      narrative = ai?.narrative ?? "";
      if (ai?.mvp && members.some((m) => m.name === ai.mvp)) mvp = ai.mvp!;
      var bossQuote = ai?.bossQuote ?? "";
    } catch {
      narrative = victory
        ? `${mvp} led the party through ${dungeon.name}, breaking every ambush until ${dungeon.boss} fell.`
        : `${dungeon.boss} overwhelmed the party in ${dungeon.name}. The heroes retreated, wounded but alive.`;
    }

    // ---- Rewards + XP applied to the real heroes --------------------------
    const xpTotal = victory
      ? Math.round(dungeon.xp[0] + Math.random() * (dungeon.xp[1] - dungeon.xp[0]))
      : Math.round(dungeon.xp[0] * 0.2);
    const xpEach = Math.max(1, Math.floor(xpTotal / members.length));
    for (const m of members) {
      const newXp = m.experience + xpEach;
      const newLevel = Math.max(m.level, Math.floor(newXp / 500) + 1);
      await admin.from("characters").update({ experience: newXp, level: newLevel }).eq("id", m.id).eq("user_id", user.id);
    }

    const lootTable = [
      { name: "Enchanted Gem", rarity: "rare" },
      { name: "Emberforged Plate", rarity: "epic" },
      { name: "Shadowsteel Blade", rarity: "epic" },
      { name: "Titan Core Shard", rarity: "legendary" },
    ];
    const loot = victory ? [lootTable[Math.min(dungeon.difficulty - 1, lootTable.length - 1)]] : [];

    return j({
      victory,
      dungeon: dungeon.name,
      boss: dungeon.boss,
      bossQuote: typeof bossQuote === "string" ? bossQuote : "",
      narrative,
      mvp,
      partyPower,
      requiredPower: dungeon.requiredPower,
      winChance: Math.round(winChance * 100),
      party: members.map(({ experience, ...m }) => m),
      rounds,
      rewards: { xp: xpTotal, xpEach, loot },
      creditsSpent: dungeon.cost,
      creditsRemaining: balance - dungeon.cost });
  } catch (e) {
    return j({ error: e instanceof Error ? e.message : String(e) }, 500);
  }
});

function j(b: unknown, s = 200) {
  return new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
