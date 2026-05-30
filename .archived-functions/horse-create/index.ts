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

    const body = await req.json();
    const name = String(body?.name ?? "").trim().slice(0, 60);
    const breed = String(body?.breed ?? "").trim().slice(0, 60);
    const color = String(body?.color ?? "").trim().slice(0, 40);
    const costCoins = Math.max(0, Math.floor(Number(body?.costCoins) || 0));

    if (!name || !breed || !color) return json({ error: "Missing fields" }, 400);
    if (costCoins <= 0) return json({ error: "Invalid cost" }, 400);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Atomic deduction via conditional update
    const { data: cur, error: curErr } = await admin
      .from("horse_currency").select("coins").eq("user_id", user.id).maybeSingle();
    if (curErr) throw curErr;
    if (!cur || cur.coins < costCoins) return json({ error: "Insufficient coins" }, 400);

    const { data: deducted, error: dedErr } = await admin
      .from("horse_currency")
      .update({ coins: cur.coins - costCoins })
      .eq("user_id", user.id)
      .eq("coins", cur.coins) // optimistic lock
      .select()
      .maybeSingle();
    if (dedErr) throw dedErr;
    if (!deducted) return json({ error: "Concurrent modification, retry" }, 409);

    const stats = {
      speed_stat: Math.floor(Math.random() * 30) + 40,
      stamina_stat: Math.floor(Math.random() * 30) + 40,
      acceleration_stat: Math.floor(Math.random() * 30) + 40,
      temperament_stat: Math.floor(Math.random() * 30) + 40,
    };

    const { data: horse, error: hErr } = await admin
      .from("horses")
      .insert({ user_id: user.id, name, breed, color, ...stats })
      .select().single();

    if (hErr) {
      // refund on failure
      await admin.from("horse_currency").update({ coins: cur.coins }).eq("user_id", user.id);
      throw hErr;
    }

    return json({ horse });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
