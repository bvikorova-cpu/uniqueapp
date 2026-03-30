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

    const { destination, days, budget, interests } = await req.json();
    if (!destination) throw new Error("Destination is required");

    // Check credits
    const { data: credits } = await supabase.from("ai_credits").select("*").eq("user_id", user.id).single();
    if (!credits || credits.credits_remaining < 10) throw new Error("Insufficient credits. You need 10 credits.");

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${Deno.env.get("OPENAI_API_KEY")}` },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are an expert travel planner. Create detailed, personalized travel itineraries. Always respond in valid JSON format."
          },
          {
            role: "user",
            content: `Create a ${days}-day travel itinerary for ${destination}. Budget level: ${budget}. Interests: ${interests?.join(", ") || "general"}. 
            
            Return JSON: { "title": "string", "overview": "string", "days": [{ "theme": "string", "morning": "string", "afternoon": "string", "evening": "string", "food_tip": "string", "culture_tip": "string" }], "tips": ["string"] }`
          }
        ],
        temperature: 0.8,
        response_format: { type: "json_object" },
      }),
    });

    const aiData = await openaiRes.json();
    const plan = JSON.parse(aiData.choices[0].message.content);

    // Save to DB
    await supabase.from("travel_plans").insert({
      user_id: user.id,
      destination,
      duration_days: days,
      plan_data: plan,
      interests: interests || [],
      budget_level: budget,
    });

    // Deduct credits
    await supabase.from("ai_credits").update({
      credits_remaining: credits.credits_remaining - 10,
    }).eq("user_id", user.id);

    await supabase.from("ai_usage_history").insert({
      user_id: user.id,
      usage_type: "travel_planner",
      credits_used: 10,
      description: `Travel plan for ${destination} (${days} days)`,
    });

    return new Response(JSON.stringify({ plan }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
