import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { withRateLimit, RATE_LIMITS } from "../_shared/rate-limit.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
  );

  try {
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user) throw new Error("User not authenticated");

    // Rate limit check
    const rateLimitResponse = await withRateLimit(req, RATE_LIMITS.api_call, corsHeaders, user.id);
    if (rateLimitResponse) return rateLimitResponse;

    const { testType, answers, timeSpent } = await req.json();
    
    // Get test configuration based on type
    const testConfig: Record<string, { credits: number; questions: number }> = {
      beginner: { credits: 10, questions: 30 },
      intermediate: { credits: 15, questions: 40 },
      advanced: { credits: 20, questions: 50 },
      expert: { credits: 25, questions: 60 },
    };

    const config = testConfig[testType];
    if (!config) throw new Error("Invalid test type");

    // Check user credits
    const { data: creditsData, error: creditsError } = await supabaseClient
      .from("iq_credits")
      .select("credits_remaining")
      .eq("user_id", user.id)
      .single();

    if (creditsError && creditsError.code !== "PGRST116") throw creditsError;

    const currentCredits = creditsData?.credits_remaining || 0;
    if (currentCredits < config.credits) {
      throw new Error("Insufficient credits");
    }

    // Calculate score (simplified - in production use more sophisticated algorithm)
    const correctAnswers = answers.filter((a: boolean) => a).length;
    const percentage = (correctAnswers / config.questions) * 100;
    const baseIQ = 100;
    const iqScore = Math.round(baseIQ + (percentage - 50) * 0.6);

    // Save test result
    const { data: testResult, error: testError } = await supabaseClient
      .from("iq_test_results")
      .insert({
        user_id: user.id,
        test_type: testType,
        iq_score: iqScore,
        questions_answered: config.questions,
        correct_answers: correctAnswers,
        time_taken: timeSpent,
        test_data: { answers, timestamp: new Date().toISOString() },
      })
      .select()
      .single();

    if (testError) throw testError;

    // Deduct credits
    if (creditsData) {
      await supabaseClient
        .from("iq_credits")
        .update({ credits_remaining: currentCredits - config.credits })
        .eq("user_id", user.id);
    } else {
      await supabaseClient
        .from("iq_credits")
        .insert({
          user_id: user.id,
          credits_remaining: -config.credits,
          total_credits_purchased: 0,
        });
    }

    return new Response(
      JSON.stringify({
        success: true,
        result: testResult,
        message: `Test completed! Your IQ score: ${iqScore}`,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
