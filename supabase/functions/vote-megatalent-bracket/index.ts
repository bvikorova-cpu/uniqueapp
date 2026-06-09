import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const auth = req.headers.get("Authorization");
    if (!auth) return json({ error: "Unauthorized" }, 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: auth } },
    });
    const { data: userData } = await userClient.auth.getUser();
    const user = userData.user;
    if (!user) return json({ error: "Unauthorized" }, 401);

    const body = await req.json();
    const { match_id, voted_for } = body ?? {};
    if (!match_id || !["a", "b"].includes(voted_for)) {
      return json({ error: "Invalid input" }, 400);
    }

    const admin = createClient(supabaseUrl, serviceKey);

    const { data: match, error: mErr } = await admin
      .from("megatalent_bracket_matches")
      .select("id, status, votes_a, votes_b")
      .eq("id", match_id)
      .maybeSingle();
    if (mErr || !match) return json({ error: "Match not found" }, 404);
    if (match.status !== "open") return json({ error: "Match closed" }, 400);

    const { error: voteErr } = await admin
      .from("megatalent_bracket_votes")
      .insert({ match_id, user_id: user.id, voted_for });
    if (voteErr) {
      if ((voteErr as any).code === "23505") {
        return json({ error: "Already voted" }, 409);
      }
      throw voteErr;
    }

    // Atomic increment via SECURITY DEFINER RPC (prevents lost updates from parallel votes)
    const { error: incErr } = await admin.rpc("increment_megatalent_bracket_vote", {
      p_match_id: match_id,
      p_side: voted_for,
    });
    if (incErr) throw incErr;


    return json({ success: true });
  } catch (e: any) {
    console.error(e);
    return json({ error: e?.message ?? "Server error" }, 500);
  }
});

function json(b: unknown, status = 200) {
  return new Response(JSON.stringify(b), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
