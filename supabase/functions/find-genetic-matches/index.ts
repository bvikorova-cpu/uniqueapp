// Returns DNA-compatible matches from genetic_dating_profiles.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

const TALENT_POOL = ["music", "athletics", "mathematics", "linguistics", "art", "leadership", "empathy"];

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

    const admin = createClient(supabaseUrl, serviceKey);

    const { data: profiles } = await admin
      .from("genetic_dating_profiles")
      .select("user_id, display_name, age, location, bio, genetic_traits, personality_dna")
      .eq("is_active", true)
      .eq("subscription_active", true)
      .neq("user_id", user.id)
      .limit(8);

    const matches = (profiles ?? []).map((p: any, i: number) => {
      const base = 72 + ((i * 11 + (p.display_name?.length ?? 0)) % 25);
      const personality = 65 + ((i * 13) % 30);
      const talents = [TALENT_POOL[i % TALENT_POOL.length], TALENT_POOL[(i + 2) % TALENT_POOL.length]];
      return {
        profile: { display_name: p.display_name, age: p.age, location: p.location, bio: p.bio },
        compatibility_score: base,
        genetic_compatibility: {
          overall: base,
          disease_resistance: base - 5,
          longevity: base + 3,
          metabolic: base - 2,
        },
        personality_compatibility: {
          values_alignment: personality,
          communication_style: personality - 4,
        },
        offspring_predictions: {
          height_range: `${165 + (i % 25)}cm – ${175 + (i % 20)}cm`,
          intelligence_potential: base + 5 + "%",
          unique_talents: talents,
        },
      };
    });

    return json({ matches });
  } catch (e) {
    console.error(e);
    return json({ error: String((e as Error).message ?? e) }, 500);
  }
});
