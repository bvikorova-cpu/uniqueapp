import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "No auth" }, 401);

    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return json({ error: "Unauthorized" }, 401);

    const { raceId, horseId, strategy } = await req.json();
    if (!raceId || !horseId || !strategy) return json({ error: "Missing fields" }, 400);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // verify horse ownership
    const { data: horse } = await admin.from("horses").select("user_id").eq("id", horseId).maybeSingle();
    if (!horse || horse.user_id !== user.id) return json({ error: "Horse not yours" }, 403);

    const { data: race } = await admin.from("races").select("entry_fee_coins,status")
      .eq("id", raceId).maybeSingle();
    if (!race) return json({ error: "Race not found" }, 404);
    if (race.status !== "waiting") return json({ error: "Race not joinable" }, 400);

    const fee = race.entry_fee_coins ?? 0;
    const { data: cur } = await admin.from("horse_currency").select("coins")
      .eq("user_id", user.id).maybeSingle();
    if (!cur || cur.coins < fee) return json({ error: "Insufficient coins" }, 400);

    // optimistic lock deduction
    const { data: deducted } = await admin.from("horse_currency")
      .update({ coins: cur.coins - fee })
      .eq("user_id", user.id).eq("coins", cur.coins).select().maybeSingle();
    if (!deducted) return json({ error: "Concurrent modification, retry" }, 409);

    const { data: part, error: pErr } = await admin.from("race_participants")
      .insert({ race_id: raceId, horse_id: horseId, user_id: user.id, strategy })
      .select().single();

    if (pErr) {
      await admin.from("horse_currency").update({ coins: cur.coins }).eq("user_id", user.id);
      const msg = pErr.message?.includes("race_participants_race_user_unique")
        ? "Already joined this race" : pErr.message;
      return json({ error: msg }, 400);
    }

    return json({ participant: part });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
