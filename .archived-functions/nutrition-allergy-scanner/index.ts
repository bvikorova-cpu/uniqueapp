// Re-export wrapper - delegates to nutrition-ai
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { callOpenAI, corsHeaders, errorResponse, jsonResponse } from "../_shared/openai.ts";
import { deductAICredits } from "../_shared/credits.ts";

const SYSTEMS: Record<string, string> = {
  "nutrition-allergy-scanner": "You are a food-allergy expert. Analyze ingredients/food and flag allergens. Return JSON: {allergens_found[], cross_contamination_risks[], safe_for:[diets], warnings[], severity}.",
  "nutrition-barcode-scanner": "You are a nutrition database. Return JSON: {product_name, brand, calories_per_serving, macros:{p,c,f}, ingredients[], health_score_0_10, alternatives[]}.",
  "nutrition-body-predictor": "Predict body changes. Return JSON: {weeks_to_goal, predicted_weight_kg, body_fat_change, muscle_gain_kg, key_milestones[], risks[]}.",
  "nutrition-grocery-optimizer": "Optimize grocery list. Return JSON: {optimized_list:[{item, qty, est_price, reason}], total_cost, calories_per_dollar, swap_suggestions[]}.",
  "nutrition-hydration-coach": "Hydration coach. Return JSON: {daily_ml, schedule:[{time, ml, reminder}], electrolyte_advice}.",
  "nutrition-meal-challenge": "Create nutrition challenge. Return JSON: {challenge_name, duration_days, daily_tasks[], rewards[], difficulty}.",
  "nutrition-supplement-advisor": "Recommend supplements. Return JSON: {supplements:[{name, dose, timing, benefit, evidence_level}], avoid[], disclaimer}.",
  "nutrition-weekly-progress": "Analyze weekly nutrition. Return JSON: {summary, wins[], improvements[], next_week_focus[], score_0_100}.",
  "scan-food": "Identify food. Return JSON: {food_name, portion_g, calories, macros:{p,c,f}, micronutrients[], health_tags[]}.",
  "analyze-restaurant-menu": "Pick healthy menu items. Return JSON: {top_picks:[{item, why, est_calories}], avoid:[{item, why}], modifications[]}.",
  "masterchef-ai": "MasterChef recipe. Return JSON: {recipe_name, servings, ingredients[], steps[], time_minutes, nutrition_per_serving, chef_tip}.",
  "generate-workout-plan": "Workout plan. Return JSON: {plan_name, weeks, days_per_week, schedule:[{day, focus, exercises:[{name, sets, reps, rest_sec}]}], progression_notes}.",
};

export function buildHandler(systemPrompt: string) {
  return async (req: Request) => {
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
      const creditDenied = await deductAICredits(user.id, 3, "nutrition-allergy-scanner");
      if (creditDenied) return creditDenied;
      const body = await req.json();
      const userInput = JSON.stringify(body).slice(0, 4000);
      const result = await callOpenAI({ system: systemPrompt, user: userInput, json: true, temperature: 0.7 });
      const parsed = safeJson(result);
      return jsonResponse({ success: true, result: parsed ?? result, data: parsed, text: result });
    } catch (e: any) {
      return errorResponse(e.message || "Failed");
    }
  };
}

function safeJson(s: string) { try { return JSON.parse(s); } catch { return null; } }

serve(buildHandler(SYSTEMS["nutrition-allergy-scanner"]));
