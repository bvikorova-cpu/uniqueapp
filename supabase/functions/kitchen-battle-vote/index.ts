import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const auth = req.headers.get("Authorization");
    if (!auth) throw new Error("No authorization");
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data: { user } } = await supabase.auth.getUser(auth.replace("Bearer ", ""));
    if (!user) throw new Error("Unauthorized");

    const { battleId, participantId } = await req.json();
    if (!battleId || !participantId) throw new Error("battleId and participantId required");

    const { data: battle, error: be } = await supabase
      .from("kitchen_battles").select("id, status, deadline").eq("id", battleId).single();
    if (be || !battle) throw new Error("Battle not found");
    if (battle.status !== "open") throw new Error("Battle is closed");
    if (new Date(battle.deadline) < new Date()) throw new Error("Battle deadline passed");

    const { data: part, error: pe } = await supabase
      .from("kitchen_battle_participants")
      .select("id, user_id, vote_count, battle_id")
      .eq("id", participantId).single();
    if (pe || !part) throw new Error("Participant not found");
    if (part.battle_id !== battleId) throw new Error("Mismatch");
    if (part.user_id === user.id) throw new Error("Cannot vote for yourself");

    const { error: ve } = await supabase.from("kitchen_battle_votes").insert({
      battle_id: battleId, participant_id: participantId, voter_id: user.id,
    });
    if (ve) {
      if (ve.code === "23505") throw new Error("You already voted in this battle");
      throw ve;
    }

    await supabase.from("kitchen_battle_participants")
      .update({ vote_count: (part.vote_count || 0) + 1 })
      .eq("id", participantId);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200,
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400,
    });
  }
});
