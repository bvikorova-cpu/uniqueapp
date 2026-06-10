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
      "expiry-alert": 3,
      "bundle-builder": 4,
      "store-reputation": 3,
      "price-history": 3,
      "negotiation-bot": 4,
      "wishlist-alerts": 3,
      "stacking-calc": 3,
      "receipt-cashback": 5,
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

    // ============ Specialized actions with custom response shapes ============
    if (action === "stacking-calc") {
      const { coupon_ids, cart_total } = params;
      if (!Array.isArray(coupon_ids) || coupon_ids.length === 0) {
        return new Response(JSON.stringify({ error: "coupon_ids required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const { data: coupons } = await supabase.rpc("coupon_stacking_check", { _ids: coupon_ids });
      const prompt = `You are a coupon stacking expert. Given these coupons: ${JSON.stringify(coupons)} and cart total ${cart_total ?? "unknown"} EUR, compute final price, identify conflicts (e.g. only one % discount allowed per order, gift cards stack with codes, BOGO can't combine with %), and return JSON: { final_price, total_savings, order: [coupon_id...], warnings: [string] }. Use EUR.`;
      const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${OPENAI_API_KEY}` },
        body: JSON.stringify({ model: "gpt-4o", messages: [{ role: "user", content: prompt }], response_format: { type: "json_object" } }),
      });
      if (aiRes.status === 429) return new Response(JSON.stringify({ error: "rate_limited" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (aiRes.status === 401 || aiRes.status === 402) return new Response(JSON.stringify({ error: "ai_credits_exhausted" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const j = await aiRes.json();
      const content = j.choices?.[0]?.message?.content ?? "{}";
      let parsed: any = {};
      try { parsed = JSON.parse(content); } catch { parsed = { raw: content }; }
      await supabase.from("ai_credits").update({ credits_remaining: remaining - cost, last_used_at: new Date().toISOString() }).eq("user_id", user.id);
      await supabase.from("ai_usage_history").insert({ user_id: user.id, usage_type: `coupon_${action}`, credits_used: cost, description: `Coupon AI: ${action}` });
      return new Response(JSON.stringify({ result: parsed, coupons }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "receipt-cashback") {
      const { receipt_url, coupon_id } = params;
      if (!receipt_url) return new Response(JSON.stringify({ error: "receipt_url required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${OPENAI_API_KEY}` },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [{ role: "user", content: [
            { type: "text", text: "Extract from this receipt: store_name, total_amount (EUR), date, item_count. Return JSON only." },
            { type: "image_url", image_url: { url: receipt_url } },
          ] }],
          response_format: { type: "json_object" },
        }),
      });
      if (aiRes.status === 429) return new Response(JSON.stringify({ error: "rate_limited" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (aiRes.status === 401 || aiRes.status === 402) return new Response(JSON.stringify({ error: "ai_credits_exhausted" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const j = await aiRes.json();
      let extracted: any = {};
      try { extracted = JSON.parse(j.choices?.[0]?.message?.content ?? "{}"); } catch {}
      const total = Number(extracted.total_amount ?? 0);
      const rate = 0.02;
      const cashback = +(total * rate).toFixed(2);
      const { data: row, error } = await supabase.from("coupon_cashback_ledger").insert({
        user_id: user.id,
        coupon_id: coupon_id ?? null,
        receipt_url,
        store_name: extracted.store_name ?? null,
        receipt_total: total,
        cashback_amount: cashback,
        cashback_rate: rate,
        status: "pending",
        ai_extracted: extracted,
      }).select().single();
      if (error) throw error;
      await supabase.from("ai_credits").update({ credits_remaining: remaining - cost, last_used_at: new Date().toISOString() }).eq("user_id", user.id);
      await supabase.from("ai_usage_history").insert({ user_id: user.id, usage_type: `coupon_${action}`, credits_used: cost, description: `Coupon AI: ${action}` });
      return new Response(JSON.stringify({ row, extracted, cashback }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
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

      case "expiry-alert": {
        systemPrompt = "You are a coupon expiry management expert. Analyze coupon portfolios, prioritize usage by expiry urgency, and recommend optimal redemption strategies.";
        userPrompt = `Analyze these coupons for expiry risk and usage strategy:

Coupons Portfolio:
${params.coupons || "N/A"}

Alert Window: ${params.notifyDays || "7"} days before expiry
Shopping Habits: ${params.shoppingHabits || "Not specified"}

Provide:
1. **Expiry Priority List**: Rank all coupons by urgency (most urgent first)
2. **Critical Alerts**: Coupons expiring within the alert window - IMMEDIATE ACTION NEEDED
3. **Usage Schedule**: Day-by-day plan for using expiring coupons optimally
4. **Value at Risk**: Total € value that could be lost if coupons expire unused
5. **Quick-Use Suggestions**: What to buy with each expiring coupon
6. **Sell vs Use Decision**: For each coupon - is it better to sell now or use?
7. **Stacking Opportunities**: Can any coupons be combined before they expire?
8. **Long-term Strategy**: How to avoid future expiry losses`;
        break;
      }

      case "bundle-builder": {
        systemPrompt = "You are a coupon bundling strategist. Create optimized coupon bundles that maximize savings and appeal to buyers.";
        userPrompt = `Create an optimized coupon bundle strategy:

Available Coupons:
${params.availableCoupons || "N/A"}

Budget: €${params.budget || "Flexible"}
Target Category: ${params.targetCategory || "Any"}
Occasion: ${params.occasion || "General shopping"}

Provide:
1. **Bundle Recommendations**: 3 different bundle packages with names and themes
2. **Bundle Pricing**: Optimal price for each bundle (individual vs bundle savings)
3. **Bundle Savings**: How much buyers save compared to buying individually
4. **Cross-Sell Opportunities**: Which coupons complement each other
5. **Bundle Descriptions**: Marketing copy for each bundle
6. **Target Audience**: Who would buy each bundle
7. **Seasonal Timing**: Best time to list each bundle
8. **Upsell Strategy**: How to encourage buyers to upgrade bundles`;
        break;
      }

      case "store-reputation": {
        systemPrompt = "You are a retail store reputation analyst. Evaluate stores based on their coupon policies, reliability, customer satisfaction, and overall trustworthiness for coupon trading.";
        userPrompt = `Analyze the reputation and trustworthiness of this store for coupon trading:

Store Name: ${params.storeName || "N/A"}
Store Website: ${params.storeUrl || "N/A"}
Coupon Types: ${params.couponTypes || "N/A"}
Additional Info: ${params.additionalInfo || "N/A"}

Provide:
1. **Reputation Score**: 0-100 with detailed breakdown
2. **Coupon Policy Analysis**: How this store handles coupons, gift cards, returns
3. **Reliability Rating**: How often their coupons work as expected
4. **Fraud Risk Level**: How commonly faked are this store's coupons?
5. **Value Retention**: Do this store's coupons hold value well over time?
6. **Redemption Ease**: How easy is it to use coupons at this store?
7. **Customer Feedback Summary**: What buyers typically report
8. **Trading Recommendation**: Is it safe to buy/sell this store's coupons?
9. **Red Flags to Watch**: Specific warnings for this store
10. **Competitor Comparison**: How this store compares to similar retailers`;
        break;
      }

      case "price-history": {
        systemPrompt = "You are a coupon market analyst specializing in price trends, seasonal patterns, and optimal buy/sell timing for coupons and gift cards.";
        userPrompt = `Analyze price trends and market history for:

Store: ${params.storeName || "N/A"}
Coupon Type: ${params.couponType || "N/A"}
Face Value: €${params.originalValue || "N/A"}
Analysis Timeframe: ${params.timeframe || "3 months"}

Provide:
1. **Price Trend Summary**: Overall direction (rising, falling, stable)
2. **Average Resale Value**: What these coupons typically sell for (% of face value)
3. **Seasonal Patterns**: When prices are highest and lowest throughout the year
4. **Best Time to Buy**: Optimal months/events to purchase at lowest prices
5. **Best Time to Sell**: When demand peaks and prices are highest
6. **Price Range**: Min, max, and average selling prices over the timeframe
7. **Supply & Demand Analysis**: Market saturation and availability trends
8. **Price Prediction**: Expected price movement in the next 30-90 days
9. **Investment Grade**: Is this coupon worth buying to resell later?
10. **Actionable Advice**: Specific buy/sell/hold recommendation with timing`;
        break;
      }

      case "negotiation-bot": {
        systemPrompt = "You are an expert negotiation strategist for coupon and gift card marketplace transactions. Provide practical, psychology-backed negotiation scripts and strategies.";
        userPrompt = `Create a negotiation strategy for this coupon deal:

Coupon/Deal: ${params.couponTitle || "N/A"}
My Role: ${params.role || "buyer"}
Current Asking Price: €${params.askingPrice || "N/A"}
My Target Price: €${params.targetPrice || "N/A"}
Context: ${params.context || "Standard marketplace negotiation"}

Provide:
1. **Opening Message Script**: Exact message to send (professional, friendly)
2. **Counter-Offer Strategy**: Step-by-step responses for different scenarios
3. **Psychology Tactics**: Anchoring, reciprocity, scarcity, social proof
4. **Walk-Away Price**: Absolute maximum/minimum you should accept
5. **Concession Ladder**: What to concede and when, in what order
6. **Objection Handling**: Responses to common pushbacks
7. **Closing Techniques**: How to seal the deal once price is agreed
8. **Timing Strategy**: When to message, how long to wait between responses
9. **Red Lines**: What to never agree to in a coupon deal
10. **Alternative Scripts**: 3 different approach styles (friendly, direct, value-focused)`;
        break;
      }

      case "wishlist-alerts": {
        systemPrompt = "You are a smart shopping assistant specializing in coupon deal tracking, wishlist management, and price drop alert strategies.";
        userPrompt = `Create a wishlist and price drop alert strategy:

Stores to Watch:
${params.wishlistStores || "N/A"}

Max Budget per Coupon: €${params.maxBudget || "Flexible"}
Minimum Discount Required: ${params.minDiscount || "20"}%
Shopping Preferences: ${params.preferences || "General"}

Provide:
1. **Wishlist Priority Matrix**: Rank stores by deal frequency and value
2. **Optimal Alert Thresholds**: Best price points to set alerts for each store
3. **Deal Frequency Analysis**: How often good deals appear for each store
4. **Price Drop Patterns**: When each store's coupons typically drop in price
5. **Hidden Gem Opportunities**: Less obvious deals most shoppers miss
6. **Bundle Alert Strategy**: When multiple wishlist items become available together
7. **Competition Analysis**: How many other buyers are watching the same deals
8. **Smart Budget Allocation**: How to split budget across wishlist stores
9. **Quick-Buy Decision Framework**: When to buy instantly vs wait for better deal
10. **Savings Projection**: Estimated savings over 3-6 months following this strategy`;
        break;
      }
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
        max_completion_tokens: 1500,
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
