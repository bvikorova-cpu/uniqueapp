import { requireAiCredits } from "../_shared/credit-check.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function callAI(apiKey: string, messages: any[]) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "gpt-4o-mini", messages }),
  });
  if (!response.ok) throw new Error(`AI error: ${response.status}`);
  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || "";
  try { return JSON.parse(content); } catch { return { result: content }; }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const __auth = await requireAiCredits(req, corsHeaders, { credits: 1, usageType: "brand_ai" });
    if (__auth.errorResponse) return __auth.errorResponse;
    const __deduct = __auth.deduct!;
    const { action, ...params } = await req.json();
    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) throw new Error("API key not configured");
    let result: any;
    switch (action) {
      case "competitor-analyzer":
        result = await callAI(apiKey, [
          {
            role: "system",
            content: `You are a brand strategy consultant. Analyze competitors and create a unique positioning strategy. Return JSON with:
- "competitors": array of 5 objects with "name", "strengths", "weaknesses", "market_position", "estimated_market_share"
- "positioning": object with "unique_value_proposition", "differentiators" (array of 5), "target_niche", "pricing_strategy", "brand_personality", "competitive_advantages" (array of 3), "market_gaps" (array of 3)`
          },
          {
            role: "user",
            content: `Analyze the competitive landscape for "${params.businessName}" in the ${params.industry} industry. Business description: ${params.description || 'Not provided'}. Identify top competitors and create a unique positioning strategy.`
          }
        ]);
        break;
      case "name-generator":
        result = await callAI(apiKey, [
          {
            role: "system",
            content: "You are a world-class brand naming expert. Generate creative, memorable, and unique brand names. Return JSON with a 'names' array of objects with 'name', 'meaning', 'domain_suggestion', and 'tagline' fields. Generate exactly 10 names."
          },
          {
            role: "user",
            content: `Generate brand names for a ${params.industry} business. Style: ${params.style}. Keywords/values: ${params.keywords || 'modern, professional'}. Names should be catchy, easy to pronounce, and available as domain names.`
          }
        ]);
        break;
      case "social-media-kit":
        result = await callAI(apiKey, [
          {
            role: "system",
            content: `You are a social media branding expert. Generate complete social media kits for brands. Return JSON with "platforms" object containing keys for "instagram", "twitter", "linkedin", "tiktok", "facebook". Each platform object should have: "bio" (max 160 chars), "handle_suggestions" (array of 3), "content_pillars" (array of 4), "hashtags" (array of 10), "posting_schedule" (string), "content_ideas" (array of 5), "tone_guidelines" (string).`
          },
          {
            role: "user",
            content: `Generate a complete social media kit for "${params.brandName}" in the ${params.industry} industry. Brand tone: ${params.tone || 'professional and modern'}. Target audience: ${params.targetAudience || 'general'}.`
          }
        ]);
        break;
      default: throw new Error(`Unknown action: ${action}`);
    }
    await __deduct().catch((e) => console.error("deduct failed:", e));
    return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});