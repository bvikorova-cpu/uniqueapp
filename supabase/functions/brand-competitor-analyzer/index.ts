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
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
    if (authError || !user) throw new Error("Unauthorized");

    const { businessName, industry, description } = await req.json();

    const { data: credits } = await supabase
      .from("ai_credits")
      .select("credits_remaining")
      .eq("user_id", user.id)
      .single();

    if (!credits || credits.credits_remaining < 12) {
      return new Response(JSON.stringify({ error: "Insufficient credits. You need 12 credits." }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a brand strategy consultant. Analyze competitors and create a unique positioning strategy. Return JSON with:
- "competitors": array of 5 objects with "name", "strengths", "weaknesses", "market_position", "estimated_market_share"
- "positioning": object with "unique_value_proposition", "differentiators" (array of 5), "target_niche", "pricing_strategy", "brand_personality", "competitive_advantages" (array of 3), "market_gaps" (array of 3)`
          },
          {
            role: "user",
            content: `Analyze the competitive landscape for "${businessName}" in the ${industry} industry. Business description: ${description || 'Not provided'}. Identify top competitors and create a unique positioning strategy.`
          }
        ],
        response_format: { type: "json_object" },
      }),
    });

    const aiData = await openaiRes.json();
    const analysis = JSON.parse(aiData.choices[0].message.content);

    await supabase.from("ai_credits").update({
      credits_remaining: credits.credits_remaining - 12,
    }).eq("user_id", user.id);

    await supabase.from("brand_competitor_analyses").insert({
      user_id: user.id,
      business_name: businessName,
      industry,
      competitors: analysis.competitors,
      positioning: analysis.positioning,
      credits_used: 12,
    });

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
