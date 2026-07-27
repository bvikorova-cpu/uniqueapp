// Kids Science Lab helper: safety checker + ask-the-scientist Q&A.
// All actions are credit-gated against the `science_credits` table (2 credits each).
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { hasKidsGoldPass } from "../_shared/kidsGoldPass.ts";

const COSTS = { safetyCheck: 2, askScientist: 2, analyze: 4 } as const;
type Action = keyof typeof COSTS;

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

async function callAI(system: string, user: string) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}` },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      response_format: { type: "json_object" } }) });
  if (res.status === 429) throw new Error("RATE_LIMIT");
  if (res.status === 402) throw new Error("AI_CREDITS_EXHAUSTED");
  if (!res.ok) throw new Error(`AI error ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content ?? "{}";
  try { return JSON.parse(text); } catch { return { raw: text }; }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "");
    if (!token) throw new Error("Not authenticated");

    const supaUser = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } } });
    const { data: { user }, error: uerr } = await supaUser.auth.getUser(token);
    if (uerr || !user) throw new Error("Not authenticated");

    const supa = createClient(SUPABASE_URL, SERVICE_KEY);
    const body = await req.json();
    // Default to "analyze" when no action is provided (KidsScienceLab full-analysis flow)
    const action = (body?.action ?? "analyze") as Action;
    if (!COSTS[action]) throw new Error(`Unknown action: ${action}`);

    // Credit check + deduct (skipped for Gold Pass)
    const cost = COSTS[action];
    const goldPass = await hasKidsGoldPass(authHeader);
    const { data: row } = await supa
      .from("science_credits")
      .select("credits_remaining")
      .eq("user_id", user.id)
      .maybeSingle();
    const balance = row?.credits_remaining ?? 0;
    if (!goldPass && balance < cost) {
      return new Response(
        JSON.stringify({ error: `Not enough Science credits (need ${cost}, have ${balance})` }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }


    let result: any;
    if (action === "safetyCheck") {
      const { category = "", hypothesis = "", observations = "", materials = "" } = body;
      result = await callAI(
        "You are a child-safety scientist for ages 6-12. Review the experiment and return STRICT JSON: { riskLevel: 'safe'|'caution'|'unsafe', concerns: string[], requiredSupervision: string, requiredGear: string[], saferAlternatives: string[], ageAppropriate: boolean, notes: string }. Be conservative — flag fire, chemicals, electricity, sharp tools, eyes, ingestion.",
        `Category: ${category}\nHypothesis: ${hypothesis}\nObservations/plan: ${observations}\nMaterials: ${materials}`,
      );
    } else if (action === "askScientist") {
      const { question = "", context = "" } = body;
      if (!question.trim()) throw new Error("Question required");
      result = await callAI(
        "You are a friendly scientist explaining concepts to kids ages 6-12. Return STRICT JSON: { answer: string, analogy: string, didYouKnow: string, followUpQuestions: string[] }. Keep language simple and curious.",
        `Experiment context: ${context}\nKid's question: ${question}`,
      );
    } else if (action === "analyze") {
      const { category = "", hypothesis = "", observations = "", difficulty = "easy" } = body;
      result = await callAI(
        "You are a friendly scientist for kids ages 6-12. Analyze the experiment and return STRICT JSON: { conclusion: string, explanation: string, funFacts: string[], quiz: Array<{ question: string, options: string[3], correctIndex: 0|1|2 }> }. Provide exactly 3 fun facts and 3 quiz questions. Keep language simple and fun.",
        `Category: ${category}\nDifficulty: ${difficulty}\nHypothesis: ${hypothesis}\nObservations: ${observations}`,
      );
    }

    // Deduct credits (skipped for Gold Pass)
    if (!goldPass) {
      await supa
        .from("science_credits")
        .update({ credits_remaining: balance - cost, updated_at: new Date().toISOString() })
        .eq("user_id", user.id);
    }

    return new Response(
      JSON.stringify({ ...result, creditsSpent: goldPass ? 0 : cost, creditsRemaining: goldPass ? balance : balance - cost, unlimited: goldPass }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e: any) {
    const msg = e?.message ?? String(e);
    const status = msg === "RATE_LIMIT" ? 429 : msg === "AI_CREDITS_EXHAUSTED" ? 402 : 400;
    return new Response(JSON.stringify({ error: msg }), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
