// Teen Career Counselor — AI guidance, day-in-the-life simulator, skill gap analyzer, mentor chat.
// Credit-gated against teen_career_credits.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const MODEL = "gpt-4o-mini";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY")!;

const COSTS: Record<string, number> = {
  guidance: 5,
  dayInLife: 3,
  skillGap: 3,
  mentor: 2,
};

function json(b: unknown, s = 200) {
  return new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
function stripFence(s: string) { return s.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim(); }

async function callAI(messages: any[], jsonMode = false) {
  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: MODEL, messages, ...(jsonMode ? { response_format: { type: "json_object" } } : {}) }),
  });
  if (resp.status === 429) throw new Error("Rate limited, try again shortly");
  if (resp.status === 402) throw new Error("AI credits exhausted");
  if (!resp.ok) { console.error("AI", resp.status, await resp.text()); throw new Error("AI request failed"); }
  const j = await resp.json();
  return j?.choices?.[0]?.message?.content || "";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Missing authorization header" }, 401);
    const userClient = createClient(SUPABASE_URL, ANON_KEY, { global: { headers: { Authorization: authHeader } } });
    const { data: userData, error: uErr } = await userClient.auth.getUser();
    if (uErr || !userData.user) return json({ error: "Invalid bearer token" }, 401);
    const user = userData.user;

    const body = await req.json().catch(() => ({}));
    const action = String(body.action || "guidance");
    const cost = COSTS[action];
    if (!cost) return json({ error: "Unknown action" }, 400);

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: credRow } = await admin
      .from("teen_career_credits")
      .select("credits_remaining")
      .eq("user_id", user.id)
      .maybeSingle();
    let balance = credRow?.credits_remaining ?? 0;
    if (!credRow) {
      await admin.from("teen_career_credits").insert({ user_id: user.id, credits_remaining: 0, total_credits_purchased: 0 });
    }
    if (balance < cost) return json({ error: "Insufficient credits", credits_remaining: balance, cost }, 402);

    let payload: any = {};

    if (action === "guidance") {
      const interests = String(body.interests || "").slice(0, 1000);
      const strengths = String(body.strengths || "").slice(0, 1000);
      const goals = String(body.goals || "").slice(0, 1000);
      if (!interests || !strengths) return json({ error: "Interests and strengths required" }, 400);

      const system = `You are a friendly career counselor for teens (13-19).
Return rich markdown with sections:
## Top 3-5 Career Paths (with match %)
For each: ## <Role Name> (xx% match)
- Why it fits you
- Typical salary range (EUR) & demand
- Education roadmap (degrees, certifications, free resources)
- 3 action steps to start TODAY
- A famous role model
End with a short motivational paragraph.`;
      const userMsg = `Interests: ${interests}\nStrengths: ${strengths}\nGoals: ${goals || "(none specified)"}`;
      const guidance = await callAI([
        { role: "system", content: system },
        { role: "user", content: userMsg },
      ]);
      payload = { guidance };
    }

    else if (action === "dayInLife") {
      const career = String(body.career || "").slice(0, 200);
      if (!career) return json({ error: "Career required" }, 400);
      const system = `You simulate a realistic, vivid 'Day in the Life' for a teen exploring a career. Output STRICT JSON:
{
  "career": "...",
  "schedule": [{"time":"07:30","activity":"...","detail":"...","mood":"focused|creative|social|stressful|fun"}],
  "tools": ["..."],
  "skills_used": ["..."],
  "best_part": "...",
  "hardest_part": "...",
  "salary_range_eur": "€X – €Y",
  "fit_signals": ["You'd love this if ..."]
}
8-10 schedule items spanning a full workday.`;
      const raw = await callAI([
        { role: "system", content: system },
        { role: "user", content: `Career: ${career}` },
      ], true);
      try { payload = JSON.parse(stripFence(raw)); } catch { payload = { raw }; }
    }

    else if (action === "skillGap") {
      const targetCareer = String(body.targetCareer || "").slice(0, 200);
      const currentSkills = String(body.currentSkills || "").slice(0, 1000);
      if (!targetCareer) return json({ error: "Target career required" }, 400);
      const system = `You analyze the skill gap between a teen's current skills and a target career.
Output STRICT JSON:
{
  "targetCareer": "...",
  "readinessScore": 0-100,
  "haveSkills": [{"skill":"...","level":"beginner|intermediate|advanced"}],
  "missingSkills": [{"skill":"...","priority":"high|medium|low","whyItMatters":"..."}],
  "learningPath": [{"month":1,"focus":"...","resources":["free course name or platform","..."],"milestone":"..."}],
  "quickWins": ["something you can do this week"],
  "estimatedMonthsToReady": 12
}
Provide 6 months of learningPath. Suggest free/affordable resources (Khan Academy, Coursera audit, YouTube, freeCodeCamp, etc.).`;
      const userMsg = `Target career: ${targetCareer}\nCurrent skills: ${currentSkills || "(none listed)"}`;
      const raw = await callAI([
        { role: "system", content: system },
        { role: "user", content: userMsg },
      ], true);
      try { payload = JSON.parse(stripFence(raw)); } catch { payload = { raw }; }
    }

    else if (action === "mentor") {
      const question = String(body.question || "").slice(0, 1500);
      const context = String(body.context || "").slice(0, 1000);
      if (!question) return json({ error: "Question required" }, 400);
      const system = `You are a warm, honest career mentor for a teen. Give practical, concise advice (3-6 sentences). No fluff. Encourage curiosity, real-world experiments, and small next steps. If unsafe/off-topic, gently redirect.`;
      const reply = await callAI([
        { role: "system", content: system },
        { role: "user", content: context ? `Context: ${context}\n\nQuestion: ${question}` : question },
      ]);
      payload = { reply };
    }

    const newBalance = balance - cost;
    await admin.from("teen_career_credits")
      .update({ credits_remaining: newBalance, last_used_at: new Date().toISOString() })
      .eq("user_id", user.id);

    return json({ ...payload, credits_remaining: newBalance, cost });
  } catch (e: any) {
    console.error("teen-career-counselor error", e);
    return json({ error: e?.message || "Internal error" }, 500);
  }
});
