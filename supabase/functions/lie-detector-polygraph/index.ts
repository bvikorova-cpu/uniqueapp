// Polygraph 3D — generates stress curve over time for animated 3D needle visualization
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
const COST = 2;
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const auth = req.headers.get("Authorization");
    if (!auth) return json({ error: "Unauthorized" }, 401);
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { global: { headers: { Authorization: auth } } });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return json({ error: "Unauthorized" }, 401);
    const { text } = await req.json();
    if (!text || typeof text !== "string" || text.length < 10) return json({ error: "text required (min 10 chars)" }, 400);
    const { data: cr } = await supabase.from("lie_detector_credits").select("credits_remaining").eq("user_id", user.id).maybeSingle();
    if (!cr || (cr.credits_remaining ?? 0) < COST) return json({ error: "Insufficient credits", required: COST, have: cr?.credits_remaining ?? 0 }, 402);
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) return json({ error: "OPENAI_API_KEY not configured" }, 500);
    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a polygraph signal generator. Break the text into 12-20 sentence-level chunks and assign each a stress reading (0-100) based on linguistic deception markers. Return JSON only." },
          { role: "user", content: `Text:\n"""${text}"""\n\nReturn JSON: { stress_curve: [{t:number, stress:number, snippet:string}], peak_moments: [{t:number, reason:string}], overall_stress: number, truthfulness_score: number, summary: string }` },
        ],
        response_format: { type: "json_object" },
      }),
    });
    if (!resp.ok) return json({ error: "AI failed", details: await resp.text() }, 500);
    const aj = await resp.json();
    const results = JSON.parse(aj.choices[0].message.content);
    await supabase.from("lie_polygraph_sessions").insert({
      user_id: user.id, source_text: text.slice(0, 4000),
      stress_curve: results.stress_curve || [], peak_moments: results.peak_moments || [],
      overall_stress: results.overall_stress, truthfulness_score: results.truthfulness_score, credits_used: COST,
    });
    await supabase.from("lie_detector_credits").update({ credits_remaining: (cr.credits_remaining ?? 0) - COST }).eq("user_id", user.id);
    await awardXp(supabase, user.id, 5);
    return json({ ...results, credits_charged: COST });
  } catch (e) { return json({ error: e instanceof Error ? e.message : "Unknown" }, 500); }
});
async function awardXp(supabase: any, uid: string, xp: number) {
  const { data: r } = await supabase.from("lie_detective_ranks").select("xp,total_analyses").eq("user_id", uid).maybeSingle();
  const newXp = (r?.xp ?? 0) + xp;
  const tier = newXp >= 5000 ? "Master Interrogator" : newXp >= 2000 ? "Senior Detective" : newXp >= 500 ? "Detective" : newXp >= 100 ? "Investigator" : "Rookie";
  if (r) await supabase.from("lie_detective_ranks").update({ xp: newXp, rank_tier: tier, total_analyses: (r.total_analyses ?? 0) + 1 }).eq("user_id", uid);
  else await supabase.from("lie_detective_ranks").insert({ user_id: uid, xp: newXp, rank_tier: tier, total_analyses: 1 });
}
function json(b: any, s = 200) { return new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } }); }
