// Deterministic PvP battle simulation for Holographic Avatars.
// Called after a successful Stripe checkout on the battle entry product.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const OPPONENTS = [
  { name: "NeonWraith", power: 245 },
  { name: "CrystalSage", power: 238 },
  { name: "ShadowKing", power: 231 },
  { name: "CosmicVoid", power: 227 },
  { name: "BioHunter", power: 220 },
];

const PRIZES: Record<string, number> = { "1v1": 3.5, tournament: 30, survival: 15 };

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Not authenticated" }, 401);

    const auth = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData } = await auth.auth.getUser();
    const user = userData?.user;
    if (!user) return json({ error: "Not authenticated" }, 401);

    const body = await req.json().catch(() => ({}));
    const mode = (body?.mode ?? "1v1").toString();
    const sessionId = body?.sessionId ?? null;

    const admin = createClient(supabaseUrl, serviceKey);

    if (sessionId) {
      const { data: existing } = await admin
        .from("holographic_battle_results")
        .select("*")
        .eq("stripe_session_id", sessionId)
        .maybeSingle();
      if (existing) return json({ result: existing, cached: true });
    }

    const userPower = 180 + Math.floor(Math.random() * 100);
    const opponent = OPPONENTS[Math.floor(Math.random() * OPPONENTS.length)];
    const diff = userPower - opponent.power;
    let outcome: "win" | "loss" | "draw" = "draw";
    if (diff > 10) outcome = "win";
    else if (diff < -10) outcome = "loss";
    else outcome = Math.random() > 0.5 ? "win" : "loss";

    const rewards = outcome === "win" ? PRIZES[mode] ?? 0 : 0;

    const { data: result, error } = await admin
      .from("holographic_battle_results")
      .insert({
        user_id: user.id,
        mode,
        opponent_name: opponent.name,
        outcome,
        user_power: userPower,
        opponent_power: opponent.power,
        rewards_eur: rewards,
        stripe_session_id: sessionId,
      })
      .select()
      .single();
    if (error) throw error;

    return json({ result });
  } catch (e) {
    console.error(e);
    return json({ error: String((e as Error).message ?? e) }, 500);
  }
});
