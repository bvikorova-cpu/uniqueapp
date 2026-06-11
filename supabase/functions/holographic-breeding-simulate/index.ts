// Deterministic breeding simulation: combines two parent IDs into a unique offspring.
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

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

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
    const parent1 = Number(body?.parent1 ?? 0);
    const parent2 = Number(body?.parent2 ?? 0);
    const sessionId = body?.sessionId ?? null;
    if (!parent1 || !parent2 || parent1 === parent2) {
      return json({ error: "Two distinct parent IDs required" }, 400);
    }

    const admin = createClient(supabaseUrl, serviceKey);

    if (sessionId) {
      const { data: existing } = await admin
        .from("holographic_breeding_results")
        .select("*")
        .eq("stripe_session_id", sessionId)
        .maybeSingle();
      if (existing) return json({ result: existing, cached: true });
    }

    const offspringName = `${pick(PREFIX)}${pick(SUFFIX)}`;
    const offspringStyle = pick(STYLES);
    const offspringTraits = Array.from(new Set([pick(TRAITS), pick(TRAITS), pick(TRAITS)]));
    const roll = Math.random();
    const rarity = roll > 0.95 ? "legendary" : roll > 0.8 ? "epic" : roll > 0.5 ? "rare" : "common";
    const level = 1 + Math.floor(Math.random() * 5);

    const { data: result, error } = await admin
      .from("holographic_breeding_results")
      .insert({
        user_id: user.id,
        parent1_id: parent1,
        parent2_id: parent2,
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
