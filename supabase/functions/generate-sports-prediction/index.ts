import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[GENERATE-SPORTS-PREDICTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: userData, error: userError } = await supabaseClient.auth.getUser();
    if (userError) throw userError;
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");

    logStep("User authenticated", { userId: user.id });

    // Check subscription
    const { data: subData, error: subError } = await supabaseClient.functions.invoke(
      "check-sports-subscription",
      { headers: { Authorization: authHeader } }
    );

    if (subError || !subData?.subscribed) {
      throw new Error("Active subscription required");
    }

    logStep("Subscription verified", { tier: subData.tier });

    const { matchId } = await req.json();
    if (!matchId) throw new Error("Match ID required");

    // Get match details
    const { data: match, error: matchError } = await supabaseClient
      .from("sports_matches")
      .select("*")
      .eq("id", matchId)
      .single();

    if (matchError || !match) throw new Error("Match not found");

    logStep("Match found", { match: match.home_team + " vs " + match.away_team });

    // Check if prediction already exists
    const { data: existingPrediction } = await supabaseClient
      .from("sports_predictions")
      .select("*")
      .eq("match_id", matchId)
      .maybeSingle();

    if (existingPrediction) {
      logStep("Prediction already exists");
      return new Response(JSON.stringify({ 
        prediction: existingPrediction,
        message: "Prediction already generated for this match"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Generate AI prediction using OpenAI
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) throw new Error("OPENAI_API_KEY not configured");

    const prompt = `You are an expert sports analyst. Analyze this upcoming match and provide a prediction:

Match Details:
- Sport: ${match.sport}
- League: ${match.league}
- Home Team: ${match.home_team}
- Away Team: ${match.away_team}
- Date: ${match.match_date}
- Time: ${match.match_time}

Provide:
1. Prediction type (home_win, away_win, or draw)
2. Confidence level (0-100)
3. Estimated odds (decimal format, e.g., 2.5)
4. Brief analysis (2-3 sentences explaining your reasoning)

Consider: recent form, head-to-head records, home advantage, team strength.

Format your response as JSON:
{
  "prediction_type": "home_win|away_win|draw",
  "confidence": 75,
  "odds": 2.1,
  "analysis": "Brief explanation of your prediction"
}`;

    logStep("Calling OpenAI");

    const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a professional sports analyst providing match predictions." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" }
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      logStep("OpenAI API Error", { status: aiResponse.status, error: errorText });
      throw new Error(`OpenAI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices[0].message.content;
    logStep("AI response received", { content: aiContent });

    let predictionData;
    try {
      predictionData = JSON.parse(aiContent);
    } catch (parseError) {
      logStep("Failed to parse AI response", { content: aiContent });
      throw new Error("Invalid AI response format");
    }

    // Validate prediction type
    const validTypes = ['home_win', 'away_win', 'draw'];
    if (!validTypes.includes(predictionData.prediction_type)) {
      predictionData.prediction_type = 'home_win'; // Default fallback
    }

    // Save prediction to database
    const { data: savedPrediction, error: saveError } = await supabaseClient
      .from("sports_predictions")
      .insert({
        match_id: matchId,
        prediction_type: predictionData.prediction_type,
        confidence: Math.min(100, Math.max(0, predictionData.confidence)),
        odds: predictionData.odds,
        analysis_text: predictionData.analysis,
        created_by: user.id,
      })
      .select()
      .single();

    if (saveError) {
      logStep("Error saving prediction", { error: saveError });
      throw saveError;
    }

    logStep("Prediction saved successfully", { id: savedPrediction.id });

    return new Response(JSON.stringify({ 
      prediction: savedPrediction,
      message: "Prediction generated successfully"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
