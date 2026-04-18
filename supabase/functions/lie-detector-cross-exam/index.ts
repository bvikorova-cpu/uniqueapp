// AI Cross-Examination — prosecutor follow-up questions and contradiction finding
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
const COST = 8;
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const auth = req.headers.get("Authorization");
    if (!auth) return json({ error: "Unauthorized" }, 401);
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { global: { headers: { Authorization: auth } } });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return json({ error: "Unauthorized" }, 401);
    const { subject_text, qa_thread, action } = await req.json();
    if (!subject_text || typeof subject_text !== "string") return json({ error: "subject_text required" }, 400);

    const { data: cr } = await supabase.from("lie_detector_credits").select("credits_remaining").eq("user_id", user.id).maybeSingle();
    if (!cr || (cr.credits_remaining ?? 0) < COST) return json({ error: "Insufficient credits", required: COST, have: cr?.credits_remaining ?? 0 }, 402);

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) return json({ error: "OPENAI_API_KEY not configured" }, 500);

    const thread = Array.isArray(qa_thread) ? qa_thread : [];
    const threadStr = thread.map((m: any) => `${m.role.toUpperCase()}: ${m.content}`).join("\n");

    const sys = action === "verdict"
      ? "You are a prosecutor delivering the final verdict after cross-examination."
      : "You are a sharp prosecutor cross-examining a witness. Ask one piercing follow-up question that exposes contradictions or evasion. Be tough but fair.";
    const userMsg = action === "verdict"
      ? `Subject statement:\n"""${subject_text}"""\n\nFull cross-examination Q&A:\n${threadStr}\n\nReturn JSON: { contradictions: [{quote:string, conflict:string}], verdict: string, credibility_score: number, key_lies: string[], summary: string }`
      : `Subject's statement:\n"""${subject_text}"""\n\nPrior Q&A:\n${threadStr || "(none yet)"}\n\nReturn JSON: { question: string, target_contradiction: string, intensity: "low"|"medium"|"high" }`;

    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "system", content: sys }, { role: "user", content: userMsg }],
        response_format: { type: "json_object" },
      }),
    });
    if (!resp.ok) return json({ error: "AI failed", details: await resp.text() }, 500);
    const aj = await resp.json();
    const results = JSON.parse(aj.choices[0].message.content);

    if (action === "verdict") {
      await supabase.from("lie_cross_examinations").insert({
        user_id: user.id, subject_text: subject_text.slice(0, 4000),
        qa_thread: thread, contradictions: results.contradictions || [],
        verdict: results.verdict, credits_used: COST,
      });
      await supabase.from("lie_detector_credits").update({ credits_remaining: (cr.credits_remaining ?? 0) - COST }).eq("user_id", user.id);
    }
    return json({ ...results, credits_charged: action === "verdict" ? COST : 0 });
  } catch (e) { return json({ error: e instanceof Error ? e.message : "Unknown" }, 500); }
});
function json(b: any, s = 200) { return new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } }); }
