import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY") ?? "";

const COSTS: Record<string, number> = { photo_math: 3, pdf_to_quiz: 3 };

const jsonRes = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const aiGateway = (body: unknown) =>
  fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Lovable-API-Key": LOVABLE_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    if (!LOVABLE_API_KEY) return jsonRes({ error: "LOVABLE_API_KEY not configured" }, 500);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return jsonRes({ error: "Missing Authorization" }, 401);
    const supa = createClient(SUPABASE_URL, ANON_KEY);
    const { data: userData } = await supa.auth.getUser(authHeader.replace("Bearer ", ""));
    if (!userData.user) return jsonRes({ error: "Not authenticated" }, 401);
    const userId = userData.user.id;

    const body = await req.json();
    const action = body?.action as string;
    const cost = COSTS[action];
    if (!cost) return jsonRes({ error: "Unknown action" }, 400);

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    // Unified balance = free tier + paid ai_credits
    const [{ data: paidRow }, { data: freeRow }] = await Promise.all([
      admin.from("ai_credits").select("credits_remaining").eq("user_id", userId).maybeSingle(),
      admin.from("free_tier_credits").select("balance").eq("user_id", userId).maybeSingle(),
    ]);
    const paidBalance = paidRow?.credits_remaining ?? 0;
    const freeBalance = (freeRow as any)?.balance ?? 0;
    const totalBalance = paidBalance + freeBalance;
    if (totalBalance < cost) {
      return jsonRes({ error: "Insufficient credits", credits_remaining: totalBalance, cost }, 402);
    }

    const deductUnified = async () => {
      // Spend from free first, remainder from paid
      let remaining = cost;
      const fromFree = Math.min(freeBalance, remaining);
      remaining -= fromFree;
      if (fromFree > 0) {
        await admin.rpc("consume_free_tier_credits", { _amount: fromFree, _reason: `education_${action}` });
      }
      if (remaining > 0) {
        await admin.rpc("deduct_ai_credits", {
          p_user_id: userId, p_amount: remaining, p_reason: `education_${action}`, p_source: "education-ai",
        });
      }
      await admin.from("ai_usage_history").insert({
        user_id: userId, usage_type: action, credits_used: cost, description: `education-ai:${action}`,
      });
    };

    // ─── PHOTO MATH ───
    if (action === "photo_math") {
      const { imageDataUrl, question } = body;
      if (!imageDataUrl || !String(imageDataUrl).startsWith("data:image/")) {
        return jsonRes({ error: "imageDataUrl required" }, 400);
      }
      const res = await aiGateway({
        model: "google/gemini-3.6-flash",
        messages: [
          { role: "system", content: "You are a brilliant math tutor. Look at the photo of the math problem and explain the solution step by step. Use LaTeX ($...$ inline, $$...$$ block). Always answer in English. If not a math problem, say so politely." },
          { role: "user", content: [
              { type: "text", text: question || "Solve this problem step by step." },
              { type: "image_url", image_url: { url: imageDataUrl } },
            ] },
        ],
      });

      if (res.status === 429) return jsonRes({ error: "Rate limit, try again shortly" }, 429);
      if (res.status === 402) return jsonRes({ error: "AI credits exhausted on platform" }, 402);
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        console.error("[education-ai] gateway error", res.status, txt);
        return jsonRes({ error: `AI error: ${res.status}` }, 500);
      }
      const data = await res.json();
      const solution = data?.choices?.[0]?.message?.content ?? "";

      await deductUnified();
      return jsonRes({ solution, credits_remaining: totalBalance - cost, cost });
    }

    // ─── PDF → QUIZ ───
    if (action === "pdf_to_quiz") {
      const { text, numQuestions = 8, difficulty = "medium" } = body;
      const safeText = typeof text === "string" ? text.slice(0, 20000) : "";
      if (safeText.trim().length < 50) return jsonRes({ error: "Text too short" }, 400);
      const safeN = Math.max(3, Math.min(20, Number(numQuestions) || 8));
      const res = await aiGateway({
        model: "google/gemini-3.6-flash",
        messages: [
          { role: "system", content: "You are a quiz designer. From the study text, generate a multiple-choice quiz. Always English. Each question has 4 options and one correct index (0-3). Respond ONLY by calling the create_quiz tool." },
          { role: "user", content: `Difficulty: ${difficulty}. Create ${safeN} questions from:\n\n${safeText}` },
        ],
        tools: [{ type: "function", function: {
          name: "create_quiz", description: "Return the generated quiz",
          parameters: { type: "object", properties: {
            title: { type: "string" },
            questions: { type: "array", items: { type: "object", properties: {
              question: { type: "string" },
              options: { type: "array", items: { type: "string" } },
              correct_index: { type: "integer" },
              explanation: { type: "string" } },
              required: ["question", "options", "correct_index", "explanation"] } } },
            required: ["title", "questions"] } } }],
        tool_choice: { type: "function", function: { name: "create_quiz" } },
      });

      if (res.status === 429) return jsonRes({ error: "Rate limit, try again shortly" }, 429);
      if (res.status === 402) return jsonRes({ error: "AI credits exhausted on platform" }, 402);
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        console.error("[education-ai] gateway error", res.status, txt);
        return jsonRes({ error: `AI error: ${res.status}` }, 500);
      }
      const data = await res.json();
      const args = data?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
      if (!args) throw new Error("AI did not return quiz");

      await deductUnified();
      return jsonRes({ quiz: JSON.parse(args), credits_remaining: totalBalance - cost, cost });
    }

    return jsonRes({ error: "Unknown action" }, 400);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[education-ai] ERROR", msg);
    return jsonRes({ error: msg }, 500);
  }
});
