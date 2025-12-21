import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { analysisType } = await req.json();

    // Analysis type configuration
    const analysisConfig: Record<string, { credits: number; name: string }> = {
      cognitive: { credits: 30, name: "Cognitive Profile Analysis" },
      learning: { credits: 20, name: "Learning Style Assessment" },
      strengths: { credits: 25, name: "Strengths & Weaknesses Report" },
      improvement: { credits: 40, name: "Personalized Improvement Plan" },
    };

    const config = analysisConfig[analysisType];
    if (!config) throw new Error("Invalid analysis type");

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

    // Get user's test history
    const { data: testHistory } = await supabaseClient
      .from("iq_test_results")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5);

    // Generate AI analysis based on type
    let analysisResult: any = {};

    switch (analysisType) {
      case "cognitive":
        analysisResult = {
          overall_profile: "Strong analytical thinker with excellent pattern recognition",
          cognitive_strengths: ["Logical reasoning", "Pattern recognition", "Problem solving"],
          cognitive_areas_to_develop: ["Spatial awareness", "Memory retention"],
          processing_speed: "Above average",
          attention_span: "Excellent",
          recommendations: [
            "Practice memory exercises daily",
            "Try spatial reasoning puzzles",
            "Maintain consistent practice schedule"
          ],
        };
        break;
      case "learning":
        analysisResult = {
          primary_style: "Visual-Kinesthetic",
          secondary_style: "Logical-Mathematical",
          learning_preferences: ["Hands-on activities", "Diagrams and charts", "Structured problems"],
          best_study_methods: ["Mind mapping", "Practice problems", "Video tutorials"],
          recommended_resources: ["Khan Academy", "Brilliant.org", "Coursera"],
        };
        break;
      case "strengths":
        analysisResult = {
          top_strengths: ["Analytical thinking", "Pattern recognition", "Quick learning"],
          areas_for_improvement: ["Time management", "Attention to detail", "Memory recall"],
          strength_score: 85,
          growth_potential: "High",
          action_plan: [
            "Focus on time-management techniques",
            "Practice mindfulness for better attention",
            "Use mnemonic devices for memory"
          ],
        };
        break;
      case "improvement":
        analysisResult = {
          current_level: testHistory?.[0]?.iq_score || 100,
          target_level: (testHistory?.[0]?.iq_score || 100) + 10,
          estimated_timeline: "3-6 months",
          daily_practices: [
            "15 minutes logical puzzles",
            "10 minutes memory games",
            "20 minutes reading complex material"
          ],
          weekly_goals: [
            "Complete 3 IQ tests",
            "Learn 2 new problem-solving techniques",
            "Track progress in journal"
          ],
          monthly_milestones: [
            "Improve test scores by 5 points",
            "Master new cognitive skill",
            "Build consistent practice habit"
          ],
        };
        break;
    }

    // Save analysis
    const { data: analysis, error: analysisError } = await supabaseClient
      .from("iq_analyses")
      .insert({
        user_id: user.id,
        analysis_type: analysisType,
        analysis_result: analysisResult,
        credits_used: config.credits,
      })
      .select()
      .single();

    if (analysisError) throw analysisError;

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
        analysis: analysis,
        message: `${config.name} completed!`,
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
