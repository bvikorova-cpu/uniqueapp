import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { callOpenAI, corsHeaders, errorResponse, jsonResponse } from "../_shared/openai.ts";

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

    const result = await callOpenAI({
      system: "You are a nutritionist. Create a structured meal plan. Return JSON: {plan:[{day, meals:[{type, name, calories, macros:{p,c,f}, ingredients[], prep_minutes}]}], shopping_list[], total_daily_calories}.",
      user: `Goal: ${goal}. Daily calories: ${calories}. Days: ${days}. Diet: ${diet}. Allergies: ${allergies.join(", ") || "none"}. Notes: ${preferences}`,
      json: true,
      temperature: 0.7,
    });
    const plan = safeJson(result);
    return jsonResponse({ success: true, plan, result: plan, text: result });
  } catch (e: any) {
    return errorResponse(e.message || "Meal plan failed");
  }
});

function safeJson(s: string) { try { return JSON.parse(s); } catch { return null; } }
