import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { requireAiCredits } from "../_shared/credit-check.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const __auth = await requireAiCredits(req, corsHeaders, { credits: 1, usageType: "fitness_plan" });
    if (__auth.errorResponse) return __auth.errorResponse;
    const __deduct = __auth.deduct!;
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Authenticate user
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await serviceClient.auth.getUser(token);
    if (!userData.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { plan_id } = await req.json();
    if (!plan_id) throw new Error("plan_id required");

    // Get plan details
    const { data: plan, error: planError } = await serviceClient
      .from("fitness_plans")
      .select("*")
      .eq("id", plan_id)
      .eq("user_id", userData.user.id)
      .single();

    if (planError || !plan) throw new Error("Plan not found");
    if (plan.payment_status !== "paid") throw new Error("Plan not paid");
    if (plan.status === "completed") {
      return new Response(JSON.stringify({ plan }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Mark generating
    await serviceClient.from("fitness_plans").update({ status: "generating" }).eq("id", plan_id);

    const days = plan.plan_type === "weekly" ? 7 : 30;
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY not configured");

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

IMPORTANT: Generate ALL ${days} days with varied workouts and meals. Include rest days (1-2 per week). Make meals realistic and diverse. All measurements in grams/ml.`;

    const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-5",
        messages: [
          { role: "system", content: "You are a professional fitness coach and nutritionist. Always respond with valid JSON only." },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 16000,
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errText);
      await serviceClient.from("fitness_plans").update({ status: "failed" }).eq("id", plan_id);
      throw new Error("AI generation failed");
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices[0].message.content;

    let planData;
    try {
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : content;
      const cleanJson = jsonStr.replace(/^[^{]*/, "").replace(/[^}]*$/, "");
      planData = JSON.parse(cleanJson.includes("{") ? cleanJson : jsonStr);
    } catch (e) {
      console.error("Parse error:", e, "Content:", content.substring(0, 500));
      // Try to find JSON object in content
      const match = content.match(/\{[\s\S]*\}/);
      if (match) {
        planData = JSON.parse(match[0]);
      } else {
        await serviceClient.from("fitness_plans").update({ status: "failed" }).eq("id", plan_id);
        throw new Error("Failed to parse AI response");
      }
    }

    // Update plan with generated content
    const { data: updatedPlan, error: updateError } = await serviceClient
      .from("fitness_plans")
      .update({
        workout_plan: planData.workout_plan || {},
        meal_plan: planData.meal_plan || {},
        summary: planData.summary || "",
        status: "completed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", plan_id)
      .select()
      .single();

    if (updateError) throw updateError;

    await __deduct().catch((e) => console.error("deduct failed:", e));
    return new Response(JSON.stringify({
      plan: updatedPlan,
      details: {
        daily_calories: planData.daily_calories,
        daily_protein_g: planData.daily_protein_g,
        daily_carbs_g: planData.daily_carbs_g,
        daily_fats_g: planData.daily_fats_g,
        tips: planData.tips,
      },
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
