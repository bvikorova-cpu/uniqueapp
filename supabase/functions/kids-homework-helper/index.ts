// Kids Homework Helper — AI tutoring (paid-only, 3 homework_credits per question)
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const CREDITS_PER_QUESTION = 3;

const VALID_SUBJECTS = new Set([
  "math",
  "science",
  "english",
  "history",
  "geography",
  "art",
  "music",
  "computer",
  "language",
  "other",
]);
const VALID_DIFFICULTIES = new Set(["easy", "medium", "hard"]);

function jsonResp(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return jsonResp({ error: "Not authenticated" }, 401);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const supabase = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: authErr } = await supabase.auth.getClaims(token);
    if (authErr || !claimsData?.claims) {
      return jsonResp({ error: "Not authenticated" }, 401);
    }
    const userId = claimsData.claims.sub as string;

    const body = await req.json().catch(() => ({}));
    const subjectRaw = String(body.subject || "").trim().toLowerCase();
    const difficultyRaw = String(body.difficulty || "medium").trim().toLowerCase();
    const question = String(body.question || "").trim();

    const subject = VALID_SUBJECTS.has(subjectRaw) ? subjectRaw : "other";
    const difficulty = VALID_DIFFICULTIES.has(difficultyRaw) ? difficultyRaw : "medium";

    if (question.length < 5 || question.length > 1500) {
      return jsonResp({ error: "Question must be 5–1500 chars" }, 400);
    }

    // Check credits
    const { data: creditRow } = await supabase
      .from("homework_credits")
      .select("credits_remaining")
      .eq("user_id", userId)
      .maybeSingle();

    const remaining = creditRow?.credits_remaining ?? 0;
    if (remaining < CREDITS_PER_QUESTION) {
      return jsonResp(
        {
          error: `Not enough Homework credits. Need ${CREDITS_PER_QUESTION}, have ${remaining}.`,
          creditsRemaining: remaining,
          creditsRequired: CREDITS_PER_QUESTION,
        },
        402,
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return jsonResp({ error: "AI gateway not configured" }, 500);
    }

    const ageHint =
      difficulty === "easy"
        ? "ages 6–8, very simple words, short sentences, lots of analogies"
        : difficulty === "hard"
        ? "ages 11–12, slightly more technical vocabulary, real terms with brief definitions"
        : "ages 9–10, friendly and clear, simple definitions for any technical term";

    const systemPrompt = `You are a friendly, patient tutor for kids. Always reply in the same language as the question. Audience: ${ageHint}. Subject: ${subject}. Never give answers that could be unsafe. Encourage learning, never just dump the answer — guide the child to understand. If the question is harmful, refuse politely.`;

    const userPrompt = `Help with this ${subject} homework question (difficulty: ${difficulty}):

${question}

Return:
- A short kind intro (1 sentence).
- A clear step-by-step explanation.
- The final answer (clearly labeled).
- 2 short follow-up tips to help the child learn more.`;

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "submit_homework_help",
              description: "Return the homework help.",
              parameters: {
                type: "object",
                properties: {
                  intro: { type: "string" },
                  explanation: { type: "string" },
                  answer: { type: "string" },
                  tips: {
                    type: "array",
                    items: { type: "string" },
                    minItems: 2,
                    maxItems: 2,
                  },
                  wasFiltered: { type: "boolean" },
                },
                required: ["intro", "explanation", "answer", "tips"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "submit_homework_help" } },
      }),
    });

    if (aiResp.status === 429) {
      return jsonResp({ error: "Rate limit exceeded, please try again later." }, 429);
    }
    if (aiResp.status === 402) {
      return jsonResp({ error: "AI credits exhausted on the gateway. Please contact support." }, 402);
    }
    if (!aiResp.ok) {
      const t = await aiResp.text();
      console.error("AI gateway error", aiResp.status, t);
      return jsonResp({ error: "AI gateway error" }, 500);
    }

    const aiJson = await aiResp.json();
    const toolCall = aiJson?.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      console.error("No tool call in AI response", JSON.stringify(aiJson));
      return jsonResp({ error: "AI returned no answer. Please try again." }, 500);
    }

    let parsed: {
      intro: string;
      explanation: string;
      answer: string;
      tips: string[];
      wasFiltered?: boolean;
    };
    try {
      parsed = JSON.parse(toolCall.function.arguments);
    } catch (e) {
      console.error("Failed to parse AI tool args", e);
      return jsonResp({ error: "AI returned invalid format. Please try again." }, 500);
    }

    if (!parsed.answer || !parsed.explanation) {
      return jsonResp({ error: "AI returned incomplete answer. Please try again." }, 500);
    }

    // Deduct credits via service role (after success)
    const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const adminClient = createClient(supabaseUrl, serviceRole);
    await adminClient
      .from("homework_credits")
      .update({
        credits_remaining: remaining - CREDITS_PER_QUESTION,
        last_used_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    await adminClient.from("ai_usage_history").insert({
      user_id: userId,
      usage_type: "kids_homework",
      credits_used: CREDITS_PER_QUESTION,
      description: `Homework help (${subject}, ${difficulty})`,
    });

    return jsonResp({
      intro: parsed.intro,
      explanation: parsed.explanation,
      answer: parsed.answer,
      tips: parsed.tips ?? [],
      wasFiltered: parsed.wasFiltered ?? false,
      creditsRemaining: remaining - CREDITS_PER_QUESTION,
    });
  } catch (e) {
    console.error("kids-homework-helper error", e);
    return jsonResp({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});
