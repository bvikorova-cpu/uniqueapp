// Comparison Mode — side-by-side diff of 2 statements
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
const COST = 6;
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const auth = req.headers.get("Authorization");
    if (!auth) return json({ error: "Unauthorized" }, 401);
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { global: { headers: { Authorization: auth } } });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return json({ error: "Unauthorized" }, 401);
    const { source_a, source_b, title } = await req.json();
    if (!source_a || !source_b) return json({ error: "source_a and source_b required" }, 400);

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
          { role: "system", content: "You compare two statements/stories side-by-side. Find every contradiction, omission, embellishment, and tonal shift. Score each for credibility independently." },
          { role: "user", content: `STATEMENT A:\n"""${source_a}"""\n\nSTATEMENT B:\n"""${source_b}"""\n\nReturn JSON: { score_a:number, score_b:number, diff_findings:[{topic:string, in_a:string, in_b:string, conflict_type:"contradiction"|"omission"|"embellishment"|"tone_shift", severity:"low"|"medium"|"high"}], more_credible:"A"|"B"|"tie", verdict:string, summary:string }`},
        ],
        response_format: { type: "json_object" },
      }),
    });
    if (!resp.ok) return json({ error: "AI failed", details: await resp.text() }, 500);
    const aj = await resp.json();
    const results = JSON.parse(aj.choices[0].message.content);

    await supabase.from("lie_comparisons").insert({
      user_id: user.id, title: title || "Comparison",
      source_a: source_a.slice(0, 4000), source_b: source_b.slice(0, 4000),
      diff_findings: results.diff_findings || [], verdict: results.verdict, credits_used: COST,
    });
    await supabase.from("lie_detector_credits").update({ credits_remaining: (cr.credits_remaining ?? 0) - COST }).eq("user_id", user.id);
    return json({ ...results, credits_charged: COST });
  } catch (e) { return json({ error: e instanceof Error ? e.message : "Unknown" }, 500); }
});
function json(b: any, s = 200) { return new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } }); }
