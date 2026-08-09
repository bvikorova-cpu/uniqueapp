// Universal nutrition router - consolidates 9 nutrition-* functions.
// Frontend calls remain unchanged: supabase.functions.invoke("nutrition-coach-chat", {...})
// proxyMap.ts rewrites them to ("nutrition-router", { ...body, action: "coach_chat" }).
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { callOpenAI, corsHeaders, errorResponse, jsonResponse } from "../_shared/openai.ts";
import { deductAICredits, refundAICredits } from "../_shared/credits.ts";
import { checkTestMode } from "../_shared/testMode.ts";

/** Tolerant JSON parser: strips fences, extracts the object, repairs truncation. */
function safeJson(raw: string): any | null {
  let text = String(raw ?? "").trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  const start = text.indexOf("{");
  if (start > 0) text = text.slice(start);
  try { return JSON.parse(text); } catch {}
  let repaired = text.replace(/,\s*$/, "");
  const braces = (repaired.match(/\{/g) || []).length - (repaired.match(/\}/g) || []).length;
  const brackets = (repaired.match(/\[/g) || []).length - (repaired.match(/\]/g) || []).length;
  repaired += "]".repeat(Math.max(0, brackets)) + "}".repeat(Math.max(0, braces));
  try { return JSON.parse(repaired); } catch { return null; }
}

type Spec = { system: string; cost: number; temperature?: number; chat?: boolean };

const ACTIONS: Record<string, Spec> = { coach_chat: {
    system: "You are a certified nutrition coach. Give evidence-based advice on diet, macros, meal timing, supplements & fitness nutrition. Be friendly, specific, actionable. 2-5 sentences. Do not give medical diagnoses.",
    cost: 2,
    temperature: 0.7,
    chat: true },
  allergy_scanner: {
    system: `You are a clinical food-allergy and food-labelling expert. Analyze the ingredients/dish against the user's known allergies. Be thorough, specific and name concrete ingredients.
Return ONLY JSON:
{
 "is_safe": boolean,
 "risk_level": "none|low|moderate|high|severe",
 "summary": string,
 "detected_allergens": [{"allergen": string, "source": string, "certainty": "confirmed|likely|possible", "severity": "mild|moderate|severe", "typical_reaction": string, "hidden_names": [string]}],
 "cross_contamination_risks": [string],
 "hidden_ingredient_watchlist": [{"name": string, "why": string}],
 "safe_alternatives": [string],
 "label_reading_tips": [string],
 "safe_for": [string],
 "not_suitable_for": [string],
 "emergency_advice": [string],
 "questions_to_ask_restaurant": [string],
 "disclaimer": string
}
Rules: check every listed allergy explicitly (even if not found). Include at least 4 cross-contamination risks, 4 safe alternatives, 4 label-reading tips and 3 restaurant questions. Mention EU's 14 major allergens where relevant. No markdown, JSON only.`,
    cost: 5},

  barcode_scanner: {
    system: "You are a nutrition database. Return JSON: {product_name, brand, calories_per_serving, macros:{p,c,f}, ingredients[], health_score_0_10, alternatives[]}.",
    cost: 3},
  body_predictor: {
    system: "Predict body changes. Return JSON: {weeks_to_goal, predicted_weight_kg, body_fat_change, muscle_gain_kg, key_milestones[], risks[]}.",
    cost: 10},
  grocery_optimizer: {
    system: `You are a professional grocery budget optimizer and meal planner. Be thorough and specific (real products, realistic EUR prices, exact quantities).
Return ONLY JSON:
{
 "total_cost": number,
 "budget": number,
 "savings_percent": number,
 "cost_per_person_per_day": number,
 "summary": string,
 "grocery_list": [{"name": string, "quantity": string, "price": number, "category": "Produce|Protein|Dairy|Grains|Pantry|Frozen|Other", "reason": string, "cheaper_alternative": string}],
 "category_totals": [{"category": string, "total": number, "percent": number}],
 "meal_suggestions": [{"name": string, "meal_type": "breakfast|lunch|dinner|snack", "day": number, "cost_per_serving": number, "calories": number, "protein_g": number, "ingredients": [string], "prep_minutes": number, "instructions": string}],
 "macros_per_day": {"calories": number, "protein_g": number, "carbs_g": number, "fat_g": number},
 "swap_suggestions": [{"from": string, "to": string, "saves_eur": number, "note": string}],
 "batch_cooking_tips": [string],
 "waste_reduction_tips": [string],
 "shopping_strategy": [string]
}
Rules: cover every requested day with breakfast, lunch and dinner (plus snacks) — do not stop early. At least 20 grocery items. Keep total_cost <= budget and compute savings_percent vs a typical unoptimized shop.`,
    cost: 6},

  hydration_coach: {
    system: "Hydration coach. Return JSON: {daily_ml, schedule:[{time, ml, reminder}], electrolyte_advice}.",
    cost: 3},
  meal_challenge: {
    system: "Create nutrition challenge. Return JSON: {challenge_name, duration_days, daily_tasks[], rewards[], difficulty}.",
    cost: 8},
  supplement_advisor: {
    system: "Recommend supplements. Return JSON: {supplements:[{name, dose, timing, benefit, evidence_level}], avoid[], disclaimer}.",
    cost: 8},
  weekly_progress: {
    system: "Analyze weekly nutrition. Return JSON: {summary, wins[], improvements[], next_week_focus[], score_0_100}.",
    cost: 6} };

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  let userId: string | null = null;
  let cost = 0;
  let charged = false;
  try {
    // Health probe: no auth, no credits. Used by health-check function + CI.
    const url = new URL(req.url);
    const probeBody = req.method === "GET" ? {} : await req.clone().json().catch(() => ({}));
    if (url.searchParams.get("action") === "ping" || (probeBody as any)?.action === "ping") {
      return jsonResponse({ ok: true, router: "nutrition-router", actions: Object.keys(ACTIONS) });
    }

    // Test-mode bypass (no auth/credit deduction, no OpenAI call).
    // Used by E2E to validate every action's request/response shape.
    const tm = checkTestMode(req);
    if (tm) {
      const tmBody = await req.json().catch(() => ({}));
      const action = String((tmBody as any)?.action ?? "").trim();
      const spec = ACTIONS[action];
      if (!spec) return errorResponse(`Unknown nutrition action: ${action}`, 400);
      return tm.stub(action, spec);
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return errorResponse("Missing authorization", 401);
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return errorResponse("Not authenticated", 401);

    const body = await req.json().catch(() => ({}));
    const action = String(body?.action ?? "").trim();
    const spec = ACTIONS[action];
    if (!spec) return errorResponse(`Unknown nutrition action: ${action}`, 400);

    const creditDenied = await deductAICredits(user.id, spec.cost, `nutrition-router:${action}`);
    if (creditDenied) return creditDenied;
    userId = user.id;
    cost = spec.cost;
    charged = true;

    // Transient AI rate limits / hiccups are retried with backoff instead of
    // bubbling up as an edge error.
    const withRetry = async (fn: () => Promise<string>): Promise<string> => {
      let lastError: any = null;
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          return await fn();
        } catch (e: any) {
          lastError = e;
          const status = Number(e?.status ?? 500);
          if (status !== 429 && status !== 402 && status < 500) throw e;
          if (attempt < 2) await new Promise((r) => setTimeout(r, (attempt + 1) * 1500));
        }
      }
      throw lastError;
    };

    if (spec.chat) {
      const messages = Array.isArray(body?.messages) ? body.messages : [];
      const conversation = messages.slice(-10).map((m: any) => ({ role: m.role, content: m.content }));
      const lastUser = [...conversation].reverse().find((m: any) => m.role === "user")?.content || "Hi";
      const history = conversation.slice(0, -1).map((m: any) => `${m.role}: ${m.content}`).join("\n");
      const reply = await withRetry(() => callOpenAI({
        system: spec.system,
        user: history ? `${history}\nuser: ${lastUser}` : lastUser,
        temperature: spec.temperature ?? 0.7 }));
      return jsonResponse({ reply, message: reply });
    }

    const userInput = JSON.stringify(body).slice(0, 4000);
    const result = await withRetry(() => callOpenAI({ system: spec.system,
      user: userInput,
      json: true,
      max_tokens: 4096,
      temperature: spec.temperature ?? 0.75 }));
    const parsed = safeJson(result);
    const value = parsed ?? result;
    const legacyKey: Record<string, string> = {
      allergy_scanner: "analysis",
      barcode_scanner: "product",
      body_predictor: "prediction",
      grocery_optimizer: "plan",
      hydration_coach: "plan",
      meal_challenge: "challenge",
      supplement_advisor: "recommendations",
      weekly_progress: "report",
    };
    const alias = legacyKey[action];
    return jsonResponse({
      success: true,
      result: value,
      data: parsed,
      text: result,
      reply: result,
      ...(alias ? { [alias]: value } : {}),
    });
  } catch (e: any) {
    if (charged && userId && cost) await refundAICredits(userId, cost, "nutrition-router");
    const status = Number(e?.status ?? 500);
    if (status === 429) {
      return errorResponse("AI is busy right now. Your credits were not used — please try again in a few seconds.", 429);
    }
    if (status === 402 || status >= 500) {
      return errorResponse("AI is temporarily unavailable. Your credits were refunded — please try again.", 503);
    }
    return errorResponse(e?.message || "Nutrition request failed", status >= 400 && status < 600 ? status : 500);
  }
});
