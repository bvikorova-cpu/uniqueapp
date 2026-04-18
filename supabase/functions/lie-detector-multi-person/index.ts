// Multi-Person Profile — compares lies/manipulation across 2-3 people, generates relationship map
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const COST = 20;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const auth = req.headers.get("Authorization");
    if (!auth) return json({ error: "Unauthorized" }, 401);
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { global: { headers: { Authorization: auth } } }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return json({ error: "Unauthorized" }, 401);

    const { title, people } = await req.json();
    if (!Array.isArray(people) || people.length < 2 || people.length > 3)
      return json({ error: "Provide 2-3 people, each { name, messages: string[] }" }, 400);
    for (const p of people) {
      if (!p?.name || !Array.isArray(p?.messages) || p.messages.length === 0)
        return json({ error: "Each person needs name + messages[]" }, 400);
    }

    const { data: cr } = await supabase
      .from("lie_detector_credits").select("credits_remaining").eq("user_id", user.id).maybeSingle();
    if (!cr || (cr.credits_remaining ?? 0) < COST)
      return json({ error: "Insufficient credits", required: COST, have: cr?.credits_remaining ?? 0 }, 402);

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) return json({ error: "OPENAI_API_KEY not configured" }, 500);

    const profileText = people.map((p: any) => `### ${p.name}\n${p.messages.map((m: string, i: number) => `${i + 1}. ${m}`).join("\n")}`).join("\n\n");

    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a forensic relationship analyst. Compare deception patterns across multiple people, find contradictions, alliances, manipulation dynamics. Strict JSON output." },
          { role: "user", content: `Analyze these ${people.length} people and produce a relationship/deception map:\n\n${profileText}\n\nReturn JSON: people_scores (array of { name, truthfulness, manipulation, dominant_trait }), contradictions (string[]), alliances (string[]), conflicts (string[]), most_likely_lying (string), most_trustworthy (string), relationship_dynamics (string), recommended_actions (string[]).` },
        ],
        response_format: { type: "json_object" },
      }),
    });
    if (!resp.ok) return json({ error: "AI failed", details: await resp.text() }, 500);
    const aj = await resp.json();
    const results = JSON.parse(aj.choices[0].message.content);

    await supabase.from("lie_detector_credits")
      .update({ credits_remaining: (cr.credits_remaining ?? 0) - COST })
      .eq("user_id", user.id);

    const { data: saved } = await supabase.from("lie_relationship_maps").insert({
      user_id: user.id,
      title: title || `Map ${new Date().toLocaleDateString()}`,
      people,
      analysis: results,
      credits_used: COST,
    }).select().single();

    return json({ map: saved, results });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Unknown" }, 500);
  }
});
function json(b: unknown, s = 200) { return new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } }); }
