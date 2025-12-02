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
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    const { messages } = await req.json();
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      throw new Error("Messages array is required");
    }

    if (messages.length > 50) {
      throw new Error("Maximum 50 messages allowed per conversation analysis");
    }

    // Check credits
    const { data: credits } = await supabaseClient
      .from("lie_detector_credits")
      .select("credits_remaining")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!credits || credits.credits_remaining < 15) {
      throw new Error("Insufficient credits. You need 15 credits for conversation thread analysis.");
    }

    // Format conversation for analysis
    const conversationText = messages
      .map((msg: any, idx: number) => `Message ${idx + 1}: ${msg.text}`)
      .join("\n\n");

    // Call Lovable AI for analysis
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are an expert lie detection AI specializing in conversation analysis. Analyze the provided conversation thread for truthfulness patterns, inconsistencies, and deception indicators.

Provide a detailed JSON response with:
- overall_truthfulness_score (0-100, where 100 is completely truthful)
- confidence_level (low/medium/high)
- timeline_analysis (array of key moments with truthfulness scores)
- pattern_recognition (recurring deception patterns or behaviors)
- inconsistencies (contradictions or changes in story)
- communication_style_changes (shifts in tone, detail level, or defensiveness)
- red_flags (major concerns or warning signs)
- recommendations (specific follow-up questions or actions to take)

Be thorough and provide actionable insights.`
          },
          {
            role: "user",
            content: `Analyze this conversation thread for truthfulness and deception:\n\n${conversationText}`
          }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI API error:", aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        throw new Error("Rate limit exceeded. Please try again later.");
      }
      if (aiResponse.status === 402) {
        throw new Error("AI service unavailable. Please contact support.");
      }
      throw new Error("AI analysis failed");
    }

    const aiData = await aiResponse.json();
    const analysisText = aiData.choices[0].message.content;
    
    // Parse JSON from AI response
    let results;
    try {
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        results = JSON.parse(jsonMatch[0]);
      } else {
        results = { raw_analysis: analysisText };
      }
    } catch {
      results = { raw_analysis: analysisText };
    }

    // Deduct credits
    await supabaseClient
      .from("lie_detector_credits")
      .update({ 
        credits_remaining: credits.credits_remaining - 15,
      })
      .eq("user_id", user.id);

    // Save analysis
    const { data: analysis } = await supabaseClient
      .from("lie_detector_analyses")
      .insert({
        user_id: user.id,
        analysis_type: "conversation_thread",
        input_text: conversationText,
        results: results,
        truthfulness_score: results.overall_truthfulness_score || null,
        credits_used: 15,
      })
      .select()
      .single();

    return new Response(
      JSON.stringify({ 
        success: true, 
        analysis,
        remaining_credits: credits.credits_remaining - 15 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in analyze-thread:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});