import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
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
      throw new Error("No authorization header");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    const { messages, context } = await req.json();
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      throw new Error("Messages array is required for psychological profiling");
    }

    // Check credits
    const { data: credits } = await supabaseClient
      .from("lie_detector_credits")
      .select("credits_remaining")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!credits || credits.credits_remaining < 50) {
      throw new Error("Insufficient credits. You need 50 credits for deep psychological profile.");
    }

    // Format conversation for analysis
    const conversationText = messages
      .map((msg: any, idx: number) => `Message ${idx + 1}: ${msg.text}`)
      .join("\n\n");

    // Call OpenAI for analysis
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY not configured");
    }

    const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are an expert forensic psychologist specializing in communication analysis and behavioral profiling. Analyze the provided messages to create a comprehensive psychological profile.

Provide a detailed JSON response with:
- communication_patterns (how they typically communicate)
- manipulation_techniques (specific tactics they use)
- emotional_triggers (what topics cause emotional responses)
- honesty_baseline (their typical truthfulness patterns)
- defensiveness_indicators (when and how they become defensive)
- personality_traits (dominant personality characteristics)
- relationship_dynamics (how they interact in relationships)
- red_flags (concerning patterns or behaviors)
- power_dynamics (control and influence tactics)
- recommendations (how to communicate effectively with this person)
- follow_up_strategies (specific questions or approaches to use)

Be thorough, professional, and provide actionable psychological insights.`
          },
          {
            role: "user",
            content: `Create a deep psychological profile based on these messages${context ? ` (Context: ${context})` : ''}:\n\n${conversationText}`
          }
        ],
        response_format: { type: "json_object" }
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("OpenAI API error:", aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        throw new Error("Rate limit exceeded. Please try again later.");
      }
      throw new Error("AI analysis failed");
    }

    const aiData = await aiResponse.json();
    const analysisText = aiData.choices[0].message.content;
    
    // Parse JSON from AI response
    let results;
    try {
      results = JSON.parse(analysisText);
    } catch {
      results = { raw_analysis: analysisText };
    }

    // Deduct credits
    await supabaseClient
      .from("lie_detector_credits")
      .update({ 
        credits_remaining: credits.credits_remaining - 50,
      })
      .eq("user_id", user.id);

    // Save analysis
    const { data: analysis } = await supabaseClient
      .from("lie_detector_analyses")
      .insert({
        user_id: user.id,
        analysis_type: "psychological_profile",
        input_text: conversationText,
        results: results,
        truthfulness_score: null,
        credits_used: 50,
      })
      .select()
      .single();

    return new Response(
      JSON.stringify({ 
        success: true, 
        analysis,
        remaining_credits: credits.credits_remaining - 50 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in analyze-profile:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
