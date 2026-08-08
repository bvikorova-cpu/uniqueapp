import "../_shared/aiRedirect.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { requireAiCredits } from "../_shared/credit-check.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = { "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version" };

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const PLAN_DAYS: Record<string, number> = { weekly: 7, monthly: 30, day60: 60, day90: 90 };
  const PLAN_CREDITS: Record<string, number> = { weekly: 25, monthly: 85, day60: 150, day90: 210 };

  try {
    const body = await req.json().catch(() => ({}));
    const { plan_id, plan_type, profileData } = body ?? {};

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Resolve the plan type up front so we can charge the matching credit cost
    let resolvedType: string | null = plan_type ?? null;
    if (!resolvedType && plan_id) {
      const { data: existing } = await serviceClient
        .from("fitness_plans").select("plan_type").eq("id", plan_id).maybeSingle();
      resolvedType = existing?.plan_type ?? null;
    }
    if (!resolvedType || !PLAN_DAYS[resolvedType]) {
      return new Response(JSON.stringify({ error: "Invalid plan type" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const __auth = await requireAiCredits(req, corsHeaders, {
      credits: PLAN_CREDITS[resolvedType],
      usageType: "fitness_plan",
      description: `Personalized ${PLAN_DAYS[resolvedType]}-day plan` });
    if (__auth.errorResponse) return __auth.errorResponse;
    const __deduct = __auth.deduct!;

    // Authenticate user
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await serviceClient.auth.getUser(token);
    if (!userData.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    let plan: any = null;
    if (plan_id) {
      const { data: existing, error: planError } = await serviceClient
        .from("fitness_plans")
        .select("*")
        .eq("id", plan_id)
        .eq("user_id", userData.user.id)
        .single();
      if (planError || !existing) throw new Error("Plan not found");
      if (existing.status === "completed") {
        return new Response(JSON.stringify({ plan: existing }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      plan = existing;
    } else {
      if (!profileData) throw new Error("profileData required");
      const { data: created, error: createErr } = await serviceClient
        .from("fitness_plans")
        .insert({
          user_id: userData.user.id,
          plan_type: resolvedType,
          payment_status: "paid",
          status: "generating",
          age: profileData.age,
          gender: profileData.gender,
          height_cm: profileData.height_cm,
          weight_kg: profileData.weight_kg,
          target_weight_kg: profileData.target_weight_kg,
          activity_level: profileData.activity_level,
          fitness_goal: profileData.fitness_goal,
          dietary_restrictions: profileData.dietary_restrictions ?? [],
          health_conditions: profileData.health_conditions ?? [] })
        .select()
        .single();
      if (createErr || !created) throw new Error(createErr?.message || "Failed to create plan");
      plan = created;
    }

    const plan_row_id = plan.id;

    // Mark generating
    await serviceClient.from("fitness_plans").update({ status: "generating" }).eq("id", plan_row_id);

    const days = PLAN_DAYS[resolvedType];
    // Ask the model for a compact repeatable rotation, then expand it to the full day count
    const cycleDays = Math.min(days, 14);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const prompt = `You are a certified personal trainer and nutritionist. Create a detailed, personalized ${days}-day weight loss plan.

USER PROFILE:
- Age: ${plan.age} years
- Gender: ${plan.gender}
- Height: ${plan.height_cm} cm
- Current weight: ${plan.weight_kg} kg
- Target weight: ${plan.target_weight_kg} kg
- Activity level: ${plan.activity_level}
- Fitness goal: ${plan.fitness_goal}
${plan.dietary_restrictions?.length ? `- Dietary restrictions: ${plan.dietary_restrictions.join(", ")}` : ""}
${plan.health_conditions?.length ? `- Health conditions: ${plan.health_conditions.join(", ")}` : ""}

Generate a JSON response with this EXACT structure:
{
  "summary": "Brief personalized overview (2-3 sentences)",
  "daily_calories": 1800,
  "daily_protein_g": 120,
  "daily_carbs_g": 200,
  "daily_fats_g": 60,
  "workout_plan": {
    "days": [
      {
        "day": 1,
        "title": "Upper Body Strength",
        "duration_min": 45,
        "calories_burned": 300,
        "exercises": [
          {
            "name": "Push-ups",
            "sets": 3,
            "reps": "12-15",
            "rest_sec": 60,
            "notes": "Keep core tight"
          }
        ],
        "warmup": "5 min light cardio",
        "cooldown": "5 min stretching"
      }
    ]
  },
  "meal_plan": {
    "days": [
      {
        "day": 1,
        "total_calories": 1800,
        "meals": {
          "breakfast": { "name": "Oatmeal with berries", "calories": 350, "protein_g": 15, "ingredients": ["80g oats", "100g berries", "200ml milk"] },
          "snack1": { "name": "Apple with almond butter", "calories": 200, "protein_g": 6, "ingredients": ["1 apple", "15g almond butter"] },
          "lunch": { "name": "Chicken salad", "calories": 500, "protein_g": 40, "ingredients": ["200g chicken breast", "mixed greens", "olive oil dressing"] },
          "snack2": { "name": "Greek yogurt", "calories": 150, "protein_g": 15, "ingredients": ["150g Greek yogurt", "10g honey"] },
          "dinner": { "name": "Salmon with vegetables", "calories": 600, "protein_g": 44, "ingredients": ["200g salmon", "200g broccoli", "100g sweet potato"] }
        }
      }
    ]
  },
  "tips": ["Drink 2-3L water daily", "Sleep 7-8 hours", "Track progress weekly"]
}

IMPORTANT: Generate EXACTLY ${cycleDays} days (a repeatable rotation) in BOTH "workout_plan.days" AND "meal_plan.days" — both arrays must have ${cycleDays} entries numbered 1..${cycleDays}. This rotation will be repeated to cover the full ${days}-day program. Include 1-2 rest days per week (rest day = title "Active Recovery / Rest", empty or light exercises). Keep exercise notes and ingredient lists short. Make meals realistic and diverse. All measurements in grams/ml.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a professional fitness coach and nutritionist. Always respond with valid JSON only." },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
        max_tokens: 16000 }) });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errText);
      await serviceClient.from("fitness_plans").update({ status: "failed" }).eq("id", plan_row_id);
      throw new Error("AI generation failed");
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices[0].message.content;

    // Tolerant JSON extraction: handles fenced blocks and truncated output
    const repairJson = (raw: string): any => {
      const fenced = raw.match(/```json\n?([\s\S]*?)\n?```/);
      let s = (fenced ? fenced[1] : raw).trim();
      const start = s.indexOf("{");
      if (start < 0) throw new Error("no json");
      s = s.slice(start);
      try { return JSON.parse(s); } catch { /* fall through to repair */ }
      // Close unterminated string / trim trailing partial token, then balance braces
      let inStr = false, esc = false;
      const stack: string[] = [];
      let lastSafe = -1;
      for (let i = 0; i < s.length; i++) {
        const c = s[i];
        if (esc) { esc = false; continue; }
        if (c === "\\") { esc = true; continue; }
        if (c === '"') { inStr = !inStr; continue; }
        if (inStr) continue;
        if (c === "{" || c === "[") stack.push(c === "{" ? "}" : "]");
        else if (c === "}" || c === "]") stack.pop();
        if (c === "}" || c === "]") lastSafe = i;
      }
      let candidate = s.slice(0, lastSafe + 1);
      // recompute stack for candidate
      inStr = false; esc = false;
      const st2: string[] = [];
      for (let i = 0; i < candidate.length; i++) {
        const c = candidate[i];
        if (esc) { esc = false; continue; }
        if (c === "\\") { esc = true; continue; }
        if (c === '"') { inStr = !inStr; continue; }
        if (inStr) continue;
        if (c === "{" || c === "[") st2.push(c === "{" ? "}" : "]");
        else if (c === "}" || c === "]") st2.pop();
      }
      candidate = candidate.replace(/,\s*$/, "") + st2.reverse().join("");
      return JSON.parse(candidate);
    };

    let planData;
    try {
      planData = repairJson(content);
    } catch (e) {
      console.error("Parse error:", e, "Content tail:", String(content).slice(-500));
      await serviceClient.from("fitness_plans").update({ status: "failed" }).eq("id", plan_row_id);
      throw new Error("Failed to parse AI response");
    }

    // Expand a generated cycle into the full requested day count so nothing is missing.
    const expandDays = (src: any[], total: number) => {
      const base = (Array.isArray(src) ? src : []).filter(Boolean);
      if (!base.length) return [];
      const out: any[] = [];
      for (let d = 1; d <= total; d++) {
        const tpl = base[(d - 1) % base.length];
        const week = Math.ceil(d / 7);
        out.push({ ...JSON.parse(JSON.stringify(tpl)), day: d, week });
      }
      return out;
    };

    const workoutDays = expandDays(planData?.workout_plan?.days, days);
    const mealDays = expandDays(planData?.meal_plan?.days, days);

    const details = {
      daily_calories: planData.daily_calories,
      daily_protein_g: planData.daily_protein_g,
      daily_carbs_g: planData.daily_carbs_g,
      daily_fats_g: planData.daily_fats_g,
      tips: planData.tips };

    // Update plan with generated content
    const { data: updatedPlan, error: updateError } = await serviceClient
      .from("fitness_plans")
      .update({
        workout_plan: { ...(planData.workout_plan || {}), days: workoutDays, total_days: days, details },
        meal_plan: { ...(planData.meal_plan || {}), days: mealDays, total_days: days, details },

        summary: planData.summary || "",
        status: "completed",
        updated_at: new Date().toISOString() })
      .eq("id", plan_row_id)
      .select()
      .single();


    if (updateError) throw updateError;

    await __deduct().catch((e) => console.error("deduct failed:", e));
    return new Response(JSON.stringify({ plan: updatedPlan, details }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
