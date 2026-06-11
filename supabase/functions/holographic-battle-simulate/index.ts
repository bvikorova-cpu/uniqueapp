// Deterministic PvP battle simulation for Holographic Avatars.
// Server-side outcome is unlocked ONLY after a verified purchase
// (holographic_purchases row with matching stripe_session_id OR an active
// 'battle'-tier subscription for this user). Identical (user, session, mode)
// inputs always yield the same result — no client-side RNG.
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

// Deterministic RNG seeded by SHA-256 of the inputs. Returns a stream of
// uniform floats in [0,1) by walking 32-bit chunks of repeated hash output.
async function makeSeededRng(seed: string) {
  let counter = 0;
  let buf = new Uint8Array(0);
  let offset = 0;
  const refill = async () => {
    const enc = new TextEncoder().encode(`${seed}|${counter++}`);
    const digest = await crypto.subtle.digest("SHA-256", enc);
    buf = new Uint8Array(digest);
    offset = 0;
  };
  return async () => {
    if (offset + 4 > buf.length) await refill();
    const n =
      (buf[offset] << 24) | (buf[offset + 1] << 16) | (buf[offset + 2] << 8) | buf[offset + 3];
    offset += 4;
    return ((n >>> 0) % 1_000_000) / 1_000_000;
  };
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
    const mode = String(body?.mode ?? "1v1");
    const sessionId = body?.sessionId ? String(body.sessionId) : null;

    const admin = createClient(supabaseUrl, serviceKey);

    // 1) Cache: same session → same result, never re-simulate.
    if (sessionId) {
      const { data: existing } = await admin
        .from("holographic_battle_results")
        .select("*")
        .eq("stripe_session_id", sessionId)
        .eq("user_id", user.id)
        .maybeSingle();
      if (existing) return json({ result: existing, cached: true });
    }

    // 2) Verify purchase / subscription before unlocking outcome.
    let purchaseOk = false;
    if (sessionId) {
      const { data: purchase } = await admin
        .from("holographic_purchases")
        .select("id")
        .eq("user_id", user.id)
        .eq("stripe_session_id", sessionId)
        .eq("status", "active")
        .maybeSingle();
      purchaseOk = !!purchase;
    }
    if (!purchaseOk) {
      const { data: sub } = await admin
        .from("holographic_purchases")
        .select("id, expires_at")
        .eq("user_id", user.id)
        .eq("service_type", "battle")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      purchaseOk = !!sub && (!sub.expires_at || new Date(sub.expires_at) > new Date());
    }
    if (!purchaseOk) {
      return json({ error: "purchase_required", message: "Active battle purchase required." }, 402);
    }

    // 3) Deterministic outcome from (user, session, mode).
    const rng = await makeSeededRng(`battle|${user.id}|${sessionId ?? "no-session"}|${mode}`);
    const userPower = 180 + Math.floor((await rng()) * 100);
    const opponent = OPPONENTS[Math.floor((await rng()) * OPPONENTS.length)];
    const diff = userPower - opponent.power;
    let outcome: "win" | "loss" | "draw";
    if (diff > 10) outcome = "win";
    else if (diff < -10) outcome = "loss";
    else outcome = (await rng()) > 0.5 ? "win" : "loss";

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
