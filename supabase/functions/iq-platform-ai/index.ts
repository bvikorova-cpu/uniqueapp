import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CREDIT_COSTS: Record<string, number> = {
  brain_training: 5,
  iq_predictor: 4,
  cognitive_report: 6,
  study_coach: 5,
  cognitive_analysis: 5,
  learning_style: 4,
  strengths_report: 5,
  improvement_plan: 6,
  generate_certificate: 5,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const openaiKey = Deno.env.get("OPENAI_API_KEY")!;

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const supabase = createClient(supabaseUrl, supabaseKey);
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) throw new Error("Unauthorized");

    const { action, ...params } = await req.json();
    const creditCost = CREDIT_COSTS[action];
    if (!creditCost) throw new Error(`Unknown action: ${action}`);

    // Use iq_credits table
    const { data: credits } = await supabase
      .from("iq_credits")
      .select("balance")
      .eq("user_id", user.id)
      .maybeSingle();

    const remaining = credits?.balance || 0;
    if (remaining < creditCost) {
      return new Response(JSON.stringify({ error: `Not enough credits. Need ${creditCost}, have ${remaining}.` }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let systemPrompt = "";
    let userPrompt = "";

    switch (action) {
      case "brain_training":
        systemPrompt = `You are an elite cognitive neuroscience expert and brain training coach. Generate personalized brain training exercises. Return JSON: { "session_title": "string", "exercises": [{"name": "string", "type": "string (Memory|Logic|Speed|Pattern|Spatial)", "difficulty": "string (Easy|Medium|Hard|Expert)", "description": "string", "instructions": "string (step by step)", "time_limit": "string", "scoring": "string", "cognitive_benefit": "string"}], "warm_up": {"exercise": "string", "duration": "string"}, "cool_down": {"tip": "string"}, "daily_streak_bonus": "string", "estimated_iq_impact": "string", "personalized_focus": "string" }. Generate 5 exercises.`;
        userPrompt = `Create a personalized brain training session.\nFocus area: ${params.focusArea || "General cognitive enhancement"}\nDifficulty: ${params.difficulty || "Medium"}\nDuration: ${params.duration || "15 minutes"}\nPrevious scores: ${params.previousScores || "Not available"}`;
        break;

      case "iq_predictor":
        systemPrompt = `You are a psychometric data scientist specializing in IQ trend analysis and cognitive prediction models. Analyze test performance data and predict future IQ scores. Return JSON: { "current_estimated_iq": number, "predicted_iq_6_months": number, "predicted_iq_1_year": number, "confidence_interval": "string", "trend_analysis": {"direction": "string (Improving|Stable|Declining)", "rate": "string", "key_factors": ["string"]}, "cognitive_dimensions": [{"name": "string (Verbal|Logical|Spatial|Memory|Processing Speed)", "current_score": number, "predicted_score": number, "trend": "string"}], "recommendations": ["string"], "milestones": [{"iq_target": number, "estimated_date": "string", "requirements": "string"}], "comparison_percentile": number, "brain_age": number }`;
        userPrompt = `Analyze and predict IQ trajectory.\nTest history: ${params.testHistory || "Limited data"}\nAge: ${params.age || "Not specified"}\nTraining frequency: ${params.trainingFrequency || "Not specified"}\nRecent scores: ${params.recentScores || "Not available"}`;
        break;

      case "cognitive_report":
        systemPrompt = `You are a clinical cognitive psychologist creating a comprehensive cognitive assessment report. Generate a detailed PDF-ready report. Return JSON: { "report_title": "Comprehensive Cognitive Assessment Report", "executive_summary": "string (3-4 sentences)", "overall_iq_estimate": number, "classification": "string (e.g. Superior, Above Average, Average)", "percentile_rank": number, "cognitive_profile": [{"domain": "string", "score": number, "percentile": number, "interpretation": "string", "strengths": ["string"], "areas_for_growth": ["string"]}], "detailed_analysis": {"verbal_reasoning": {"score": number, "analysis": "string"}, "abstract_reasoning": {"score": number, "analysis": "string"}, "quantitative_reasoning": {"score": number, "analysis": "string"}, "short_term_memory": {"score": number, "analysis": "string"}, "processing_speed": {"score": number, "analysis": "string"}}, "recommendations": [{"category": "string", "recommendation": "string", "priority": "string (High|Medium|Low)"}], "career_aptitude": ["string"], "learning_style": "string", "brain_health_tips": ["string"] }`;
        userPrompt = `Generate a comprehensive cognitive report.\nUser profile: ${params.userProfile || "Standard assessment"}\nTest results summary: ${params.testResults || "General evaluation requested"}\nAge group: ${params.ageGroup || "Adult"}\nEducation level: ${params.education || "Not specified"}`;
        break;

      case "study_coach":
        systemPrompt = `You are an AI study coach and cognitive enhancement specialist. Create personalized study plans to improve IQ and cognitive abilities. Return JSON: { "plan_title": "string", "duration": "string", "daily_schedule": [{"time_block": "string", "activity": "string", "duration": "string", "cognitive_target": "string", "resources": ["string"]}], "weekly_goals": [{"week": number, "goal": "string", "exercises": ["string"], "expected_improvement": "string"}], "techniques": [{"name": "string", "description": "string", "scientific_basis": "string", "frequency": "string"}], "nutrition_tips": ["string"], "sleep_optimization": ["string"], "progress_checkpoints": [{"week": number, "assessment": "string", "target_score": number}], "motivation_strategies": ["string"], "estimated_improvement": "string" }`;
        userPrompt = `Create a personalized cognitive improvement plan.\nGoal: ${params.goal || "Maximize IQ improvement"}\nCurrent level: ${params.currentLevel || "Intermediate"}\nAvailable time per day: ${params.dailyTime || "30 minutes"}\nWeak areas: ${params.weakAreas || "Not specified"}\nStrong areas: ${params.strongAreas || "Not specified"}`;
        break;

      case "cognitive_analysis":
        systemPrompt = `You are a cognitive psychologist specializing in deep cognitive profiling. Analyze the user's cognitive patterns and provide detailed insights. Return JSON: { "cognitive_fingerprint": "string", "dominant_intelligence_type": "string", "intelligence_profile": [{"type": "string (Linguistic|Logical-Mathematical|Spatial|Musical|Bodily-Kinesthetic|Interpersonal|Intrapersonal|Naturalistic)", "score": number 1-100, "description": "string"}], "thinking_style": "string", "problem_solving_approach": "string", "creativity_index": number, "analytical_index": number, "emotional_intelligence": number, "strengths_summary": "string", "growth_opportunities": ["string"], "ideal_learning_environment": "string", "career_alignment": ["string"] }`;
        userPrompt = `Perform a deep cognitive analysis.\nSelf-described strengths: ${params.strengths || "Not specified"}\nPreferred activities: ${params.activities || "Not specified"}\nChallenges faced: ${params.challenges || "Not specified"}`;
        break;

      case "learning_style":
        systemPrompt = `You are a learning science expert. Determine the user's optimal learning style and create strategies. Return JSON: { "primary_style": "string (Visual|Auditory|Kinesthetic|Reading-Writing)", "secondary_style": "string", "style_breakdown": [{"style": "string", "percentage": number, "strategies": ["string"]}], "optimal_study_techniques": [{"technique": "string", "description": "string", "effectiveness": "string"}], "environment_recommendations": ["string"], "tool_recommendations": ["string"], "study_session_template": {"warm_up": "string", "main_study": "string", "review": "string", "break_strategy": "string"}, "retention_tips": ["string"] }`;
        userPrompt = `Assess learning style.\nHow do you prefer to learn: ${params.preferences || "Not specified"}\nBest study experiences: ${params.experiences || "Not specified"}\nDifficulties: ${params.difficulties || "Not specified"}`;
        break;

      case "strengths_report":
        systemPrompt = `You are a psychometric analyst. Create a detailed strengths and weaknesses breakdown. Return JSON: { "overall_assessment": "string", "top_strengths": [{"area": "string", "score": number, "evidence": "string", "leverage_tip": "string"}], "growth_areas": [{"area": "string", "score": number, "gap_analysis": "string", "improvement_strategy": "string", "timeline": "string"}], "cognitive_balance_score": number, "recommendations": [{"priority": number, "action": "string", "expected_impact": "string"}], "benchmark_comparison": "string" }`;
        userPrompt = `Create a strengths and weaknesses report.\nTest area performance: ${params.performance || "General assessment"}\nSelf-assessment: ${params.selfAssessment || "Not provided"}`;
        break;

      case "improvement_plan":
        systemPrompt = `You are a cognitive improvement strategist. Create a comprehensive, personalized IQ improvement roadmap. Return JSON: { "plan_name": "string", "target_improvement": "string", "phases": [{"phase": number, "name": "string", "duration": "string", "focus_areas": ["string"], "daily_exercises": [{"exercise": "string", "duration": "string", "frequency": "string"}], "milestones": ["string"], "expected_iq_gain": "string"}], "lifestyle_changes": [{"area": "string", "recommendation": "string", "impact": "string"}], "supplements_and_nutrition": [{"item": "string", "benefit": "string", "evidence": "string"}], "progress_tracking": "string", "total_expected_improvement": "string" }`;
        userPrompt = `Create a personalized IQ improvement roadmap.\nCurrent estimated IQ: ${params.currentIQ || "Not tested"}\nTarget: ${params.target || "Maximum improvement"}\nTimeline: ${params.timeline || "6 months"}\nConstraints: ${params.constraints || "None specified"}`;
        break;

      case "generate_certificate":
        systemPrompt = `You are a psychometric certification authority. Generate an official-looking IQ certificate with detailed cognitive analysis. Return JSON: { "full_name": "string", "iq_score": number (realistic 95-145), "percentile": number, "classification": "string (e.g. Superior, Above Average, High Average, Average)", "cognitive_breakdown": [{"domain": "string (Verbal Comprehension|Perceptual Reasoning|Working Memory|Processing Speed|Fluid Reasoning)", "score": number, "description": "string"}], "strengths": ["string"], "recommendations": ["string"], "insights": "string (2-3 paragraph personalized analysis)", "date_issued": "string", "certificate_id": "string (format: IQ-CERT-XXXXX)" }`;
        userPrompt = `Generate a professional IQ certificate for: ${params.fullName}. Make the assessment realistic and detailed.`;
        break;
    }

    const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.8,
        max_tokens: 3000,
        response_format: { type: "json_object" },
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("OpenAI error:", errorText);
      throw new Error("AI service error");
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices[0]?.message?.content;
    const parsed = JSON.parse(content);

    await supabase
      .from("iq_credits")
      .update({ balance: remaining - creditCost })
      .eq("user_id", user.id);

    return new Response(JSON.stringify({ ...parsed, credits_used: creditCost, credits_remaining: remaining - creditCost }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("iq-platform-ai error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
