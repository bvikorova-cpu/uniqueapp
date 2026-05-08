import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CREDIT_COSTS: Record<string, number> = {
  "skill-valuation": 4,
  "live-demo-script": 3,
  "skill-certification": 5,
  "workshop-planner": 4,
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { action, ...params } = await req.json();
    const credits = CREDIT_COSTS[action];
    if (!credits) {
      return new Response(JSON.stringify({ error: "Unknown action" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check credits balance
    const { data: balance } = await supabase
      .from("ai_credits")
      .select("credits_remaining")
      .eq("user_id", user.id)
      .single();

    if (!balance || balance.credits_remaining < credits) {
      return new Response(JSON.stringify({
        error: `Insufficient credits. You need ${credits} credits for this action.`,
      }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let systemPrompt = "";
    let userPrompt = "";

    switch (action) {
      case "skill-valuation": {
        systemPrompt = `You are an expert skill market analyst. Analyze the given skill and provide:
1. **Market Value Score** (1-100): How valuable this skill is in the current market
2. **Demand Level**: Low/Medium/High/Very High
3. **Optimal Exchange Rate**: What skills of equal value could be exchanged
4. **Market Trends**: Whether demand is rising, stable, or declining
5. **Monetization Potential**: How this skill could generate income
6. **Recommended Improvements**: Ways to increase the skill's value
7. **Best Exchange Partners**: Types of skills that complement this one

Format with clear headings and actionable insights.`;
        userPrompt = `Analyze this skill for exchange value:\n\nSkill: ${params.skillName}\nExperience Level: ${params.experienceLevel || "Intermediate"}\nLocation: ${params.location || "Global"}\nAdditional Details: ${params.details || "None provided"}`;
        break;
      }
      case "live-demo-script": {
        systemPrompt = `You are an expert presentation coach specializing in skill demonstrations. Create a compelling live demo script that will help the user showcase their skill effectively to potential exchange partners. Include:
1. **Opening Hook** (30 seconds)
2. **Skill Overview** (2 minutes)
3. **Live Demonstration Plan** (5-7 minutes)
4. **Audience Engagement**
5. **Closing & CTA**
6. **Technical Setup**
7. **Tips for Success**

Make it practical, engaging, and professional.`;
        userPrompt = `Create a live skill demo script for:\n\nSkill: ${params.skillName}\nTarget Audience: ${params.targetAudience || "General"}\nDemo Duration: ${params.duration || "10 minutes"}\nExperience Level: ${params.experienceLevel || "Intermediate"}\nKey Strengths: ${params.strengths || "Not specified"}`;
        break;
      }
      case "skill-certification": {
        systemPrompt = `You are an AI skill assessor and certification specialist. Provide:
1. **Overall Score** (0-100)
2. **Proficiency Level**
3. **Strengths Identified**
4. **Areas for Improvement**
5. **Certification Recommendation**
6. **Detailed Feedback**
7. **Learning Path**
8. **Digital Badge Description**

Be thorough but encouraging.`;
        userPrompt = `Assess and certify this skill:\n\nSkill: ${params.skillName}\nSelf-Assessment Answers:\n${params.answers || "General assessment requested"}\nClaimed Experience: ${params.experience || "Not specified"}\nPortfolio Description: ${params.portfolio || "None provided"}`;
        break;
      }
      case "workshop-planner": {
        systemPrompt = `You are an expert workshop facilitator. Design a comprehensive workshop plan with:
1. Workshop Title
2. Overview & Objectives
3. Duration & Structure
4. Materials Needed
5. Lesson Plan
6. Interactive Exercises
7. Assessment Criteria
8. Pricing Recommendation
9. Marketing Tips
10. Follow-up Plan`;
        userPrompt = `Design a group workshop for:\n\nSkill: ${params.skillName}\nGroup Size: ${params.groupSize || "5-10 participants"}\nDuration: ${params.workshopDuration || "2 hours"}\nDifficulty Level: ${params.difficultyLevel || "Beginner-friendly"}\nFormat: ${params.format || "Online"}\nSpecial Requirements: ${params.requirements || "None"}`;
        break;
      }
    }

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY not configured");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (response.status === 429) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (response.status === 402) {
      return new Response(JSON.stringify({ error: "AI credits depleted. Please top up." }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenAI error:", response.status, errText);
      throw new Error("AI service unavailable");
    }

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content || "No result generated";

    // Deduct credits AFTER successful AI call
    const { error: deductErr } = await supabase.rpc("deduct_ai_credits" as any, {
      p_user_id: user.id,
      p_amount: credits,
    });
    if (deductErr) console.error("Credit deduction failed:", deductErr);

    return new Response(JSON.stringify({ result, credits_used: credits }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("skill-swap-ai error:", error);
    const msg = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: msg || "Service error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
