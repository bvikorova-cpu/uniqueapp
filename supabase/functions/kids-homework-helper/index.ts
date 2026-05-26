// Kids Homework Helper — text + photo (OCR) AI tutor with step-by-step solutions.
// Costs 3 homework credits per question. Uses Lovable AI Gateway (Gemini vision).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const COST = 3;
const MODEL = "gpt-4o-mini";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY")!;

const ALLOWED_SUBJECTS = ["math", "science", "english", "history", "geography"];
const SUBJECT_HINTS: Record<string, string> = {
  math: "Show every calculation step. Use plain arithmetic; avoid LaTeX.",
  science: "Explain the underlying concept and give a real-world example.",
  english: "Use simple grammar terms and short examples.",
  history: "Place events on a timeline and explain cause/effect.",
  geography: "Reference real places, climates and maps when possible.",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function stripJsonFence(s: string) {
  return s.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Missing authorization header" }, 401);

    const userClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) return json({ error: "Invalid bearer token" }, 401);
    const user = userData.user;

    const body = await req.json().catch(() => ({}));
    const subject = String(body.subject || "").toLowerCase();
    const question = String(body.question || "").trim();
    const difficulty = String(body.difficulty || "medium");
    const imageBase64: string | null = body.imageBase64 || null;

    if (!ALLOWED_SUBJECTS.includes(subject)) {
      return json({ error: "Invalid subject" }, 400);
    }
    if (!question && !imageBase64) {
      return json({ error: "Question or photo required" }, 400);
    }
    if (question.length > 2000) return json({ error: "Question too long" }, 400);

    // Admin client (service role) for credit gating
    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    // Ensure & check credits
    const { data: credRow } = await admin
      .from("homework_credits")
      .select("credits_remaining")
      .eq("user_id", user.id)
      .maybeSingle();

    let balance = credRow?.credits_remaining ?? 0;
    if (!credRow) {
      await admin.from("homework_credits").insert({
        user_id: user.id, credits_remaining: 0, total_credits_purchased: 0,
      });
    }
    if (balance < COST) {
      return json({ error: "Insufficient credits", credits_remaining: balance, cost: COST }, 402);
    }

    // Build prompt
    const system = `You are a friendly, encouraging tutor for kids aged 8-14.
Subject: ${subject}. Difficulty: ${difficulty}.
${SUBJECT_HINTS[subject] || ""}
Rules:
- Be age-appropriate, safe, and never reveal answers without explaining the path to them.
- If the request is not school-related, set wasFiltered=true and gently redirect.
- Output STRICT JSON only, no prose around it.
Schema:
{
  "explanation": "short conversational explanation (markdown ok, 2-4 sentences)",
  "steps": [{"title":"Step 1 …","detail":"what to do, with the actual computation/reasoning"}],
  "finalAnswer": "the answer in one short sentence (or empty string if not applicable)",
  "commonMistakes": ["mistake kids often make", "..."],
  "funFacts": ["one tiny fun fact"],
  "wasFiltered": false
}`;

    const userContent: any[] = [];
    if (imageBase64) {
      userContent.push({
        type: "image_url",
        image_url: { url: imageBase64.startsWith("data:") ? imageBase64 : `data:image/jpeg;base64,${imageBase64}` },
      });
      userContent.push({
        type: "text",
        text: `Photo of homework problem. ${question ? `Student also wrote: "${question}"` : "Read it carefully (OCR) and solve."}`,
      });
    } else {
      userContent.push({ type: "text", text: question });
    }

    const aiResp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: system },
          { role: "user", content: userContent },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (aiResp.status === 429) return json({ error: "Rate limited, try again shortly" }, 429);
    if (aiResp.status === 402) return json({ error: "AI credits exhausted (workspace)" }, 402);
    if (!aiResp.ok) {
      const txt = await aiResp.text();
      console.error("AI error", aiResp.status, txt);
      return json({ error: "AI request failed" }, 500);
    }
    const aiJson = await aiResp.json();
    const raw = aiJson?.choices?.[0]?.message?.content || "{}";
    let parsed: any = {};
    try {
      parsed = JSON.parse(stripJsonFence(raw));
    } catch {
      parsed = { explanation: raw, steps: [], funFacts: [], wasFiltered: false };
    }

    // Deduct credits (only on success)
    const newBalance = balance - COST;
    await admin
      .from("homework_credits")
      .update({ credits_remaining: newBalance, last_used_at: new Date().toISOString() })
      .eq("user_id", user.id);

    // Award points (best-effort)
    await admin.rpc("increment_homework_points", { p_user_id: user.id, p_points: 10 }).catch(() => {});

    return json({
      explanation: parsed.explanation || "",
      steps: Array.isArray(parsed.steps) ? parsed.steps : [],
      finalAnswer: parsed.finalAnswer || "",
      commonMistakes: Array.isArray(parsed.commonMistakes) ? parsed.commonMistakes : [],
      funFacts: Array.isArray(parsed.funFacts) ? parsed.funFacts : [],
      wasFiltered: !!parsed.wasFiltered,
      credits_remaining: newBalance,
      cost: COST,
    });
  } catch (e: any) {
    console.error("homework-helper error", e);
    return json({ error: e?.message || "Internal error" }, 500);
  }
});
