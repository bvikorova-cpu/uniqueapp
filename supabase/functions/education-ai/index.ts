import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ai = (body: unknown, key: string) =>
  fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY not configured");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing Authorization");
    const supa = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    );
    const { data: userData } = await supa.auth.getUser(authHeader.replace("Bearer ", ""));
    if (!userData.user) throw new Error("Not authenticated");

    const body = await req.json();
    const action = body?.action as string;

    // ─── PHOTO MATH ───
    if (action === "photo_math") {
      const { imageDataUrl, question } = body;
      if (!imageDataUrl || !String(imageDataUrl).startsWith("data:image/")) {
        return new Response(JSON.stringify({ error: "imageDataUrl required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const res = await ai({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a brilliant math tutor. Look at the photo of the math problem and explain the solution step by step. Use LaTeX ($...$ inline, $$...$$ block). Always answer in English. If not a math problem, say so politely.",
          },
          {
            role: "user",
            content: [
              { type: "text", text: question || "Solve this problem step by step." },
              { type: "image_url", image_url: { url: imageDataUrl } },
            ],
          },
        ],
      }, OPENAI_API_KEY);

      if (res.status === 429) return new Response(JSON.stringify({ error: "Rate limit" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (res.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (!res.ok) throw new Error(`AI error: ${res.status}`);
      const data = await res.json();
      return new Response(JSON.stringify({ solution: data?.choices?.[0]?.message?.content ?? "" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ─── PDF → QUIZ ───
    if (action === "pdf_to_quiz") {
      const { text, numQuestions = 8, difficulty = "medium" } = body;
      const safeText = typeof text === "string" ? text.slice(0, 20000) : "";
      if (safeText.trim().length < 50) {
        return new Response(JSON.stringify({ error: "Text too short" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const safeN = Math.max(3, Math.min(20, Number(numQuestions) || 8));
      const res = await ai({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a quiz designer. From the study text, generate a multiple-choice quiz. Always English. Each question has 4 options and one correct index (0-3). Respond ONLY by calling the create_quiz tool.",
          },
          { role: "user", content: `Difficulty: ${difficulty}. Create ${safeN} questions from:\n\n${safeText}` },
        ],
        tools: [{
          type: "function",
          function: {
            name: "create_quiz",
            description: "Return the generated quiz",
            parameters: {
              type: "object",
              properties: {
                title: { type: "string" },
                questions: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      question: { type: "string" },
                      options: { type: "array", items: { type: "string" }, minItems: 4, maxItems: 4 },
                      correct_index: { type: "integer", minimum: 0, maximum: 3 },
                      explanation: { type: "string" },
                    },
                    required: ["question", "options", "correct_index", "explanation"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["title", "questions"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "create_quiz" } },
      }, OPENAI_API_KEY);

      if (res.status === 429) return new Response(JSON.stringify({ error: "Rate limit" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (res.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (!res.ok) throw new Error(`AI error: ${res.status}`);
      const data = await res.json();
      const args = data?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
      if (!args) throw new Error("AI did not return quiz");
      return new Response(JSON.stringify({ quiz: JSON.parse(args) }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[education-ai] ERROR", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
