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

    const { battleId, participantId, voteType } = await req.json();
    if (!battleId || !participantId) throw new Error("battleId and participantId required");
    const vt = voteType === "dislike" ? "dislike" : "like";

    const { data: battle, error: be } = await supabase
      .from("kitchen_battles").select("id, status, deadline").eq("id", battleId).single();
    if (be || !battle) throw new Error("Battle not found");
    if (battle.status !== "open") throw new Error("Battle is closed");
    if (new Date(battle.deadline) < new Date()) throw new Error("Battle deadline passed");

    const { data: part, error: pe } = await supabase
      .from("kitchen_battle_participants")
      .select("id, user_id, vote_count, dislike_count, battle_id")
      .eq("id", participantId).single();
    if (pe || !part) throw new Error("Participant not found");
    if (part.battle_id !== battleId) throw new Error("Mismatch");
    if (part.user_id === user.id) throw new Error("Cannot vote for yourself");

    const { data: existing } = await supabase
      .from("kitchen_battle_votes")
      .select("id, participant_id, vote_type")
      .eq("battle_id", battleId).eq("voter_id", user.id).maybeSingle();

    if (existing && existing.participant_id === participantId && existing.vote_type === vt) {
      throw new Error("You already cast this vote");
    }

    // Decrement previous vote if any
    if (existing) {
      const prevField = existing.vote_type === "like" ? "vote_count" : "dislike_count";
      const { data: prevPart } = await supabase
        .from("kitchen_battle_participants")
        .select(`id, ${prevField}`).eq("id", existing.participant_id).single();
      if (prevPart) {
        await supabase.from("kitchen_battle_participants")
          .update({ [prevField]: Math.max(0, ((prevPart as any)[prevField] || 0) - 1) })
          .eq("id", existing.participant_id);
      }
      await supabase.from("kitchen_battle_votes").delete().eq("id", existing.id);
    }

    const { error: ve } = await supabase.from("kitchen_battle_votes").insert({
      battle_id: battleId, participant_id: participantId, voter_id: user.id, vote_type: vt,
    });
    if (ve) throw ve;

    const field = vt === "like" ? "vote_count" : "dislike_count";
    const current = vt === "like" ? part.vote_count : part.dislike_count;
    await supabase.from("kitchen_battle_participants")
      .update({ [field]: (current || 0) + 1 })
      .eq("id", participantId);

    return new Response(JSON.stringify({ success: true, voteType: vt }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200,
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400,
    });
  }
});
