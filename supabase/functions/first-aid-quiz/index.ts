import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { requireAiCredits } from "../_shared/credit-check.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

async function askGemini(model: string, topic: string) {
  const key = Deno.env.get("LOVABLE_API_KEY");
  if (!key) throw Object.assign(new Error("AI not configured"), { status: 500 });
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content:
            'You are a certified first aid instructor. Reply with ONLY a raw JSON object, no markdown, no prose: {"questions":[{"question":"...","options":["A","B","C","D"],"correct":0,"explanation":"..."}]}. Exactly 5 questions, 4 options each, "correct" is the 0-based index.',
        },
        { role: "user", content: `Create 5 multiple-choice first aid quiz questions about: ${topic}` },
      ],
      response_format: { type: "json_object" },
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw Object.assign(new Error(text || "AI request failed"), { status: res.status });
  }
  const data = await res.json();
  return String(data?.choices?.[0]?.message?.content ?? "");
}

function parseQuestions(raw: string) {
  const text = raw.replace(/```(?:json)?/gi, "").trim();
  const candidates = [text];
  const obj = text.match(/\{[\s\S]*\}/);
  if (obj) candidates.push(obj[0]);
  const arr = text.match(/\[[\s\S]*\]/);
  if (arr) candidates.push(arr[0]);
  for (const c of candidates) {
    try {
      const parsed = JSON.parse(c);
      const list = Array.isArray(parsed) ? parsed : parsed?.questions;
      if (!Array.isArray(list)) continue;
      const clean = list
        .filter((x: any) => x && typeof x.question === "string" && Array.isArray(x.options) && x.options.length >= 2)
        .map((x: any) => ({
          question: String(x.question),
          options: x.options.map((o: any) => String(o)),
          correct: Number.isInteger(x.correct) ? x.correct : Number(x.correct) || 0,
          explanation: String(x.explanation ?? ""),
        }));
      if (clean.length > 0) return clean;
    } catch { /* next candidate */ }
  }
  return null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const auth = await requireAiCredits(req, corsHeaders, {
      credits: 3,
      usageType: "first_aid_quiz",
    });
    if (auth.errorResponse) return auth.errorResponse;

    let body: any = {};
    try { body = await req.json(); } catch { body = {}; }
    const topic = String(body?.topic || "general first aid").slice(0, 120);

    const models = ["google/gemini-2.5-flash", "google/gemini-2.5-flash-lite"];
    let questions: ReturnType<typeof parseQuestions> = null;
    let lastError: { message: string; status: number } | null = null;

    for (const model of models) {
      for (let attempt = 0; attempt < 2 && !questions; attempt++) {
        try {
          questions = parseQuestions(await askGemini(model, topic));
        } catch (e: any) {
          lastError = { message: e?.message || "AI request failed", status: e?.status || 500 };
          if (lastError.status === 429) await new Promise((r) => setTimeout(r, 900 * (attempt + 1)));
          else break;
        }
      }
      if (questions) break;
    }

    if (!questions) {
      if (lastError?.status === 429) return json({ error: "AI is busy right now. Please try again in a moment." }, 429);
      if (lastError?.status === 402) return json({ error: "AI credits exhausted. Please try again later." }, 402);
      return json({ error: "Could not generate the quiz. Please try again." }, 502);
    }

    await auth.deduct?.().catch((e) => console.error("deduct failed", e));
    return json({ questions });
  } catch (error) {
    console.error("first-aid-quiz error:", error);
    return json({ error: error instanceof Error ? error.message : "Failed to generate quiz" }, 500);
  }
});
