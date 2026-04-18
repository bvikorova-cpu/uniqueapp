import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

const COSTS: Record<string, number> = {
  decoder: 10,
  evidence: 15,
  coach: 8,
  riskscan: 12,
};

async function callOpenAI(messages: any[], temperature = 0.6) {
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "openai/gpt-5-mini",
      messages,
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`AI gateway: ${res.status} ${t}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content as string;
}

function parseJSON(s: string): any {
  try {
    const m = s.match(/```json\s*([\s\S]*?)```/) || s.match(/```\s*([\s\S]*?)```/);
    return JSON.parse(m ? m[1] : s);
  } catch {
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { action } = body;
    const cost = COSTS[action];
    if (!cost) {
      return new Response(JSON.stringify({ error: "Unknown action" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Ensure credit row exists
    const { data: credRow } = await supabase
      .from("safety_ai_credits")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    let balance = credRow?.credits_remaining ?? 0;
    if (!credRow) {
      const { data: created } = await supabase
        .from("safety_ai_credits")
        .insert({ user_id: user.id, credits_remaining: 20, total_credits_purchased: 20 })
        .select()
        .single();
      balance = created?.credits_remaining ?? 20;
    }

    if (balance < cost) {
      return new Response(
        JSON.stringify({ error: `Not enough credits (need ${cost}, have ${balance})` }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let result: any = {};

    if (action === "decoder") {
      const { input_text } = body;
      if (!input_text || input_text.length < 5) throw new Error("Message too short");
      const sys = `You are an expert in bullying prevention and digital safety. Analyze the bullying message and respond ONLY with JSON:
{"severity":"low|medium|high|critical","bully_type":"verbal|cyber|social|physical-threat|sexual|discriminatory","emotional_impact":"<2 sentences>","suggested_response":"<safe assertive reply, or 'do_not_engage'>","action_steps":[{"step":"...","priority":"high|medium|low"}],"red_flags":["..."]}`;
      const raw = await callOpenAI([
        { role: "system", content: sys },
        { role: "user", content: `Analyze this message I received:\n\n"""${input_text}"""` },
      ]);
      const parsed = parseJSON(raw) || {};
      const { data: saved } = await supabase
        .from("safety_bully_decoder")
        .insert({
          user_id: user.id,
          input_text,
          severity: parsed.severity,
          bully_type: parsed.bully_type,
          emotional_impact: parsed.emotional_impact,
          suggested_response: parsed.suggested_response,
          action_steps: parsed.action_steps || [],
          red_flags: parsed.red_flags || [],
          credits_used: cost,
        })
        .select()
        .single();
      result = saved;
    }

    if (action === "evidence") {
      const { title, incidents } = body;
      if (!title || !Array.isArray(incidents) || incidents.length === 0)
        throw new Error("Title and incidents required");
      const sys = `You are a legal-savvy advocate helping a bullying victim build a formal evidence pack. Output ONLY JSON:
{"incident_summary":"<professional 1-paragraph summary>","timeline":[{"date":"YYYY-MM-DD","event":"...","severity":"low|medium|high"}],"recommended_recipients":[{"name":"School Principal","reason":"..."},{"name":"Local Police","reason":"..."}],"formal_report":"<formal report text suitable for printing/PDF, ~400 words, neutral tone>"}`;
      const raw = await callOpenAI([
        { role: "system", content: sys },
        { role: "user", content: `Title: ${title}\nIncidents:\n${incidents.map((i: any, n: number) => `${n + 1}. ${i.date || "unknown"} — ${i.description}`).join("\n")}` },
      ]);
      const parsed = parseJSON(raw) || {};
      const { data: saved } = await supabase
        .from("safety_evidence_packs")
        .insert({
          user_id: user.id,
          title,
          incident_summary: parsed.incident_summary,
          timeline: parsed.timeline || [],
          recommended_recipients: parsed.recommended_recipients || [],
          formal_report: parsed.formal_report,
          credits_used: cost,
        })
        .select()
        .single();
      result = saved;
    }

    if (action === "coach") {
      const { scenario, user_response } = body;
      if (!scenario || !user_response) throw new Error("Scenario and response required");
      const sys = `You are a safety coach scoring how a person responded to a bullying scenario. Output ONLY JSON:
{"assertiveness_score":0-100,"empathy_score":0-100,"safety_score":0-100,"feedback":"<2-3 sentences, constructive>","improved_response":"<better reply demonstrating assertive, safe communication>","next_steps":["..."]}`;
      const raw = await callOpenAI([
        { role: "system", content: sys },
        { role: "user", content: `Scenario: ${scenario}\nMy response: ${user_response}` },
      ]);
      const parsed = parseJSON(raw) || {};
      const { data: saved } = await supabase
        .from("safety_response_coach_sessions")
        .insert({
          user_id: user.id,
          scenario,
          user_response,
          assertiveness_score: parsed.assertiveness_score,
          empathy_score: parsed.empathy_score,
          safety_score: parsed.safety_score,
          feedback: parsed.feedback,
          improved_response: parsed.improved_response,
          next_steps: parsed.next_steps || [],
          credits_used: cost,
        })
        .select()
        .single();
      result = saved;
    }

    if (action === "riskscan") {
      const { scan_input } = body;
      if (!scan_input || scan_input.length < 10) throw new Error("Input too short");
      const sys = `You are a cyberbullying risk analyst. Scan the provided text (comments, DMs, social posts) and output ONLY JSON:
{"risk_level":"safe|caution|elevated|severe","overall_score":0-100,"threat_patterns":[{"pattern":"name","frequency":"low|medium|high","example":"..."}],"flagged_phrases":["..."],"safety_recommendations":[{"action":"...","why":"..."}]}`;
      const raw = await callOpenAI([
        { role: "system", content: sys },
        { role: "user", content: `Scan this content for cyberbullying threats:\n"""${scan_input.slice(0, 5000)}"""` },
      ]);
      const parsed = parseJSON(raw) || {};
      const { data: saved } = await supabase
        .from("safety_cyberbullying_scans")
        .insert({
          user_id: user.id,
          scan_input: scan_input.slice(0, 5000),
          risk_level: parsed.risk_level,
          overall_score: parsed.overall_score,
          threat_patterns: parsed.threat_patterns || [],
          flagged_phrases: parsed.flagged_phrases || [],
          safety_recommendations: parsed.safety_recommendations || [],
          credits_used: cost,
        })
        .select()
        .single();
      result = saved;
    }

    // Deduct credits
    await supabase
      .from("safety_ai_credits")
      .update({ credits_remaining: balance - cost, last_used_at: new Date().toISOString() })
      .eq("user_id", user.id);

    return new Response(JSON.stringify({ ...result, _credits_remaining: balance - cost }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("safety-ai error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
