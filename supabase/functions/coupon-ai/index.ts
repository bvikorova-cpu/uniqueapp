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
    if (!authHeader) throw new Error("Not authenticated");

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) throw new Error("Invalid token");

    const { action, ...params } = await req.json();
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OpenAI API key not configured");

    const creditCosts: Record<string, number> = {
      "coupon-valuator": 3,
      "fraud-scanner": 4,
      "deal-matcher": 3,
      "listing-writer": 3,
    };

    const cost = creditCosts[action];
    if (!cost) throw new Error(`Unknown action: ${action}`);

    const { data: credits } = await supabase.from("ai_credits").select("*").eq("user_id", user.id).maybeSingle();
    const remaining = credits?.credits_remaining ?? 0;
    if (remaining < cost) {
      return new Response(JSON.stringify({ error: "Insufficient credits", credits_remaining: remaining, credits_needed: cost }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let systemPrompt = "";
    let userPrompt = "";

    switch (action) {
      case "coupon-valuator": {
        systemPrompt = "You are an expert coupon and gift card valuation specialist. Analyze coupons for fair market value and risk assessment.";
        userPrompt = `Analyze this coupon/gift card for fair market value:
Store: ${params.storeName || "N/A"}
Coupon Type: ${params.couponType || "N/A"}
Original Value: €${params.originalValue || "N/A"}
Current Asking Price: €${params.askingPrice || "Not set"}
Expiry Date: ${params.expiryDate || "No expiry"}
Description: ${params.description || "N/A"}

Provide:
1. **Fair Market Value**: Recommended selling price range (€)
2. **Value Assessment**: How the asking price compares to market
3. **Expiry Risk Score**: 1-10 (10 = high risk of expiring unused)
4. **Demand Level**: High/Medium/Low for this store/type
5. **Quick Sale Price**: Price for immediate sale
6. **Premium Price**: Maximum achievable with patience
7. **Risk Factors**: Expiry, store reputation, restrictions
8. **Recommendation**: Hold, sell now, or reduce price`;
        break;
      }

      case "fraud-scanner": {
        systemPrompt = "You are a coupon fraud detection expert. Analyze listings for red flags, fake codes, and scam patterns.";
        userPrompt = `Scan this coupon listing for fraud indicators:
Title: ${params.title || "N/A"}
Store: ${params.storeName || "N/A"}
Type: ${params.couponType || "N/A"}
Original Value: €${params.originalValue || "N/A"}
Selling Price: €${params.sellingPrice || "N/A"}
Discount: ${params.discount || "N/A"}%
Expiry: ${params.expiryDate || "N/A"}
Description: ${params.description || "N/A"}
Seller Info: ${params.sellerInfo || "N/A"}

Provide:
1. **Trust Score**: 0-100 with explanation
2. **Red Flags Detected**: List any concerning signals
3. **Authenticity Rating**: Likely genuine / Suspicious / High risk
4. **Price Analysis**: Is the discount realistic for this store?
5. **Common Scam Patterns**: Does this match known fraud patterns?
6. **Verification Steps**: What buyer should check before purchasing
7. **Safety Recommendation**: Safe to buy / Proceed with caution / Avoid`;
        break;
      }

      case "deal-matcher": {
        systemPrompt = "You are a personal shopping deal advisor. Match users with the best coupon deals based on their preferences.";
        userPrompt = `Find the best coupon deals for this shopper:
Favorite Stores: ${params.favoriteStores || "N/A"}
Shopping Categories: ${params.categories || "N/A"}
Budget: €${params.budget || "N/A"}
Preferred Discount: ${params.minDiscount || "Any"}% or more
Shopping Frequency: ${params.frequency || "N/A"}
Specific Items Looking For: ${params.lookingFor || "N/A"}

Provide:
1. **Top Deal Recommendations**: 5 specific types of coupons to look for
2. **Best Value Categories**: Which categories offer biggest savings
3. **Timing Tips**: Best times to buy coupons (seasonal, end of month, etc.)
4. **Store Rankings**: Which stores' coupons hold value best
5. **Bundle Strategy**: How to combine multiple coupons for max savings
6. **Savings Estimate**: Potential monthly savings with smart coupon buying
7. **Alert Criteria**: What deals to watch for based on preferences`;
        break;
      }

      case "listing-writer": {
        systemPrompt = "You are a marketplace copywriting expert specializing in coupon and gift card listings. Write compelling, trust-building descriptions.";
        userPrompt = `Write a compelling listing for this coupon:
Store: ${params.storeName || "N/A"}
Type: ${params.couponType || "N/A"}
Original Value: €${params.originalValue || "N/A"}
Selling Price: €${params.sellingPrice || "N/A"}
Expiry: ${params.expiryDate || "No expiry"}
Details: ${params.details || "N/A"}
Terms: ${params.terms || "N/A"}

Provide:
1. **Optimized Title**: Attention-grabbing, keyword-rich title (max 80 chars)
2. **Compelling Description**: 3-4 paragraph description highlighting value
3. **Key Selling Points**: 5 bullet points for why this is a great deal
4. **Trust Signals**: Elements to build buyer confidence
5. **Urgency Triggers**: Time-sensitive language
6. **SEO Tags**: 5-8 search keywords
7. **Price Justification**: Why this price is a great deal`;
        break;
      }
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
        max_tokens: 1500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) throw new Error("AI processing failed");
    const aiData = await response.json();
    const result = aiData.choices?.[0]?.message?.content || "No result generated";

    if (credits) {
      await supabase.from("ai_credits").update({ credits_remaining: remaining - cost, last_used_at: new Date().toISOString() }).eq("user_id", user.id);
    }
    await supabase.from("ai_usage_history").insert({ user_id: user.id, usage_type: `coupon_${action}`, credits_used: cost, description: `Coupon AI: ${action}` });

    return new Response(JSON.stringify({ result, credits_used: cost, credits_remaining: remaining - cost }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("coupon-ai error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: error.message.includes("Insufficient") ? 402 : 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
