import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SCRIPTS = [
  "Round 1: Your clone opened with a devastating quantum-physics pun.\nRound 2: Knockout blow with a metaphor about AI consciousness.",
  "Round 1: Both clones traded witty observations.\nRound 2: Opponent sealed it with a brilliantly timed comeback.",
  "Round 1: Your clone dominated with an eloquent monologue.\nRound 2: Natural charm and wit won the crowd. Flawless victory!",
  "Round 1: Opponent disarmed your clone with unexpected warmth.\nRound 2: Consistency earned them the edge. A worthy adversary!",
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new Response(JSON.stringify({ error: "No auth" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: { user } } = await admin.auth.getUser(authHeader.replace("Bearer ", ""));
    if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { data: mine } = await admin.from("personality_clones")
      .select("id, clone_name").eq("user_id", user.id).eq("is_active", true).limit(1);
    if (!mine?.length) return new Response(JSON.stringify({ error: "No active clone" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { data: opp } = await admin.from("personality_clones")
      .select("id, clone_name").neq("user_id", user.id).eq("is_active", true).limit(50);
    const opponent = opp?.length ? opp[Math.floor(Math.random() * opp.length)] : { id: null, clone_name: "Mystery Bot" };

    const winnerSide = Math.random() < 0.5 ? "user" : "opponent";
    const analysis = SCRIPTS[Math.floor(Math.random() * SCRIPTS.length)];
    const winnerName = winnerSide === "user" ? mine[0].clone_name : opponent.clone_name;

    await admin.from("clone_battles").insert({
      user_id: user.id,
      user_clone_id: mine[0].id,
      opponent_clone_id: opponent.id,
      winner: winnerSide,
      user_clone_name: mine[0].clone_name,
      opponent_clone_name: opponent.clone_name,
      analysis,
    });

    return new Response(JSON.stringify({ winner: winnerName, winnerSide, analysis }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
