import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { callOpenAI, corsHeaders, errorResponse, jsonResponse } from "../_shared/openai.ts";
import { deductAICredits } from "../_shared/credits.ts";

const MODELS = ["google/gemini-2.5-flash", "google/gemini-2.5-flash-lite"];

function isRetryable(msg: string) {
  return /rate limit|429|5\d\d|overload|timeout|temporarily/i.test(msg);
}

async function generateWithFallback(system: string, user: string): Promise<string> {
  let lastErr: unknown = null;
  for (const model of MODELS) {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        return await callOpenAI({ system, user, model, json: true, temperature: 0.7, max_tokens: 16000 });
      } catch (e) {
        lastErr = e;
        const msg = e instanceof Error ? e.message : String(e);
        if (!isRetryable(msg)) break;
        await new Promise((r) => setTimeout(r, 800 * (attempt + 1)));
      }
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error("Meal plan failed");
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return errorResponse("Missing authorization", 401);
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return errorResponse("Not authenticated", 401);

    const body = await req.json();
    const { goal = "balanced", calories = 2000, days = 7, diet = "standard", allergies = [], preferences = "" } = body;

    // Ask for a compact rotation (max 3 unique days) and expand it locally.
    // Requesting every single day makes the JSON overflow the token limit and truncate.
    const rotation = Math.min(Number(days) || 7, 3);
    const system = "You are a nutritionist. Return ONLY minified JSON, no markdown: {plan:[{day, meals:[{type, name, calories, macros:{p,c,f}, ingredients[], prep_minutes}]}], shopping_list[], total_daily_calories}. Keep ingredient lists short (max 6 items).";
    const userPrompt = `Goal: ${goal}. Daily calories: ${calories}. Create exactly ${rotation} distinct day(s) that will be rotated across ${days} days. Diet: ${diet}. Allergies: ${allergies.join(", ") || "none"}. Notes: ${preferences}`;

    // Charge only after we know the AI can respond, so rate limits don't burn credits.
    let result: string;
    try {
      result = await generateWithFallback(system, userPrompt);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "AI unavailable";
      return errorResponse(
        isRetryable(msg)
          ? "AI is busy right now. No credits were charged — please try again in a few seconds."
          : msg,
        503,
      );
    }

    const parsed = safeJson(result);
    const baseDays: any[] = Array.isArray(parsed?.plan) ? parsed.plan : Array.isArray(parsed?.days) ? parsed.days : [];
    if (!baseDays.length) {
      return errorResponse("The AI response could not be read. No credits were charged — please try again.", 502);
    }

    const totalDays = Math.max(1, Math.min(Number(days) || 7, 90));
    const plan = {
      ...parsed,
      plan: Array.from({ length: totalDays }, (_, i) => ({
        ...baseDays[i % baseDays.length],
        day: i + 1,
      })),
      shopping_list: parsed?.shopping_list ?? [],
      total_daily_calories: parsed?.total_daily_calories ?? calories,
    };

    const creditDenied = await deductAICredits(user.id, 50, "generate-meal-plan");
    if (creditDenied) return creditDenied;

    return jsonResponse({ success: true, plan, result: plan });
  } catch (e: any) {
    return errorResponse(e.message || "Meal plan failed");
  }
});

/** Tolerant JSON parse: strips fences and repairs truncated output. */
function safeJson(raw: string) {
  if (!raw) return null;
  let s = raw.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  const start = s.indexOf("{");
  if (start > 0) s = s.slice(start);
  try { return JSON.parse(s); } catch { /* repair below */ }

  // Trim trailing partial token, then balance brackets.
  let t = s.replace(/,\s*$/, "");
  const lastSafe = Math.max(t.lastIndexOf("}"), t.lastIndexOf("]"));
  if (lastSafe > 0) t = t.slice(0, lastSafe + 1);
  const stack: string[] = [];
  let inStr = false, esc = false;
  for (const ch of t) {
    if (esc) { esc = false; continue; }
    if (ch === "\\") { esc = true; continue; }
    if (ch === '"') { inStr = !inStr; continue; }
    if (inStr) continue;
    if (ch === "{" || ch === "[") stack.push(ch);
    else if (ch === "}" || ch === "]") stack.pop();
  }
  if (inStr) t += '"';
  while (stack.length) t += stack.pop() === "{" ? "}" : "]";
  try { return JSON.parse(t); } catch { return null; }
}
