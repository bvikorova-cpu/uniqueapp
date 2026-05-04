import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const COST = 2;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const auth = req.headers.get("Authorization");
    if (!auth) return json({ error: "Unauthorized" }, 401);

    const anon = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    );
    const { data: { user } } = await anon.auth.getUser(auth.replace("Bearer ", ""));
    if (!user) return json({ error: "Unauthorized" }, 401);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } },
    );

    // Atomic credit check
    const { data: row } = await admin
      .from("character_credits")
      .select("credits_remaining")
      .eq("user_id", user.id)
      .maybeSingle();
    const balance = row?.credits_remaining ?? 0;
    if (balance < COST) return json({ error: "Insufficient credits", required: COST, remaining: balance }, 402);

    const { character1Id, character2Id } = await req.json();
    if (!character1Id || !character2Id) return json({ error: "Two characters required" }, 400);

    const { data: chars } = await admin
      .from("characters")
      .select("id, name, hp, attack, defense, level, wins, losses, user_id")
      .in("id", [character1Id, character2Id]);
    if (!chars || chars.length < 2) return json({ error: "Characters not found" }, 404);

    const c1 = chars.find((c: any) => c.id === character1Id)!;
    const c2 = chars.find((c: any) => c.id === character2Id)!;

    // Deterministic-ish battle simulation
    const score = (c: any) =>
      (c.hp ?? 100) + (c.attack ?? 50) * 1.5 + (c.defense ?? 50) + (c.level ?? 1) * 10 + Math.random() * 60;
    const s1 = score(c1);
    const s2 = score(c2);
    const winner = s1 >= s2 ? c1 : c2;
    const loser = s1 >= s2 ? c2 : c1;

    const rounds = Array.from({ length: 5 }, (_, i) => ({
      round: i + 1,
      attacker: i % 2 === 0 ? winner.name : loser.name,
      damage: Math.floor(15 + Math.random() * 30),
    }));

    // Update stats
    await admin.from("characters").update({ wins: (winner.wins ?? 0) + 1 }).eq("id", winner.id);
    await admin.from("characters").update({ losses: (loser.losses ?? 0) + 1 }).eq("id", loser.id);

    // Record battle
    await admin.from("character_battles").insert({
      character1_id: c1.id,
      character2_id: c2.id,
      winner_id: winner.id,
      battle_log: { rounds, score1: s1, score2: s2 },
      created_by: user.id,
    }).select().maybeSingle();

    // Deduct credits (optimistic)
    await admin
      .from("character_credits")
      .update({ credits_remaining: balance - COST })
      .eq("user_id", user.id)
      .eq("credits_remaining", balance);

    return json({
      winner: { id: winner.id, name: winner.name },
      loser: { id: loser.id, name: loser.name },
      rounds,
      creditsRemaining: balance - COST,
    });
  } catch (e) {
    console.error(e);
    return json({ error: e instanceof Error ? e.message : String(e) }, 500);
  }
});

function json(b: unknown, status = 200) {
  return new Response(JSON.stringify(b), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
