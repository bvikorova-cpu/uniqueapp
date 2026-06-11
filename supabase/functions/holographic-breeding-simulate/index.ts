// Deterministic breeding simulation: server-derives offspring from two parents.
// Outcome is unlocked ONLY after a verified holographic_purchases row
// (per-session) or an active 'breeding' subscription. Identical
// (user, session, parent1, parent2) inputs always yield the same offspring.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const STYLES = ["Cyberpunk", "Crystal", "Shadow", "Cosmic", "Bio-Organic", "Ethereal"];
const TRAITS = [
  "Bold", "Strategic", "Fierce", "Wise", "Calm", "Creative",
  "Mysterious", "Rebellious", "Charismatic", "Energetic", "Playful", "Stoic",
];
const PREFIX = ["Astra", "Nova", "Lyra", "Zephyr", "Orion", "Vega", "Echo", "Kai"];
const SUFFIX = ["wraith", "song", "blade", "heart", "veil", "storm", "frost", "flame"];

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

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
    const parent1 = Number(body?.parent1 ?? 0);
    const parent2 = Number(body?.parent2 ?? 0);
    const sessionId = body?.sessionId ? String(body.sessionId) : null;
    if (!parent1 || !parent2 || parent1 === parent2) {
      return json({ error: "Two distinct parent IDs required" }, 400);
    }

    const admin = createClient(supabaseUrl, serviceKey);

    // Cache
    if (sessionId) {
      const { data: existing } = await admin
        .from("holographic_breeding_results")
        .select("*")
        .eq("stripe_session_id", sessionId)
        .eq("user_id", user.id)
        .maybeSingle();
      if (existing) return json({ result: existing, cached: true });
    }

    // Verify purchase
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
        .eq("service_type", "breeding")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      purchaseOk = !!sub && (!sub.expires_at || new Date(sub.expires_at) > new Date());
    }
    if (!purchaseOk) {
      return json({ error: "purchase_required", message: "Active breeding purchase required." }, 402);
    }

    // Deterministic offspring — order parents so (a,b) == (b,a).
    const [p1, p2] = parent1 < parent2 ? [parent1, parent2] : [parent2, parent1];
    const rng = await makeSeededRng(`breeding|${user.id}|${sessionId ?? "no-session"}|${p1}|${p2}`);
    const pick = async <T>(arr: T[]): Promise<T> => arr[Math.floor((await rng()) * arr.length)];

    const offspringName = `${await pick(PREFIX)}${await pick(SUFFIX)}`;
    const offspringStyle = await pick(STYLES);
    const offspringTraits = Array.from(
      new Set([await pick(TRAITS), await pick(TRAITS), await pick(TRAITS)])
    );
    const roll = await rng();
    const rarity = roll > 0.95 ? "legendary" : roll > 0.8 ? "epic" : roll > 0.5 ? "rare" : "common";
    const level = 1 + Math.floor((await rng()) * 5);

    const { data: result, error } = await admin
      .from("holographic_breeding_results")
      .insert({
        user_id: user.id,
        parent1_id: p1,
        parent2_id: p2,
        offspring_name: offspringName,
        offspring_style: offspringStyle,
        offspring_traits: offspringTraits,
        offspring_level: level,
        rarity,
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
