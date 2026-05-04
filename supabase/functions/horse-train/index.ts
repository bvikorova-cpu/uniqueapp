import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TRAINING_COST = 20;
const STAT_INCREASE = 5;
const VALID_STATS = ["speed", "stamina", "acceleration", "temperament"] as const;

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

    const { horseId, statType } = await req.json();
    if (!horseId || !VALID_STATS.includes(statType)) return json({ error: "Invalid input" }, 400);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: horse } = await admin.from("horses").select("*").eq("id", horseId).maybeSingle();
    if (!horse || horse.user_id !== user.id) return json({ error: "Horse not yours" }, 403);

    const { data: cur } = await admin.from("horse_currency").select("coins")
      .eq("user_id", user.id).maybeSingle();
    if (!cur || cur.coins < TRAINING_COST) return json({ error: "Insufficient coins" }, 400);

    const { data: deducted } = await admin.from("horse_currency")
      .update({ coins: cur.coins - TRAINING_COST })
      .eq("user_id", user.id).eq("coins", cur.coins).select().maybeSingle();
    if (!deducted) return json({ error: "Concurrent modification, retry" }, 409);

    const statField = `${statType}_stat`;
    const newValue = Math.min((horse[statField] || 0) + STAT_INCREASE, 100);
    const newXP = (horse.experience || 0) + 10;
    const newLevel = Math.floor(newXP / 100) + 1;

    const { error: uErr } = await admin.from("horses")
      .update({ [statField]: newValue, experience: newXP, level: newLevel })
      .eq("id", horseId);

    if (uErr) {
      await admin.from("horse_currency").update({ coins: cur.coins }).eq("user_id", user.id);
      throw uErr;
    }

    return json({ statType, newValue });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
