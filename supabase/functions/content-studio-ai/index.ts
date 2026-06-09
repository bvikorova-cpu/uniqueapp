import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { requireAiCredits } from "../_shared/credit-check.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ACTION_COST: Record<string, number> = {
  "ab-test": 4, "brand-voice": 3, "bulk-generate": 5, "plagiarism": 3,
  "repurpose": 4, "seo-analyze": 4, "templates": 3,
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

const platformGuide: Record<string, string> = {
  instagram: "Visual-first, 2200 char limit, hashtag-driven",
  twitter: "280 char limit, conversational, thread-friendly",
  linkedin: "Professional tone, 3000 char limit, B2B focused",
  tiktok: "Casual, trendy, hook-driven, 150 char description",
  facebook: "Conversational, sharable, 63k char limit",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { action, topic, content, context, details, prompt, sourceContent, targetKeyword, count, contentType, platform, postCount, guidelines, systemPrompt, ...params } = await req.json();
    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) throw new Error("API key not configured");

    if (!action || !(action in ACTION_COST)) {
      return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const cost = ACTION_COST[action];
    const auth = await requireAiCredits(req, corsHeaders, { credits: cost, usageType: `content_studio_${action}` });
    if (auth.errorResponse) return auth.errorResponse;

    let result: any;
    switch (action) {
      case "ab-test":
        result = await callAI(apiKey, [
          { role: "system", content: "You are an expert A/B testing copywriter. Generate multiple high-converting variants and recommend the best one with reasoning." },
          { role: "user", content: `Generate ${count || 3} A/B test variants for:\nTopic: ${topic}\nContent Type: ${contentType || "email_subject"}\n${context ? `Context: ${context}` : ""}\n\nEach variant should be unique in approach. Recommend the best variant.` },
        ]);
        break;
      case "brand-voice":
        result = await callAI(apiKey, [
          { role: "system", content: systemPrompt || "You are a brand voice expert." },
          { role: "user", content: prompt || topic || "" },
        ]);
        break;
      case "bulk-generate":
        result = await callAI(apiKey, [
          { role: "system", content: "You are a social media content expert. Generate unique, engaging posts that each take a different angle on the topic." },
          { role: "user", content: `Generate ${postCount || 5} unique ${platform || "social media"} posts about: ${topic}\n\nPlatform guidelines: ${platformGuide[platform] || "General social media"}\n${guidelines ? `Brand guidelines: ${guidelines}` : ""}\n\nEach post must be unique with a different angle, hook, or perspective.` },
        ]);
        break;
      case "plagiarism":
        result = await callAI(apiKey, [
          {
            role: "system",
            content: `You are a plagiarism and originality checker. Analyze the provided text. Return JSON: { "originalityScore": number (0-100), "analysis": "string", "suggestions": ["string"] }`
          },
          { role: "user", content: content || "" },
        ]);
        break;
      case "repurpose":
        result = await callAI(apiKey, [
          { role: "system", content: "You are a content repurposing expert. Transform the given content into the requested formats. Return valid JSON only." },
          { role: "user", content: `Transform this content into multiple formats. Return a JSON object with format names as keys and repurposed content as string values.\n\nSource content:\n${sourceContent || content || ""}` },
        ]);
        break;
      case "seo-analyze":
        result = await callAI(apiKey, [
          { role: "system", content: "You are an expert SEO analyst. Analyze content for keyword optimization, readability, and provide actionable improvements." },
          { role: "user", content: `Analyze this content for SEO optimization with target keyword "${targetKeyword || ""}".\n\nContent:\n${(content || "").substring(0, 5000)}\n\nProvide: overall score (0-100), keyword density analysis, readability score, 5+ improvement suggestions, and a suggested meta description.` },
        ]);
        break;
      case "templates":
        result = await callAI(apiKey, [
          { role: "system", content: systemPrompt || "You are a content creation expert." },
          { role: "user", content: `Topic: ${topic}\n\nAdditional details: ${details || "None provided"}` },
        ]);
        break;
      default: throw new Error(`Unknown action: ${action}`);
    }
    return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
