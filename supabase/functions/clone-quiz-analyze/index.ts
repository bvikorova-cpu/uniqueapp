// Analyzes personality quiz answers via OpenAI (gpt-4o).
import { callOpenAIJSON, OpenAIError } from "../_shared/openai.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    if (!req.headers.get("Authorization")) return j({ error: "No auth" }, 401);
    const { questions, answers } = await req.json();
    if (!Array.isArray(questions) || !Array.isArray(answers) || questions.length !== answers.length) {
      return j({ error: "questions and answers arrays required (same length)" }, 400);
    }

    const qa = questions.map((q: string, i: number) => `Q: ${q}\nA: ${answers[i]}`).join("\n\n");

    try {
      const parsed = await callOpenAIJSON({
        system: "You are a personality analyst. Given quiz Q&A, return ONLY a JSON object with keys: archetype (string, 2-4 words), summary (1-2 sentences), traits (array of exactly 4 short strings), recommended_clone_tone (one of: friendly, professional, humorous, intellectual, empathetic).",
        user: qa,
        temperature: 0.6,
      });
      return j(parsed);
    } catch (e) {
      if (e instanceof OpenAIError) return j({ error: e.message }, e.status);
      return j({ archetype: "Curious Mind", summary: "Analysis unavailable.", traits: [], recommended_clone_tone: "friendly" });
    }
  } catch (e: any) {
    return j({ error: e.message }, 500);
  }
});

function j(b: unknown, s = 200) {
  return new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
