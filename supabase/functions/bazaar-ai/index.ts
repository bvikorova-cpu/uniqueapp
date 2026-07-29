import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { callOpenAI } from "../_shared/openai.ts";

const corsHeaders = { "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const _earlyAuth = req.headers.get("Authorization");
  if (!_earlyAuth || !_earlyAuth.toLowerCase().startsWith("bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
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
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { action, ...params } = await req.json();

    const creditCosts: Record<string, number> = { "price-estimator": 3,
      "listing-optimizer": 3,
      "buyer-match": 4,
      "fraud-detector": 4 };

    const cost = creditCosts[action];
    if (!cost) throw new Error(`Unknown action: ${action}`);

    const { data: credits } = await supabase
      .from("ai_credits")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    const remaining = credits?.credits_remaining ?? 0;
    if (remaining < cost) {
      return new Response(JSON.stringify({ error: "Insufficient credits", credits_remaining: remaining, credits_needed: cost }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    let systemPrompt = "";
    let userPrompt = "";

    switch (action) {
      case "price-estimator": {
        systemPrompt = "You are an expert marketplace pricing analyst. Analyze the item and provide a detailed fair market price estimate.";
        userPrompt = `Analyze this item for pricing:\nTitle: ${params.title || "N/A"}\nCategory: ${params.category || "N/A"}\nCondition: ${params.condition || "N/A"}\nDescription: ${params.description || "N/A"}\nSeller's asking price: €${params.askingPrice || "Not set"}\n\nProvide:\n1. **Fair Market Value**: Estimated price range (€)\n2. **Price Analysis**: How the asking price compares to market value\n3. **Pricing Strategy**: Suggestions to maximize sale price\n4. **Market Demand**: Current demand level for this type of item (High/Medium/Low)\n5. **Quick Sale Price**: Price for a fast sale\n6. **Premium Price**: Maximum you could ask with patience\n7. **Key Value Factors**: What affects this item's value most`;
        break;
      }
      case "listing-optimizer": {
        systemPrompt = "You are a conversion optimization expert for online marketplaces. Rewrite listings for maximum engagement and sales.";
        userPrompt = `Optimize this listing for maximum sales:\nTitle: ${params.title || "N/A"}\nDescription: ${params.description || "N/A"}\nCategory: ${params.category || "N/A"}\nCondition: ${params.condition || "N/A"}\nPrice: €${params.price || "N/A"}\n\nProvide:\n1. **Optimized Title**: SEO-friendly, attention-grabbing title (max 80 chars)\n2. **Optimized Description**: Compelling, detailed description with bullet points\n3. **Suggested Tags**: 5-8 search keywords\n4. **Photo Tips**: Specific advice for product photography\n5. **Pricing Psychology**: Price presentation tips\n6. **Urgency Triggers**: Phrases to create buying urgency\n7. **Trust Signals**: Elements to build buyer confidence`;
        break;
      }
      case "buyer-match": {
        systemPrompt = "You are a marketplace matchmaking expert. Analyze items and identify ideal buyer profiles and selling strategies.";
        userPrompt = `Find ideal buyers for this item:\nTitle: ${params.title || "N/A"}\nCategory: ${params.category || "N/A"}\nCondition: ${params.condition || "N/A"}\nDescription: ${params.description || "N/A"}\nPrice: €${params.price || "N/A"}\n\nProvide:\n1. **Ideal Buyer Profiles**: 3-4 specific buyer personas who would want this item\n2. **Target Demographics**: Age, interests, lifestyle of likely buyers\n3. **Best Selling Channels**: Where to reach these buyers\n4. **Timing Strategy**: Best time/season to list this item\n5. **Cross-Sell Opportunities**: Related items buyers might also want\n6. **Marketing Angles**: Different ways to position this item\n7. **Negotiation Tips**: How to handle different buyer types`;
        break;
      }
      case "fraud-detector": {
        systemPrompt = "You are a marketplace fraud detection and authenticity verification expert. Analyze listings for red flags and provide trust assessments.";
        userPrompt = `Analyze this listing for authenticity and potential issues:\nTitle: ${params.title || "N/A"}\nCategory: ${params.category || "N/A"}\nCondition: ${params.condition || "N/A"}\nDescription: ${params.description || "N/A"}\nPrice: €${params.price || "N/A"}\nSeller info: ${params.sellerInfo || "N/A"}\n\nProvide:\n1. **Trust Score**: 0-100 rating with explanation\n2. **Red Flags**: Any concerning signals detected (or "None found")\n3. **Authenticity Assessment**: Likelihood the item is genuine\n4. **Price Fairness**: Whether the price seems legitimate for the item\n5. **Description Quality**: How detailed and honest the description appears\n6. **Safety Tips**: Recommendations for safe transaction\n7. **Verification Checklist**: Questions buyer should ask before purchasing`;
        break;
      }
    }

    const result = await callOpenAI({ system: systemPrompt, user: userPrompt, model: "gpt-4o-mini", max_completion_tokens: 1500 });

    if (credits) {
      await supabase
        .from("ai_credits")
        .update({ credits_remaining: remaining - cost, last_used_at: new Date().toISOString() })
        .eq("user_id", user.id);
    }

    await supabase.from("ai_usage_history").insert({
      user_id: user.id,
      usage_type: `bazaar_${action}`,
      credits_used: cost,
      description: `Bazaar AI: ${action}` });

    return new Response(JSON.stringify({ result, credits_used: cost, credits_remaining: remaining - cost }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("bazaar-ai error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
