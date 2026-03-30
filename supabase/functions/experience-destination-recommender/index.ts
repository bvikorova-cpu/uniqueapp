import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) throw new Error("Unauthorized");

    const { travelStyle, climate, budgetLevel, interests } = await req.json();

    const { data: credits } = await supabase.from("ai_credits").select("*").eq("user_id", user.id).single();
    if (!credits || credits.credits_remaining < 5) throw new Error("Insufficient credits. You need 5 credits.");

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${Deno.env.get("OPENAI_API_KEY")}` },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are an expert travel advisor. Recommend destinations based on user preferences. Always respond in valid JSON format."
          },
          {
            role: "user",
            content: `Recommend 5 travel destinations based on these preferences:
            - Travel style: ${travelStyle}
            - Climate: ${climate}
            - Budget: ${budgetLevel}
            - Interests: ${interests?.join(", ") || "general"}
            
            Return JSON: { "recommendations": [{ "destination": "string", "description": "string (2-3 sentences)", "match_score": number (70-99), "best_season": "string", "highlights": ["string", "string", "string"], "estimated_budget": "string (e.g. $50-100/day)" }] }`
          }
        ],
        temperature: 0.8,
        response_format: { type: "json_object" },
      }),
    });

    const aiData = await openaiRes.json();
    const result = JSON.parse(aiData.choices[0].message.content);

    await supabase.from("ai_credits").update({
      credits_remaining: credits.credits_remaining - 5,
    }).eq("user_id", user.id);

    await supabase.from("ai_usage_history").insert({
      user_id: user.id,
      usage_type: "destination_recommender",
      credits_used: 5,
      description: `Destination recommendations (${travelStyle}, ${climate})`,
    });

    return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
