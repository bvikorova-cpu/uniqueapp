import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { callOpenAIJSON, corsHeaders, errorResponse, jsonResponse } from "../_shared/openai.ts";
import { deductAICredits, refundAICredits } from "../_shared/credits.ts";

const SYSTEM = `Workout plan. Return JSON: {plan_name, weeks, days_per_week, schedule:[{day, focus, exercises:[{name, sets, reps, rest_sec}]}], progression_notes}.`;

const COST = 30;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  let userId: string | null = null;
  let charged = false;

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
    userId = user.id;

    const creditDenied = await deductAICredits(user.id, COST, "generate-workout-plan");
    if (creditDenied) return creditDenied;
    charged = true;

    const body = await req.json();
    const userInput = JSON.stringify(body).slice(0, 4000);

    // Retry a few times: rate limits from the AI provider are transient.
    let parsed: any = null;
    let lastError: any = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        parsed = await callOpenAIJSON({
          system: SYSTEM,
          user: userInput,
          temperature: 0.75,
          max_tokens: 4096,
        });
        lastError = null;
        break;
      } catch (e: any) {
        lastError = e;
        const status = e?.status ?? 500;
        if (status !== 429 && status !== 402 && status < 500) break;
        await new Promise((r) => setTimeout(r, 1200 * (attempt + 1)));
      }
    }

    if (!parsed) {
      if (charged && userId) await refundAICredits(userId, COST, "generate-workout-plan");
      const status = lastError?.status === 429 ? 429 : 503;
      return jsonResponse(
        { error: "AI is busy right now. Your credits were not charged — please try again in a few seconds." },
        status
      );
    }

    return jsonResponse({
      success: true,
      plan: parsed,
      result: parsed,
      data: parsed,
    });
  } catch (e: any) {
    if (charged && userId) await refundAICredits(userId, COST, "generate-workout-plan");
    console.error("[generate-workout-plan]", e);
    return errorResponse(e?.message || "Function failed", e?.status === 429 ? 429 : 500);
  }
});
