import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { action, ...params } = await req.json();
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY not configured");

    let systemPrompt = "";
    let userPrompt = "";
    let credits = 3;

    switch (action) {
      case "skill-valuation": {
        credits = 4;
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
        credits = 3;
        systemPrompt = `You are an expert presentation coach specializing in skill demonstrations. Create a compelling live demo script that will help the user showcase their skill effectively to potential exchange partners. Include:
1. **Opening Hook** (30 seconds): Attention-grabbing introduction
2. **Skill Overview** (2 minutes): What the skill involves and why it's valuable
3. **Live Demonstration Plan** (5-7 minutes): Step-by-step demo with talking points
4. **Audience Engagement**: Interactive elements and Q&A prompts
5. **Closing & CTA**: How to convert viewers into exchange partners
6. **Technical Setup**: Equipment and tools needed for the demo
7. **Tips for Success**: Presentation best practices

Make it practical, engaging, and professional.`;
        userPrompt = `Create a live skill demo script for:\n\nSkill: ${params.skillName}\nTarget Audience: ${params.targetAudience || "General"}\nDemo Duration: ${params.duration || "10 minutes"}\nExperience Level: ${params.experienceLevel || "Intermediate"}\nKey Strengths: ${params.strengths || "Not specified"}`;
        break;
      }

      case "skill-certification": {
        credits = 5;
        systemPrompt = `You are an AI skill assessor and certification specialist. Based on the user's answers to assessment questions, provide:
1. **Overall Score** (0-100): Comprehensive skill proficiency score
2. **Proficiency Level**: Beginner / Intermediate / Advanced / Expert / Master
3. **Strengths Identified**: Areas where the user excels
4. **Areas for Improvement**: Gaps in knowledge or practice
5. **Certification Recommendation**: Whether they qualify for certification
6. **Detailed Feedback**: Per-question analysis with correct answers explained
7. **Learning Path**: Recommended next steps to improve
8. **Digital Badge Description**: What the certification badge would represent

Be thorough but encouraging. Provide actionable feedback.`;
        userPrompt = `Assess and certify this skill:\n\nSkill: ${params.skillName}\nSelf-Assessment Answers:\n${params.answers || "General assessment requested"}\nClaimed Experience: ${params.experience || "Not specified"}\nPortfolio Description: ${params.portfolio || "None provided"}`;
        break;
      }

      case "workshop-planner": {
        credits = 4;
        systemPrompt = `You are an expert workshop facilitator and curriculum designer. Create a comprehensive group workshop plan for teaching a skill to multiple learners simultaneously. Include:
1. **Workshop Title**: Catchy, marketable name
2. **Workshop Overview**: Description, objectives, target audience
3. **Duration & Structure**: Timeline with segments and breaks
4. **Materials Needed**: Tools, supplies, software for participants
5. **Lesson Plan**: Detailed session-by-session breakdown with activities
6. **Interactive Exercises**: Hands-on activities for group engagement
7. **Assessment Criteria**: How to measure participant progress
8. **Pricing Recommendation**: Suggested credit cost per participant
9. **Marketing Tips**: How to attract participants
10. **Follow-up Plan**: Post-workshop engagement strategy

Make it practical, scalable, and engaging for groups of 5-20 people.`;
        userPrompt = `Design a group workshop for:\n\nSkill: ${params.skillName}\nGroup Size: ${params.groupSize || "5-10 participants"}\nDuration: ${params.workshopDuration || "2 hours"}\nDifficulty Level: ${params.difficultyLevel || "Beginner-friendly"}\nFormat: ${params.format || "Online"}\nSpecial Requirements: ${params.requirements || "None"}`;
        break;
      }

      default:
        return new Response(JSON.stringify({ error: "Unknown action" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_completion_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenAI error:", errText);
      throw new Error("AI service unavailable");
    }

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content || "No result generated";

    return new Response(JSON.stringify({ result, credits_used: credits }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("skill-swap-ai error:", error);
    return new Response(JSON.stringify({ error: error.message || "Service error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
