import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  // Early auth pre-check (returns 401 instead of crashing inside try → 500)
  const _earlyAuth = req.headers.get("Authorization");
  if (!_earlyAuth || !_earlyAuth.toLowerCase().startsWith("bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Not authenticated");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { action, ...params } = await req.json();
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OpenAI API key not configured");

    // Credit costs per action
    const creditCosts: Record<string, number> = {
      "price-estimator": 3,
      "listing-optimizer": 3,
      "buyer-match": 4,
      "fraud-detector": 4,
    };

    const cost = creditCosts[action];
    if (!cost) throw new Error(`Unknown action: ${action}`);

    // Check & deduct credits
    const { data: credits } = await supabase
      .from("ai_credits")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    const remaining = credits?.credits_remaining ?? 0;
    if (remaining < cost) {
      return new Response(JSON.stringify({ error: "Insufficient credits", credits_remaining: remaining, credits_needed: cost }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let systemPrompt = "";
    let userPrompt = "";

    switch (action) {
      case "price-estimator": {
        systemPrompt = "You are an expert marketplace pricing analyst. Analyze the item and provide a detailed fair market price estimate.";
        userPrompt = `Analyze this item for pricing:
Title: ${params.title || "N/A"}
Category: ${params.category || "N/A"}
Condition: ${params.condition || "N/A"}
Description: ${params.description || "N/A"}
Seller's asking price: €${params.askingPrice || "Not set"}

Provide:
1. **Fair Market Value**: Estimated price range (€)
2. **Price Analysis**: How the asking price compares to market value
3. **Pricing Strategy**: Suggestions to maximize sale price
4. **Market Demand**: Current demand level for this type of item (High/Medium/Low)
5. **Quick Sale Price**: Price for a fast sale
6. **Premium Price**: Maximum you could ask with patience
7. **Key Value Factors**: What affects this item's value most`;
        break;
      }

      case "listing-optimizer": {
        systemPrompt = "You are a conversion optimization expert for online marketplaces. Rewrite listings for maximum engagement and sales.";
        userPrompt = `Optimize this listing for maximum sales:
Title: ${params.title || "N/A"}
Description: ${params.description || "N/A"}
Category: ${params.category || "N/A"}
Condition: ${params.condition || "N/A"}
Price: €${params.price || "N/A"}

Provide:
1. **Optimized Title**: SEO-friendly, attention-grabbing title (max 80 chars)
2. **Optimized Description**: Compelling, detailed description with bullet points
3. **Suggested Tags**: 5-8 search keywords
4. **Photo Tips**: Specific advice for product photography
5. **Pricing Psychology**: Price presentation tips
6. **Urgency Triggers**: Phrases to create buying urgency
7. **Trust Signals**: Elements to build buyer confidence`;
        break;
      }

      case "buyer-match": {
        systemPrompt = "You are a marketplace matchmaking expert. Analyze items and identify ideal buyer profiles and selling strategies.";
        userPrompt = `Find ideal buyers for this item:
Title: ${params.title || "N/A"}
Category: ${params.category || "N/A"}
Condition: ${params.condition || "N/A"}
Description: ${params.description || "N/A"}
Price: €${params.price || "N/A"}

Provide:
1. **Ideal Buyer Profiles**: 3-4 specific buyer personas who would want this item
2. **Target Demographics**: Age, interests, lifestyle of likely buyers
3. **Best Selling Channels**: Where to reach these buyers
4. **Timing Strategy**: Best time/season to list this item
5. **Cross-Sell Opportunities**: Related items buyers might also want
6. **Marketing Angles**: Different ways to position this item
7. **Negotiation Tips**: How to handle different buyer types`;
        break;
      }

      case "fraud-detector": {
        systemPrompt = "You are a marketplace fraud detection and authenticity verification expert. Analyze listings for red flags and provide trust assessments.";
        userPrompt = `Analyze this listing for authenticity and potential issues:
Title: ${params.title || "N/A"}
Category: ${params.category || "N/A"}
Condition: ${params.condition || "N/A"}
Description: ${params.description || "N/A"}
Price: €${params.price || "N/A"}
Seller info: ${params.sellerInfo || "N/A"}

Provide:
1. **Trust Score**: 0-100 rating with explanation
2. **Red Flags**: Any concerning signals detected (or "None found")
3. **Authenticity Assessment**: Likelihood the item is genuine
4. **Price Fairness**: Whether the price seems legitimate for the item
5. **Description Quality**: How detailed and honest the description appears
6. **Safety Tips**: Recommendations for safe transaction
7. **Verification Checklist**: Questions buyer should ask before purchasing`;
        break;
      }
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_completion_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenAI error:", errText);
      throw new Error("AI processing failed");
    }

    const aiData = await response.json();
    const result = aiData.choices?.[0]?.message?.content || "No result generated";

    // Deduct credits
    if (credits) {
      await supabase
        .from("ai_credits")
        .update({ credits_remaining: remaining - cost, last_used_at: new Date().toISOString() })
        .eq("user_id", user.id);
    }

    // Log usage
    await supabase.from("ai_usage_history").insert({
      user_id: user.id,
      usage_type: `bazaar_${action}`,
      credits_used: cost,
      description: `Bazaar AI: ${action}`,
    });

    return new Response(JSON.stringify({ result, credits_used: cost, credits_remaining: remaining - cost }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("bazaar-ai error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: error.message.includes("Insufficient") ? 402 : 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
