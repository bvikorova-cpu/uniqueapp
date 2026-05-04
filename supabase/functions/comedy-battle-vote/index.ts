import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const COST = 10;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new Response(JSON.stringify({ error: "No auth" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: { user } } = await admin.auth.getUser(authHeader.replace("Bearer ", ""));
    if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { battleId, participantId } = await req.json();
    if (!battleId || !participantId) return new Response(JSON.stringify({ error: "battleId and participantId required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { data: cur } = await admin.from("comedy_currency").select("coins").eq("user_id", user.id).maybeSingle();
    const balance = cur?.coins ?? 0;
    if (balance < COST) return new Response(JSON.stringify({ error: "Insufficient coins", required: COST, balance }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { error: vErr } = await admin.from("battle_votes")
      .insert({ battle_id: battleId, participant_id: participantId, user_id: user.id, vote_cost_coins: COST });
    if (vErr) {
      if (vErr.code === "23505") return new Response(JSON.stringify({ error: "Already voted" }), { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw vErr;
    }

    await admin.from("comedy_currency").update({ coins: balance - COST }).eq("user_id", user.id);

    const { data: p } = await admin.from("battle_participants").select("vote_count").eq("id", participantId).maybeSingle();
    await admin.from("battle_participants").update({ vote_count: (p?.vote_count ?? 0) + 1 }).eq("id", participantId);

    return new Response(JSON.stringify({ success: true, balance: balance - COST }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
