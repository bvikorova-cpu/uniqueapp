import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Not authenticated");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) throw new Error("Invalid session");

    const { action, ...params } = await req.json();

    const creditCosts: Record<string, number> = {
      "service-optimizer": 4,
      "pricing-advisor": 3,
      "proposal-writer": 4,
      "client-matcher": 5,
      "portfolio-review": 4,
      "market-analysis": 5,
    };

    const cost = creditCosts[action];
    if (!cost) throw new Error("Unknown action: " + action);

    // Check credits
    const { data: credits } = await supabase
      .from("ai_credits")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (!credits || credits.credits_remaining < cost) {
      throw new Error(`Insufficient credits. Need ${cost}, have ${credits?.credits_remaining || 0}`);
    }

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OpenAI API key not configured");

    let systemPrompt = "";
    let userPrompt = "";

    switch (action) {
      case "service-optimizer":
        systemPrompt = "You are an expert marketplace consultant who helps freelancers optimize their service listings for maximum visibility and conversions.";
        userPrompt = `Optimize this service listing for a skills marketplace:\n\nTitle: ${params.title}\nDescription: ${params.description}\nCategory: ${params.category}\nPrice: €${params.price}/hr\n\nProvide:\n1. Optimized title (SEO-friendly, compelling)\n2. Rewritten description (professional, conversion-focused)\n3. Suggested tags/keywords\n4. Pricing recommendation with justification\n5. Tips for standing out in this category`;
        break;

      case "pricing-advisor":
        systemPrompt = "You are a pricing strategy expert for freelance services and skills marketplaces. Provide data-driven pricing advice.";
        userPrompt = `Analyze pricing for this service:\n\nSkill: ${params.skill}\nExperience Level: ${params.experience}\nLocation: ${params.location || "Global"}\nCurrent Price: ${params.currentPrice ? "€" + params.currentPrice + "/hr" : "Not set"}\n\nProvide:\n1. Recommended price range (€/hr)\n2. Market comparison analysis\n3. Value-based pricing tips\n4. Package pricing suggestions (basic/standard/premium)\n5. When to raise prices`;
        break;

      case "proposal-writer":
        systemPrompt = "You are an expert at writing winning freelance proposals that get clients to hire you. Write professional, personalized proposals.";
        userPrompt = `Write a compelling proposal for this job:\n\nJob Description: ${params.jobDescription}\nMy Skills: ${params.mySkills}\nMy Experience: ${params.experience}\nBudget: ${params.budget || "Not specified"}\n\nWrite a professional, personalized proposal that:\n1. Opens with a hook addressing the client's specific need\n2. Demonstrates relevant experience\n3. Outlines a clear approach/timeline\n4. Includes a call to action\n5. Is concise but thorough`;
        break;

      case "client-matcher":
        systemPrompt = "You are an AI matchmaking system for a skills marketplace. Analyze service provider profiles and suggest ideal client types and niches.";
        userPrompt = `Analyze this service provider profile and suggest ideal clients:\n\nSkills: ${params.skills}\nExperience: ${params.experience}\nPortfolio: ${params.portfolio || "Not provided"}\nPreferred Work: ${params.preferredWork || "Any"}\n\nProvide:\n1. Top 5 ideal client types\n2. Industry niches to target\n3. How to position yourself for these clients\n4. Outreach message templates\n5. Platforms/channels to find these clients`;
        break;

      case "portfolio-review":
        systemPrompt = "You are a professional portfolio and personal branding consultant for freelancers and service providers.";
        userPrompt = `Review and improve this portfolio/profile:\n\nBio: ${params.bio}\nSkills: ${params.skills}\nPortfolio Description: ${params.portfolio}\nTestimonials: ${params.testimonials || "None yet"}\n\nProvide:\n1. Bio rewrite (compelling, professional)\n2. Skills presentation improvement\n3. Portfolio organization tips\n4. How to get and display testimonials\n5. Personal branding recommendations`;
        break;

      case "market-analysis":
        systemPrompt = "You are a market research analyst specializing in freelance and gig economy trends. Provide comprehensive market insights.";
        userPrompt = `Analyze the market for this service category:\n\nCategory: ${params.category}\nSpecific Skill: ${params.skill}\nRegion: ${params.region || "Global"}\n\nProvide:\n1. Demand analysis (trending up/down/stable)\n2. Competition level assessment\n3. Average pricing in this market\n4. Emerging sub-niches with less competition\n5. Skills to add for premium positioning\n6. Forecast for the next 6-12 months`;
        break;
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
        max_tokens: 1500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenAI error:", errText);
      throw new Error("AI service error");
    }

    const aiData = await response.json();
    const result = aiData.choices?.[0]?.message?.content || "No result generated";

    // Deduct credits
    await supabase
      .from("ai_credits")
      .update({
        credits_remaining: credits.credits_remaining - cost,
        last_used_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    return new Response(
      JSON.stringify({ result, credits_used: cost }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("marketplace-ai error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
