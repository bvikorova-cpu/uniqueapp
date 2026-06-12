import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const calcPower = (p: any) =>
  (p.level || 1) * 10 +
  Math.floor((p.happiness || 50) / 2) +
  Math.floor((p.energy || 50) / 2);

const xpToNext = (level: number) => level * 10;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Unauthorized" }, 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const admin = createClient(supabaseUrl, serviceKey);

    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) return json({ error: "Unauthorized" }, 401);
    const userId = userData.user.id;

    const body = await req.json().catch(() => ({}));
    const myPetIds: string[] = Array.isArray(body?.myPetIds) ? body.myPetIds : [];
    const battleType: string = body?.battleType === "pvp" ? "pvp" : "ai";

    if (myPetIds.length < 1 || myPetIds.length > 4)
      return json({ error: "Select 1-4 pets" }, 400);

    // Load and validate ownership
    const { data: myPets, error: petsErr } = await admin
      .from("pets")
      .select("*, pet_types(name, species)")
      .in("id", myPetIds)
      .eq("user_id", userId);

    if (petsErr) return json({ error: petsErr.message }, 500);
    if (!myPets || myPets.length !== myPetIds.length)
      return json({ error: "Invalid pets" }, 400);

    const myTeamPower = myPets.reduce((s, p) => s + calcPower(p), 0);

    // AI opponent: generate per-pet enemies with ~80-120% of each pet's power
    const opponentTeam = myPets.map((p) => {
      const power = Math.round(calcPower(p) * (0.8 + Math.random() * 0.4));
      const level = Math.max(1, Math.round(power / 12));
      const names = ["Shadow", "Rogue", "Blaze", "Frost", "Storm", "Venom", "Thorn", "Echo"];
      return {
        name: names[Math.floor(Math.random() * names.length)] + " " + (p.pet_types?.species || "Beast"),
        power,
        level,
      };
    });
    const opponentPower = opponentTeam.reduce((s, o) => s + o.power, 0);

    // Per-pet duels with small randomness
    const battleLog = myPets.map((p, i) => {
      const myRoll = calcPower(p) * (0.85 + Math.random() * 0.3);
      const oppRoll = opponentTeam[i].power * (0.85 + Math.random() * 0.3);
      return {
        myPet: { name: p.name, power: calcPower(p) },
        opponent: opponentTeam[i],
        winner: myRoll >= oppRoll ? "challenger" : "opponent",
      };
    });

    const myWins = battleLog.filter((l) => l.winner === "challenger").length;
    const isWinner = myWins > battleLog.length / 2;
    const xpEarned = isWinner
      ? 25 + Math.floor(Math.random() * 16)
      : 10 + Math.floor(Math.random() * 11);
    const xpPerPet = Math.max(1, Math.floor(xpEarned / myPets.length));

    // Update each pet: XP, level-up, win/loss counters, energy cost
    for (const p of myPets) {
      let newXP = (p.experience || 0) + xpPerPet;
      let newLevel = p.level || 1;
      while (newXP >= xpToNext(newLevel)) {
        newXP -= xpToNext(newLevel);
        newLevel += 1;
      }
      await admin
        .from("pets")
        .update({
          experience: newXP,
          level: newLevel,
          energy: Math.max(0, (p.energy || 50) - 15),
          battle_wins: (p.battle_wins || 0) + (isWinner ? 1 : 0),
          battle_losses: (p.battle_losses || 0) + (isWinner ? 0 : 1),
          last_activity_at: new Date().toISOString(),
        })
        .eq("id", p.id);
    }

    // Record battle
    await admin.from("pet_battles").insert({
      challenger_id: userId,
      challenger_pets: myPetIds,
      challenger_power: myTeamPower,
      opponent_id: null,
      opponent_pets: [],
      opponent_power: opponentPower,
      winner_id: isWinner ? userId : null,
      xp_earned: xpEarned,
      battle_type: battleType,
      battle_log: battleLog,
    });

    return json({
      isWinner,
      myTeamPower,
      opponentPower,
      xpEarned,
      battleLog,
    });
  } catch (e: any) {
    console.error("battle-pets error:", e);
    return json({ error: e?.message || "Internal error" }, 500);
  }
});
