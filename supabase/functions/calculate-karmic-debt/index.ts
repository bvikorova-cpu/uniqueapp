import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
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
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    
    if (!user) throw new Error("User not authenticated");

    // Fetch existing karmic debts
    const { data: existingDebts } = await supabaseClient
      .from("karmic_debts")
      .select("*")
      .eq("user_id", user.id);

    // Calculate overall karma balance
    const totalBalance = (existingDebts || []).reduce((sum, debt) => sum + (debt.balance_score || 0), 0);
    const averageBalance = existingDebts && existingDebts.length > 0 
      ? Math.round(totalBalance / existingDebts.length)
      : 50;

    // Use OpenAI to generate personalized karmic insights
    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) throw new Error("OpenAI API key not configured");

    const debtsSummary = (existingDebts || []).map(d => 
      `Type: ${d.debt_type}, Origin: ${d.origin_life || 'Unknown'}, Balance: ${d.balance_score}, Status: ${d.current_status}`
    ).join("; ");

    const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a karmic balance advisor. Analyze the user's karmic debts and provide personalized insights. Return ONLY valid JSON:
{
  "recommendations": ["5 specific, personalized recommendations based on their karmic debts"],
  "daily_actions": [
    {"action": "specific daily action", "karma_points": number 3-20}
  ],
  "karmic_analysis": "2-3 sentence personalized analysis of their karmic state",
  "focus_area": "the most important area they should focus on"
}
Generate exactly 5 recommendations and 5 daily actions. Make them specific and personalized.`
          },
          {
            role: "user",
            content: `Analyze my karmic state. Overall balance: ${averageBalance}/100. Total debts: ${existingDebts?.length || 0}. Details: ${debtsSummary || "No debts recorded yet - this is a new soul journey."}`
          }
        ],
        temperature: 0.8,
        max_tokens: 1000,
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("OpenAI error:", errText);
      throw new Error("Failed to generate AI karmic insights");
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices[0]?.message?.content;
    
    let aiInsights;
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      aiInsights = JSON.parse(cleaned);
    } catch (e) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse AI karmic insights");
    }

    const insights = {
      overall_balance: averageBalance,
      status: averageBalance >= 70 ? "Excellent" : averageBalance >= 50 ? "Balanced" : averageBalance >= 30 ? "Working Progress" : "Needs Attention",
      total_debts: existingDebts?.length || 0,
      active_debts: existingDebts?.filter(d => d.current_status === 'active').length || 0,
      resolved_debts: existingDebts?.filter(d => d.current_status === 'resolved').length || 0,
      recommendations: aiInsights.recommendations,
      daily_actions: aiInsights.daily_actions,
      karmic_analysis: aiInsights.karmic_analysis,
      focus_area: aiInsights.focus_area,
    };

    return new Response(
      JSON.stringify({ 
        success: true, 
        insights,
        debts: existingDebts || []
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: unknown) {
    console.error("Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
