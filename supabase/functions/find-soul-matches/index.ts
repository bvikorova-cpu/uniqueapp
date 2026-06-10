// Returns simulated soul matches for the user from soul_profiles.
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

const CONNECTION_TYPES = ["twin_flame", "soul_mate", "karmic_partner", "soul_family"];
const LESSON_POOL = [
  { lesson: "Trust", domain: "emotional" },
  { lesson: "Forgiveness", domain: "spiritual" },
  { lesson: "Patience", domain: "mental" },
  { lesson: "Vulnerability", domain: "emotional" },
  { lesson: "Self-worth", domain: "personal" },
];

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

    const { data: purchase } = await admin
      .from("reincarnation_purchases")
      .select("*")
      .eq("user_id", user.id)
      .eq("service_type", "soulmate_matching")
      .eq("status", "active")
      .maybeSingle();
    if (!purchase) return json({ error: "Subscription required", requiresPayment: true }, 402);

    const { data: profiles } = await admin
      .from("soul_profiles")
      .select("user_id, display_name, age, location, bio, soul_age, spiritual_level")
      .eq("is_active", true)
      .neq("user_id", user.id)
      .limit(10);

    const matches = (profiles ?? []).map((p: any, i: number) => {
      const score = 70 + ((i * 7 + (p.display_name?.length ?? 0)) % 30);
      const lessons = LESSON_POOL.slice(0, 2 + (i % 3));
      const ctype = CONNECTION_TYPES[i % CONNECTION_TYPES.length];
      return {
        profile: { display_name: p.display_name, age: p.age, location: p.location, bio: p.bio },
        compatibility_score: score,
        connection_type: ctype,
        karmic_lessons: lessons,
        soul_contract: `A ${ctype.replace("_", " ")} bond formed across ${(i % 5) + 2} past lives, here to teach ${lessons.map(l => l.lesson).join(" & ")}.`,
        past_lives_together: (i % 5) + 1,
      };
    });

    return json({ matches });
  } catch (e) {
    console.error(e);
    return json({ error: String((e as Error).message ?? e) }, 500);
  }
});
