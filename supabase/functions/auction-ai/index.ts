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
    if (!authHeader) throw new Error("No authorization header");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error("Not authenticated");

    const { action, ...params } = await req.json();

    const creditCosts: Record<string, number> = {
      price_estimator: 3,
      listing_optimizer: 4,
      bid_strategy: 3,
      category_recommender: 2,
    };

    const cost = creditCosts[action];
    if (!cost) throw new Error("Unknown action: " + action);

    // Check credits
    const { data: credits } = await supabase
      .from("ai_credits")
      .select("credits_remaining")
      .eq("user_id", user.id)
      .single();

    if (!credits || credits.credits_remaining < cost) {
      throw new Error(`Insufficient credits. You need ${cost} credits for this action.`);
    }

    let systemPrompt = "";
    let userPrompt = "";

    switch (action) {
      case "price_estimator":
        systemPrompt = "You are an expert auction pricing analyst. Analyze the item description and provide: 1) Recommended starting price range, 2) Optimal Buy Now price, 3) Expected final auction price, 4) Market demand assessment, 5) Price factors analysis, 6) Seasonal pricing tips. Use € currency. Be specific with numbers.";
        userPrompt = params.description;
        break;
      case "listing_optimizer":
        systemPrompt = "You are an expert auction listing copywriter. Take the provided listing and create: 1) An optimized, attention-grabbing title (max 80 chars), 2) A persuasive, SEO-friendly description with bullet points highlighting key features, 3) Suggested keywords/tags, 4) Photography tips specific to this item, 5) Best time to list, 6) Emotional triggers to include. Make it professional and compelling.";
        userPrompt = params.listing;
        break;
      case "bid_strategy":
        systemPrompt = "You are an expert auction bidding strategist. Analyze the auction details and provide: 1) Recommended maximum bid, 2) Optimal bidding timing strategy, 3) Snipe vs early bid recommendation, 4) Risk assessment, 5) Value analysis (is it worth it?), 6) Counter-bidding tactics. Use € currency.";
        userPrompt = params.auction_info;
        break;
      case "category_recommender":
        systemPrompt = "You are an expert product categorization specialist. Analyze the item and provide: 1) Primary recommended category, 2) Alternative categories, 3) Suggested condition rating with justification, 4) Target audience analysis, 5) Suggested tags and keywords, 6) Cross-listing opportunities. Be specific and actionable.";
        userPrompt = params.item_description;
        break;
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("AI API key not configured");

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) throw new Error("AI rate limited. Please try again in a moment.");
      if (aiResponse.status === 402) throw new Error("AI credits exhausted. Please add funds.");
      throw new Error("AI service error");
    }

    const aiData = await aiResponse.json();
    const result = aiData.choices?.[0]?.message?.content || "No result generated";

    // Deduct credits
    await supabase.rpc("deduct_ai_credits" as any, { p_user_id: user.id, p_amount: cost });

    return new Response(JSON.stringify({ result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
