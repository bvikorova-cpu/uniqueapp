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

    const { entryId } = await req.json();
    if (!entryId) return new Response(JSON.stringify({ error: "entryId required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { error: vErr } = await admin.from("fashion_battle_votes")
      .insert({ entry_id: entryId, voter_id: user.id });
    if (vErr) {
      if (vErr.code === "23505") return new Response(JSON.stringify({ error: "Already voted" }), { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw vErr;
    }

    const { data: row } = await admin.from("fashion_battle_entries").select("vote_count").eq("id", entryId).maybeSingle();
    const newCount = (row?.vote_count ?? 0) + 1;
    await admin.from("fashion_battle_entries").update({ vote_count: newCount }).eq("id", entryId);

    return new Response(JSON.stringify({ success: true, vote_count: newCount }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
