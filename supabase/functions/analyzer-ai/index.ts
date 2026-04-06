import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const OPENAI_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_KEY) throw new Error("OPENAI_API_KEY not set");

    const { action, ...params } = await req.json();

    let systemPrompt = "";
    let userPrompt = "";

    switch (action) {
      case "comparison":
        systemPrompt = "You are an expert AI image comparison analyst. Compare two items/images in detail. Provide: similarity score (0-100), key differences, key similarities, quality comparison, value comparison, and recommendation. Use markdown with headers and bullet points.";
        userPrompt = `Compare these two items:\nItem 1: ${params.item1}\nItem 2: ${params.item2}\n\nProvide a comprehensive comparison analysis.`;
        break;

      case "price-estimator":
        systemPrompt = "You are an expert appraiser and market analyst. Estimate the value of items based on descriptions/images. Provide: estimated price range (min-max), market analysis, condition assessment, factors affecting value, where to sell, and price trend prediction. Use markdown.";
        userPrompt = `Estimate the price/value of: ${params.description}\nCategory: ${params.category || 'general'}\nCondition: ${params.condition || 'unknown'}\n\nProvide detailed price estimation with market context.`;
        break;

      case "health-scanner":
        systemPrompt = "You are an AI health analysis assistant (NOT a doctor). Analyze descriptions of skin conditions, food items, plants for potential health impacts. Always include a disclaimer that this is NOT medical advice. Provide: initial assessment, potential concerns, recommended actions, when to see a doctor, preventive measures. Use markdown.";
        userPrompt = `Analyze this for health-related insights: ${params.description}\nType: ${params.scanType || 'general'}\n\nProvide health-related analysis with appropriate disclaimers.`;
        break;

      case "document-scanner":
        systemPrompt = "You are an expert document analysis AI. Extract, translate, summarize, and analyze text from document descriptions. Provide: extracted text, language detection, translation (if needed), summary, key entities, document type classification, and actionable insights. Use markdown.";
        userPrompt = `Analyze this document/text: ${params.text}\nRequested action: ${params.scanAction || 'full-analysis'}\nTarget language: ${params.targetLanguage || 'English'}\n\nProvide comprehensive document analysis.`;
        break;

      case "batch-analyze":
        systemPrompt = "You are a batch image analysis AI. Analyze multiple items described together. For each item provide: identification, category, confidence, key details. Return a structured comparison table and summary. Use markdown.";
        userPrompt = `Batch analyze these items:\n${params.items}\n\nProvide analysis for each item and an overall summary.`;
        break;

      case "smart-search":
        systemPrompt = "You are an AI visual search expert. Based on item descriptions, find similar items, alternatives, and shopping recommendations. Provide: item identification, similar products with estimated prices, where to buy, alternatives at different price points, and style matching suggestions. Use markdown.";
        userPrompt = `Find similar items and shopping recommendations for: ${params.query}\nBudget: ${params.budget || 'any'}\nPreferences: ${params.preferences || 'none'}\n\nProvide comprehensive shopping recommendations.`;
        break;

      default:
        return new Response(JSON.stringify({ error: "Unknown action" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 2000,
      }),
    });

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content || "No result";

    return new Response(JSON.stringify({ result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("analyzer-ai error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
