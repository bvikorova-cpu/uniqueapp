// Kids Reading Companion: analyze, multi-quiz, define actions.
// Credit-gated against the `kids_reading_credits` table.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";

const COSTS = { analyze: 2, "multi-quiz": 2, define: 1 } as const;
type Action = keyof typeof COSTS;

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

async function callAI(system: string, user: string, json = true) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${OPENAI_API_KEY}` },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      ...(json ? { response_format: { type: "json_object" } } : {}),
    }),
  });
  if (res.status === 429) throw new Error("RATE_LIMIT");
  if (res.status === 402) throw new Error("AI_CREDITS_EXHAUSTED");
  if (!res.ok) throw new Error(`AI error ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content ?? "{}";
  if (!json) return { text };
  try { return JSON.parse(text); } catch { return { raw: text }; }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "");
    if (!token) throw new Error("Not authenticated");

    const supaUser = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: uerr } = await supaUser.auth.getUser(token);
    if (uerr || !user) throw new Error("Not authenticated");

    const supa = createClient(SUPABASE_URL, SERVICE_KEY);
    const body = await req.json();
    const action = (body?.action ?? "analyze") as Action;
    if (!COSTS[action]) throw new Error(`Unknown action: ${action}`);
    const cost = COSTS[action];

    const { data: row } = await supa
      .from("kids_reading_credits")
      .select("credits_remaining")
      .eq("user_id", user.id)
      .maybeSingle();
    const balance = row?.credits_remaining ?? 0;
    if (balance < cost) {
      return new Response(
        JSON.stringify({ error: `Not enough Reading credits (need ${cost}, have ${balance})` }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const level = body?.level ?? "intermediate";
    const text = (body?.text ?? "").toString().slice(0, 8000);
    let result: any;

    if (action === "analyze") {
      if (!text.trim()) throw new Error("Text required");
      result = await callAI(
        `You are a friendly reading coach for kids (level: ${level}, ages 6-14). Return STRICT JSON: { summary: string (2-3 simple sentences), mainIdea: string, vocabulary: Array<{ word: string, definition: string, example: string, emoji?: string }> (5-10 useful new words), themes: string[], discussionQuestions: string[] (3 open questions) }.`,
        text,
      );
    } else if (action === "multi-quiz") {
      if (!text.trim()) throw new Error("Text required");
      result = await callAI(
        `You generate kid-friendly reading comprehension quizzes (level: ${level}). Return STRICT JSON: { questions: Array<{ question: string, options: string[4], correctIndex: number, explanation: string }> } with 5 questions total mixing literal, inferential and vocabulary types.`,
        text,
      );
    } else if (action === "define") {
      const word = (body?.word ?? "").toString().trim().slice(0, 60);
      const context = (body?.context ?? "").toString().slice(0, 1000);
      if (!word) throw new Error("Word required");
      result = await callAI(
        `Explain a word to a kid (level: ${level}). Return STRICT JSON: { word: string, definition: string (one short kid-friendly sentence), example: string, synonyms: string[3], emoji: string }.`,
        `Word: "${word}"\nContext: ${context}`,
      );
    }

    await supa
      .from("kids_reading_credits")
      .update({ credits_remaining: balance - cost, updated_at: new Date().toISOString() })
      .eq("user_id", user.id);

    return new Response(
      JSON.stringify({ ...result, creditsSpent: cost, creditsRemaining: balance - cost }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e: any) {
    const msg = e?.message ?? String(e);
    const status = msg === "RATE_LIMIT" ? 429 : msg === "AI_CREDITS_EXHAUSTED" ? 402 : 400;
    return new Response(JSON.stringify({ error: msg }), {
      status, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
