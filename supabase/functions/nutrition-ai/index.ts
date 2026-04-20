import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import { callOpenAI, corsHeaders, errorResponse, jsonResponse } from "../_shared/openai.ts";

/**
 * Universal nutrition AI handler - covers all nutrition-* features.
 * Actions: allergy_scanner, barcode_scanner, body_predictor, grocery_optimizer,
 * hydration_coach, meal_challenge, supplement_advisor, weekly_progress,
 * scan_food, analyze_restaurant_menu, masterchef, workout_plan
 */
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
    const { action = "general", input = "", prompt = "", ...rest } = body;
    const userInput = (input || prompt || JSON.stringify(rest)).slice(0, 4000);
    const actionKey = action.replace(/-/g, "_");

    const systems: Record<string, string> = {
      allergy_scanner: "You are a food-allergy expert. Analyze ingredients/food and flag allergens. Return JSON: {allergens_found[], cross_contamination_risks[], safe_for:[diets], warnings[], severity}.",
      barcode_scanner: "You are a nutrition database. Given barcode/product info, return JSON: {product_name, brand, calories_per_serving, macros:{p,c,f}, ingredients[], health_score_0_10, alternatives[]}.",
      body_predictor: "Predict body changes based on diet/training. Return JSON: {weeks_to_goal, predicted_weight_kg, body_fat_change, muscle_gain_kg, key_milestones[], risks[]}.",
      grocery_optimizer: "Optimize a grocery list for budget+nutrition. Return JSON: {optimized_list:[{item, qty, est_price, reason}], total_cost, calories_per_dollar, swap_suggestions[]}.",
      hydration_coach: "You are a hydration coach. Calculate daily water needs and schedule. Return JSON: {daily_ml, schedule:[{time, ml, reminder}], electrolyte_advice}.",
      meal_challenge: "Create a fun nutrition challenge. Return JSON: {challenge_name, duration_days, daily_tasks[], rewards[], difficulty}.",
      supplement_advisor: "Recommend safe supplements based on goals/diet. Return JSON: {supplements:[{name, dose, timing, benefit, evidence_level}], avoid[], disclaimer}.",
      weekly_progress: "Analyze a week of nutrition data. Return JSON: {summary, wins[], improvements[], next_week_focus[], score_0_100}.",
      scan_food: "Identify a food and give nutrition. Return JSON: {food_name, portion_g, calories, macros:{p,c,f}, micronutrients[], health_tags[]}.",
      analyze_restaurant_menu: "Pick the healthiest options from a menu. Return JSON: {top_picks:[{item, why, est_calories}], avoid:[{item, why}], modifications[]}.",
      masterchef: "You are MasterChef AI. Generate a recipe. Return JSON: {recipe_name, servings, ingredients[], steps[], time_minutes, nutrition_per_serving, chef_tip}.",
      workout_plan: "Generate a workout plan. Return JSON: {plan_name, weeks, days_per_week, schedule:[{day, focus, exercises:[{name, sets, reps, rest_sec}]}], progression_notes}.",
      general: "You are a nutrition assistant. Give helpful evidence-based advice. 3-5 sentences.",
    };

    const system = systems[actionKey] || systems.general;
    const wantsJson = actionKey !== "general";
    const result = await callOpenAI({ system, user: userInput, json: wantsJson, temperature: 0.7 });
    const parsed = wantsJson ? safeJson(result) : null;
    return jsonResponse({ success: true, action: actionKey, result: parsed ?? result, data: parsed, text: result });
  } catch (e: any) {
    return errorResponse(e.message || "Nutrition AI failed");
  }
});

function safeJson(s: string) { try { return JSON.parse(s); } catch { return null; } }
