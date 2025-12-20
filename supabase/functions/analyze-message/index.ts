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

    const { message } = await req.json();
    
    if (!message || typeof message !== 'string') {
      throw new Error("Message is required");
    }

    // Check credits
    const { data: credits } = await supabaseClient
      .from("lie_detector_credits")
      .select("credits_remaining")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!credits || credits.credits_remaining < 3) {
      throw new Error("Insufficient credits. You need 3 credits for message analysis.");
    }

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
            content: `You are an expert lie detection AI. Analyze the provided message for truthfulness, deception, manipulation, and emotional indicators.

Provide a detailed JSON response with:
- truthfulness_score (0-100, where 100 is completely truthful)
- confidence_level (low/medium/high)
- deception_indicators (array of specific indicators found)
- emotional_analysis (detected emotions and their intensity)
- manipulation_tactics (any detected manipulation techniques)
- vagueness_score (0-100, where 0 is very specific and 100 is very vague)
- recommendations (advice on how to respond or what follow-up questions to ask)

Be specific and provide actionable insights.`
          },
          {
            role: "user",
            content: `Analyze this message for truthfulness:\n\n"${message}"`
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
        credits_remaining: credits.credits_remaining - 3,
      })
      .eq("user_id", user.id);

    // Save analysis
    const { data: analysis } = await supabaseClient
      .from("lie_detector_analyses")
      .insert({
        user_id: user.id,
        analysis_type: "single_message",
        input_text: message,
        results: results,
        truthfulness_score: results.truthfulness_score || null,
        credits_used: 3,
      })
      .select()
      .single();

    return new Response(
      JSON.stringify({ 
        success: true, 
        analysis,
        remaining_credits: credits.credits_remaining - 3 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in analyze-message:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
