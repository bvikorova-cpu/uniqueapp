import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const CREDIT_COSTS = {
  personal: 5,
  professional: 10,
  relationship: 15,
  business: 20,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    console.log("[HANDWRITING] Starting analysis");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !user) {
      throw new Error("User not authenticated");
    }

    console.log("[HANDWRITING] User authenticated:", user.id);

    const { imageUrl, analysisType } = await req.json();

    if (!imageUrl || !analysisType) {
      throw new Error("Image URL and analysis type are required");
    }

    const creditsRequired = CREDIT_COSTS[analysisType as keyof typeof CREDIT_COSTS];
    if (!creditsRequired) {
      throw new Error("Invalid analysis type");
    }

    console.log("[HANDWRITING] Analysis type:", analysisType, "Credits required:", creditsRequired);

    // Check user credits
    const { data: creditsData, error: creditsError } = await supabaseClient
      .from("handwriting_credits")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (creditsError) {
      throw new Error(`Credits check failed: ${creditsError.message}`);
    }

    if (!creditsData || creditsData.credits_remaining < creditsRequired) {
      throw new Error("Insufficient credits. Please purchase more credits to continue.");
    }

    console.log("[HANDWRITING] Credits available:", creditsData.credits_remaining);

    // Perform AI analysis using OpenAI
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      throw new Error("OPENAI_API_KEY not configured");
    }

    const systemPrompt = getSystemPrompt(analysisType);

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Please analyze this handwriting sample in detail.",
              },
              {
                type: "image_url",
                image_url: {
                  url: imageUrl,
                },
              },
            ],
          },
        ],
        max_completion_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[HANDWRITING] AI API error:", response.status, errorText);
      throw new Error("AI analysis failed");
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    let analysisResult;
    try {
      analysisResult = JSON.parse(aiResponse);
    } catch (e) {
      console.error("[HANDWRITING] Failed to parse AI response:", aiResponse);
      throw new Error("Invalid AI response format");
    }

    console.log("[HANDWRITING] Analysis complete");

    // Atomic credit deduction (race-safe, after AI success)
    const { data: newRemaining, error: dedErr } = await supabaseClient.rpc(
      "deduct_handwriting_credits",
      { _user_id: user.id, _amount: creditsRequired },
    );
    if (dedErr) {
      if (dedErr.message?.includes("INSUFFICIENT_CREDITS")) {
        return new Response(JSON.stringify({ error: "Insufficient credits" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`Failed to update credits: ${dedErr.message}`);
    }

    console.log("[HANDWRITING] Credits deducted:", creditsRequired);

    // Save analysis to database (refund on failure)
    const { data: savedAnalysis, error: insertError } = await supabaseClient
      .from("handwriting_analyses")
      .insert({
        user_id: user.id,
        image_url: imageUrl,
        analysis_type: analysisType,
        credits_used: creditsRequired,
        personality_traits: analysisResult.personality_traits,
        strengths: analysisResult.strengths,
        weaknesses: analysisResult.weaknesses,
        emotional_state: analysisResult.emotional_state,
        communication_style: analysisResult.communication_style,
        work_approach: analysisResult.work_approach,
        relationship_patterns: analysisResult.relationship_patterns,
        decision_making: analysisResult.decision_making,
        stress_indicators: analysisResult.stress_indicators,
        creativity_level: analysisResult.creativity_level,
        leadership_qualities: analysisResult.leadership_qualities,
        detailed_analysis: analysisResult.detailed_analysis,
        recommendations: analysisResult.recommendations,
      })
      .select()
      .single();

    if (insertError) {
      await supabaseClient.rpc("refund_handwriting_credits", { _user_id: user.id, _amount: creditsRequired });
      throw new Error(`Failed to save analysis: ${insertError.message}`);
    }


    console.log("[HANDWRITING] Analysis saved:", savedAnalysis.id);

    return new Response(
      JSON.stringify({
        success: true,
        analysis: savedAnalysis,
        creditsRemaining: creditsData.credits_remaining - creditsRequired,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("[HANDWRITING] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

function getSystemPrompt(analysisType: string): string {
  const basePrompt = `You are a professional graphologist and handwriting analyst with 20+ years of experience. 
Analyze the handwriting sample and provide a comprehensive psychological and personality assessment.

IMPORTANT: Return ONLY a valid JSON object with this exact structure:
{
  "personality_traits": {
    "openness": "description",
    "conscientiousness": "description",
    "extraversion": "description",
    "agreeableness": "description",
    "neuroticism": "description"
  },
  "strengths": ["strength1", "strength2", "strength3"],
  "weaknesses": ["weakness1", "weakness2", "weakness3"],
  "emotional_state": "detailed emotional state analysis",
  "communication_style": "communication style description",
  "work_approach": "work style and approach description",
  "relationship_patterns": "relationship and social patterns",
  "decision_making": "decision making style",
  "stress_indicators": "stress level and coping mechanisms",
  "creativity_level": "creativity assessment",
  "leadership_qualities": "leadership potential and style",
  "detailed_analysis": "comprehensive 3-4 paragraph analysis",
  "recommendations": ["recommendation1", "recommendation2", "recommendation3"]
}`;

  const typeSpecific = {
    personal: "\n\nFocus on: Personal growth, emotional intelligence, self-awareness, relationship compatibility, life balance.",
    professional: "\n\nFocus on: Career strengths, work style, team collaboration, leadership potential, professional development areas.",
    relationship: "\n\nFocus on: Communication patterns, emotional availability, conflict resolution style, intimacy indicators, partner compatibility.",
    business: "\n\nFocus on: Decision-making under pressure, risk tolerance, negotiation style, strategic thinking, business acumen.",
  };

  return basePrompt + (typeSpecific[analysisType as keyof typeof typeSpecific] || "");
}
