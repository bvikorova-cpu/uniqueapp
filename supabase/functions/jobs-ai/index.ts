import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CREDIT_COSTS: Record<string, number> = {
  resume_builder: 5,
  interview_coach: 5,
  salary_negotiator: 4,
  career_path: 6,
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { action, ...params } = await req.json();
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) throw new Error("OPENAI_API_KEY not configured");

    const supabase = createClient(supabaseUrl, supabaseKey);
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) throw new Error("Unauthorized");

    const creditCost = CREDIT_COSTS[action] || 5;

    // Check credits
    const { data: credits } = await supabase
      .from("ai_credits")
      .select("credits_remaining")
      .eq("user_id", user.id)
      .maybeSingle();

    const remaining = credits?.credits_remaining || 0;
    if (remaining < creditCost) {
      return new Response(JSON.stringify({ error: `Insufficient credits. Need ${creditCost}, have ${remaining}. Purchase more credits to continue.` }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let systemPrompt = "";
    let userPrompt = "";

    switch (action) {
      case "resume_builder":
        systemPrompt = "You are an expert professional resume writer and ATS optimization specialist. Create polished, ATS-friendly resumes that highlight achievements with quantified metrics. Use strong action verbs, strategic keyword placement, and clean formatting. Output in structured markdown with clear sections.";
        userPrompt = `Build a professional, ATS-optimized resume based on:
Job Title Target: ${params.job_title || "General"}
Industry: ${params.industry || "Not specified"}
Experience Level: ${params.experience_level || "Mid-level"}
Current Skills: ${params.skills || "Not provided"}
Work History: ${params.work_history || "Not provided"}
Education: ${params.education || "Not provided"}
Additional Notes: ${params.notes || "None"}

Create a complete, professional resume with: Professional Summary, Key Skills, Work Experience (with bullet points using STAR method), Education, and optional Certifications section.`;
        break;

      case "interview_coach":
        systemPrompt = "You are an elite interview coach with 20+ years helping candidates at Fortune 500 companies. Provide detailed, actionable interview preparation with example answers using the STAR method. Include body language tips, common pitfalls, and confidence-building strategies.";
        userPrompt = `Prepare a comprehensive interview coaching session:
Position: ${params.position || "General"}
Company Type: ${params.company_type || "Not specified"}
Interview Type: ${params.interview_type || "Standard"}
Experience Level: ${params.experience_level || "Mid-level"}
Key Concerns: ${params.concerns || "None"}
Industry: ${params.industry || "General"}

Provide:
1. **Top 10 Likely Questions** with model STAR-method answers
2. **Technical Questions** (if applicable) with strategies
3. **Behavioral Assessment** tips
4. **Body Language & Presentation** guide
5. **Questions to Ask the Interviewer**
6. **Common Mistakes to Avoid**
7. **Confidence Score** and preparation checklist`;
        break;

      case "salary_negotiator":
        systemPrompt = "You are a senior compensation analyst and salary negotiation expert. Provide data-driven salary insights, negotiation scripts, and strategic advice based on market data. Be specific with numbers and percentages.";
        userPrompt = `Create a salary negotiation strategy:
Position: ${params.position || "Not specified"}
Location: ${params.location || "Not specified"}
Experience Years: ${params.years_experience || "Not specified"}
Current Salary: ${params.current_salary || "Not disclosed"}
Target Salary: ${params.target_salary || "Not specified"}
Industry: ${params.industry || "General"}
Company Size: ${params.company_size || "Not specified"}

Provide:
1. **Market Salary Analysis** with ranges (low/mid/high)
2. **Your Market Position** assessment
3. **Negotiation Scripts** for different scenarios (initial offer, counter-offer, final negotiation)
4. **Total Compensation Strategy** (base, bonus, equity, benefits)
5. **Timing & Approach** recommendations
6. **Red Flags & Walk-Away Points**
7. **Non-Monetary Negotiation Items** (remote work, PTO, title, etc.)`;
        break;

      case "career_path":
        systemPrompt = "You are a career strategist and workforce development expert. Create detailed, actionable career roadmaps with specific milestones, skill requirements, and timeline projections. Include industry trends and emerging opportunities.";
        userPrompt = `Create a comprehensive career path plan:
Current Role: ${params.current_role || "Not specified"}
Target Role: ${params.target_role || "Not specified"}
Industry: ${params.industry || "Not specified"}
Current Skills: ${params.skills || "Not provided"}
Experience Years: ${params.years_experience || "Not specified"}
Education: ${params.education || "Not specified"}
Career Goals: ${params.goals || "Career advancement"}

Provide:
1. **Career Trajectory Map** (current → target with intermediate roles)
2. **Skill Gap Analysis** with priority ranking
3. **Learning Roadmap** (courses, certifications, resources with estimated costs & time)
4. **Milestone Timeline** (6mo / 1yr / 2yr / 5yr goals)
5. **Industry Trends** affecting this career path
6. **Networking Strategy** for career advancement
7. **Salary Progression** forecast at each level
8. **Alternative Career Paths** to consider`;
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${openaiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 3000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenAI error:", errText);
      throw new Error("AI service error");
    }

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content;
    if (!result) throw new Error("No AI response");

    // Deduct credits
    await supabase
      .from("ai_credits")
      .update({ credits_remaining: remaining - creditCost })
      .eq("user_id", user.id);

    // Log usage
    await supabase.from("ai_usage_history").insert({
      user_id: user.id,
      usage_type: `jobs_${action}`,
      credits_used: creditCost,
      description: `Jobs AI: ${action}`,
    });

    return new Response(JSON.stringify({ result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("jobs-ai error:", e);
    return new Response(JSON.stringify({ error: e.message || "Internal error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
