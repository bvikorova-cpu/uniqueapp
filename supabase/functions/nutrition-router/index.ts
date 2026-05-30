// Universal nutrition router - consolidates 9 nutrition-* functions.
// Frontend calls remain unchanged: supabase.functions.invoke("nutrition-coach-chat", {...})
// proxyMap.ts rewrites them to ("nutrition-router", { ...body, action: "coach_chat" }).
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { callOpenAI, corsHeaders, errorResponse, jsonResponse } from "../_shared/openai.ts";
import { deductAICredits } from "../_shared/credits.ts";
import { checkTestMode } from "../_shared/testMode.ts";

type Spec = { system: string; cost: number; temperature?: number; chat?: boolean };

const ACTIONS: Record<string, Spec> = {
  coach_chat: {
    system: "You are a certified nutrition coach. Give evidence-based advice on diet, macros, meal timing, supplements & fitness nutrition. Be friendly, specific, actionable. 2-5 sentences. Do not give medical diagnoses.",
    cost: 1,
    temperature: 0.7,
    chat: true,
  },
  allergy_scanner: {
    system: "You are a food-allergy expert. Analyze ingredients/food and flag allergens. Return JSON: {allergens_found[], cross_contamination_risks[], safe_for:[diets], warnings[], severity}.",
    cost: 3,
  },
  barcode_scanner: {
    system: "You are a nutrition database. Return JSON: {product_name, brand, calories_per_serving, macros:{p,c,f}, ingredients[], health_score_0_10, alternatives[]}.",
    cost: 1,
  },
  body_predictor: {
    system: "Predict body changes. Return JSON: {weeks_to_goal, predicted_weight_kg, body_fat_change, muscle_gain_kg, key_milestones[], risks[]}.",
    cost: 5,
  },
  grocery_optimizer: {
    system: "Optimize grocery list. Return JSON: {optimized_list:[{item, qty, est_price, reason}], total_cost, calories_per_dollar, swap_suggestions[]}.",
    cost: 3,
  },
  hydration_coach: {
    system: "Hydration coach. Return JSON: {daily_ml, schedule:[{time, ml, reminder}], electrolyte_advice}.",
    cost: 2,
  },
  meal_challenge: {
    system: "Create nutrition challenge. Return JSON: {challenge_name, duration_days, daily_tasks[], rewards[], difficulty}.",
    cost: 3,
  },
  supplement_advisor: {
    system: "Recommend supplements. Return JSON: {supplements:[{name, dose, timing, benefit, evidence_level}], avoid[], disclaimer}.",
    cost: 3,
  },
  weekly_progress: {
    system: "Analyze weekly nutrition. Return JSON: {summary, wins[], improvements[], next_week_focus[], score_0_100}.",
    cost: 4,
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    // Health probe: no auth, no credits. Used by health-check function + CI.
    const url = new URL(req.url);
    const probeBody = req.method === "GET" ? {} : await req.clone().json().catch(() => ({}));
    if (url.searchParams.get("action") === "ping" || (probeBody as any)?.action === "ping") {
      return jsonResponse({ ok: true, router: "nutrition-router", actions: Object.keys(ACTIONS) });
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

    if (spec.chat) {
      const messages = Array.isArray(body?.messages) ? body.messages : [];
      const conversation = messages.slice(-10).map((m: any) => ({ role: m.role, content: m.content }));
      const lastUser = [...conversation].reverse().find((m: any) => m.role === "user")?.content || "Hi";
      const history = conversation.slice(0, -1).map((m: any) => `${m.role}: ${m.content}`).join("\n");
      const reply = await callOpenAI({
        system: spec.system,
        user: history ? `${history}\nuser: ${lastUser}` : lastUser,
        temperature: spec.temperature ?? 0.7,
      });
      return jsonResponse({ reply, message: reply });
    }

    const userInput = JSON.stringify(body).slice(0, 4000);
    const result = await callOpenAI({
      system: spec.system,
      user: userInput,
      json: true,
      temperature: spec.temperature ?? 0.75,
    });
    let parsed: any = null;
    try { parsed = JSON.parse(result); } catch {}
    return jsonResponse({ success: true, result: parsed ?? result, data: parsed, text: result, reply: result });
  } catch (e: any) {
    return errorResponse(e?.message || "Nutrition router failed");
  }
});
