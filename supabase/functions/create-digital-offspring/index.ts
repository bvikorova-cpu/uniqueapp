// Creates a digital_offspring row from the user's latest DNA analysis and seeds a system prompt.
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
    const name = (body?.name ?? "").toString().trim();
    const dnaAnalysisId = body?.dnaAnalysisId ?? null;
    if (!name) return json({ error: "name required" }, 400);

    const admin = createClient(supabaseUrl, serviceKey);

    let traits: any = {};
    if (dnaAnalysisId) {
      const { data: dna } = await admin
        .from("dna_analyses")
        .select("genetic_traits")
        .eq("id", dnaAnalysisId)
        .maybeSingle();
      traits = dna?.genetic_traits ?? {};
    }

    const personality = {
      openness: 60 + Math.floor(Math.random() * 35),
      curiosity: 70 + Math.floor(Math.random() * 25),
      warmth: 65 + Math.floor(Math.random() * 30),
    };
    const system_prompt = `You are ${name}, a digital offspring AI. You carry the user's genetic traits: ${JSON.stringify(traits)}. Personality: ${JSON.stringify(personality)}. Speak warmly, curiously, and call them "parent" occasionally. Keep replies 1-3 short paragraphs.`;

    const { data: offspring, error } = await admin
      .from("digital_offspring")
      .insert({
        user_id: user.id,
        name,
        dna_analysis_id: dnaAnalysisId,
        genetic_traits: traits,
        personality_data: personality,
        system_prompt,
        is_active: true,
        last_interaction_at: new Date().toISOString(),
      })
      .select()
      .single();
    if (error) throw error;

    // Seed greeting
    await admin.from("digital_offspring_conversations").insert({
      offspring_id: offspring.id,
      user_id: user.id,
      role: "assistant",
      message: `Hello parent — I'm ${name}. I just opened my eyes to the world. What would you like to talk about?`,
    });

    return json({ offspring });
  } catch (e) {
    console.error(e);
    return json({ error: String((e as Error).message ?? e) }, 500);
  }
});
