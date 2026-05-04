import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const COST = 10;

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

    const { characterIds } = await req.json();
    if (!characterIds?.length || characterIds.length < 2) return j({ error: "At least 2 characters required" }, 400);

    const { data: characters } = await admin
      .from("characters")
      .select("id, name, hp, attack, defense, level, wins, losses")
      .in("id", characterIds);

    const rounds: any[] = [];
    let remaining = [...(characters || [])];
    while (remaining.length > 1) {
      remaining.sort(() => Math.random() - 0.5);
      const eliminated = remaining.pop()!;
      rounds.push({ eliminated: eliminated.name, remainingCount: remaining.length });
    }
    const winner = remaining[0];

    if (winner) {
      await admin.from("characters").update({ wins: (winner.wins ?? 0) + 1 }).eq("id", winner.id);
    }

    await admin
      .from("character_credits")
      .update({ credits_remaining: balance - COST })
      .eq("user_id", user.id)
      .eq("credits_remaining", balance);

    return j({
      winner: winner ? { id: winner.id, name: winner.name } : null,
      rounds,
      totalFighters: characterIds.length,
      creditsRemaining: balance - COST,
    });
  } catch (e) {
    return j({ error: e instanceof Error ? e.message : String(e) }, 500);
  }
});

function j(b: unknown, s = 200) {
  return new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
