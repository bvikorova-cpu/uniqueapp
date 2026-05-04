import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { corsHeaders, errorResponse, jsonResponse } from "../_shared/openai.ts";
import { deductAICredits } from "../_shared/credits.ts";

// Server-side pet battle. Pets fight an AI opponent scaled to their average level.
// XP, wins/losses, energy are updated atomically with service role.
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return errorResponse("Missing authorization", 401);

    const userClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return errorResponse("Not authenticated", 401);

    const denied = await deductAICredits(user.id, 2, "battle-pets");
    if (denied) return denied;

    const { myPetIds = [], battleType = "ai" } = await req.json();
    if (!Array.isArray(myPetIds) || myPetIds.length === 0) return errorResponse("Select at least one pet", 400);
    if (myPetIds.length > 4) return errorResponse("Maximum 4 pets per battle", 400);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Load pets (must belong to user)
    const { data: pets, error: petsErr } = await admin
      .from("pets")
      .select("*")
      .in("id", myPetIds)
      .eq("user_id", user.id);
    if (petsErr) return errorResponse(petsErr.message, 500);
    if (!pets || pets.length === 0) return errorResponse("No valid pets found", 400);

    // Compute team power (level + stats)
    const teamPower = pets.reduce((sum: number, p: any) =>
      sum + (p.level || 1) * 10 + Math.floor((p.happiness || 50) / 2) + Math.floor((p.energy || 50) / 2), 0);

    // AI opponent scaled around team power (±20%)
    const aiPower = Math.floor(teamPower * (0.8 + Math.random() * 0.4));

    // Win probability from power ratio + small luck factor
    const winChance = Math.min(0.95, Math.max(0.05, teamPower / (teamPower + aiPower)));
    const isWinner = Math.random() < winChance;

    const xpEarned = isWinner ? 50 + Math.floor(Math.random() * 30) : 15 + Math.floor(Math.random() * 10);
    const xpPerPet = Math.floor(xpEarned / pets.length);

    // Update each pet
    for (const p of pets) {
      const newXP = (p.experience || 0) + xpPerPet;
      const newLevel = Math.max(p.level || 1, Math.floor(newXP / 100) + 1);
      const updates: any = {
        experience: newXP,
        level: newLevel,
        energy: Math.max(0, (p.energy || 50) - 15),
      };
      if (isWinner) updates.battle_wins = (p.battle_wins || 0) + 1;
      else updates.battle_losses = (p.battle_losses || 0) + 1;
      await admin.from("pets").update(updates).eq("id", p.id);
    }

    // Log battle (schema: challenger_id/opponent_id, challenger_pets, *_power, winner_id, xp_earned, battle_log)
    await admin.from("pet_battles").insert({
      challenger_id: user.id,
      opponent_id: null, // AI opponent
      challenger_pets: myPetIds,
      opponent_pets: [],
      challenger_power: teamPower,
      opponent_power: aiPower,
      winner_id: isWinner ? user.id : null,
      battle_type: battleType,
      xp_earned: xpEarned,
      battle_log: { ai: true, winChance: Number((teamPower / (teamPower + aiPower)).toFixed(3)) },
    });

    return jsonResponse({
      isWinner,
      xpEarned,
      teamPower,
      aiPower,
      summary: isWinner
        ? `Your team overwhelmed the opponent (${teamPower} vs ${aiPower})!`
        : `Your team fought bravely but fell (${teamPower} vs ${aiPower}).`,
    });
  } catch (e: any) {
    return errorResponse(e.message || "Battle failed");
  }
});
