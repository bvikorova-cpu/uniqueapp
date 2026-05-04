import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new Response(JSON.stringify({ error: "No auth" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: { user } } = await admin.auth.getUser(authHeader.replace("Bearer ", ""));
    if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { interpretationId } = await req.json();
    if (!interpretationId) return new Response(JSON.stringify({ error: "interpretationId required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { error: voteErr } = await admin.from("dream_battle_votes")
      .insert({ interpretation_id: interpretationId, voter_id: user.id });
    if (voteErr) {
      if (voteErr.code === "23505") return new Response(JSON.stringify({ error: "Already voted" }), { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw voteErr;
    }

    const { data: row } = await admin.from("dream_battle_interpretations").select("votes").eq("id", interpretationId).maybeSingle();
    const newVotes = (row?.votes ?? 0) + 1;
    await admin.from("dream_battle_interpretations").update({ votes: newVotes }).eq("id", interpretationId);

    return new Response(JSON.stringify({ success: true, votes: newVotes }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
