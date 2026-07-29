import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { requireAiCredits } from "../_shared/credit-check.ts";
import { askAI, UnifiedAIError } from "../_shared/unifiedAI.ts";

const corsHeaders = { "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version" };

const ACTION_COST: Record<string, number> = { "ab-test": 4, "brand-voice": 3, "bulk-generate": 5, "plagiarism": 3,
  "repurpose": 4, "seo-analyze": 4, "templates": 3 };

const TEMPLATE_COST: Record<string, number> = { email_marketing: 3,
  facebook_ad: 2,
  linkedin_post: 2,
  twitter_thread: 3,
  instagram_caption: 1,
  press_release: 5,
  product_description: 2,
  pitch_deck: 5,
  newsletter: 3,
  chatbot_script: 3 };

function sentence(value: unknown, fallback: string) {
  const text = String(value || "").trim();
  return text || fallback;
}

function buildTemplateFallback(templateType: string, topic: unknown, details: unknown) {
  const cleanTopic = sentence(topic, "your offer");
  const cleanDetails = sentence(details, "a broad audience looking for a clear, trustworthy reason to act");
  const type = String(templateType || "content_template");

  switch (type) {
    case "facebook_ad":
      return `Headline: ${cleanTopic}\n\nPrimary text:\nReady to make ${cleanTopic} easier, faster, and more valuable? Discover a practical solution built for ${cleanDetails}.\n\nWhy it works:\n• Clear benefit from the first line\n• Simple reason to trust the offer\n• Direct call to action\n\nCall to action: Learn more today.`;
    case "instagram_caption":
      return `${cleanTopic}\n\nMake it simple. Make it useful. Make it worth saving.\n\n${cleanDetails}\n\nWhat would you try first?\n\n#unique #creatorlife #digitaltools #growth #content`;
    case "twitter_thread":
      return `1/ ${cleanTopic}: here is the simple version.\n\n2/ Start with the audience problem: ${cleanDetails}.\n\n3/ Show the practical benefit in one sentence.\n\n4/ Add proof, a clear example, or a quick result.\n\n5/ End with one action: try it, save it, or share it.`;
    case "linkedin_post":
      return `${cleanTopic}\n\nMost people do not need more noise. They need a clear next step.\n\nFor ${cleanDetails}, the winning approach is simple:\n\n• Name the problem\n• Explain the value\n• Show the outcome\n• Invite action\n\nClarity builds trust before any sale happens.`;
    case "email_marketing":
      return `Subject: A simpler way to approach ${cleanTopic}\n\nHi,\n\nIf ${cleanTopic} matters to you, this is designed to help.\n\nThe focus is simple: ${cleanDetails}.\n\nYou get a clearer path, less friction, and a reason to take action now.\n\nReady to see it?\n\nBest,\nUnique`;
    case "press_release":
      return `FOR IMMEDIATE RELEASE\n\nUnique Announces ${cleanTopic}\n\nUnique today announced ${cleanTopic}, created for ${cleanDetails}.\n\nThe launch focuses on practical value, clear user benefits, and a smoother digital experience.\n\n“People want tools that feel useful immediately,” said the Unique team. “This update is built around that expectation.”\n\nAvailability begins now through Unique.`;
    case "product_description":
      return `${cleanTopic}\n\nA practical solution for ${cleanDetails}. Built to be easy to understand, quick to use, and valuable from the first interaction.\n\nKey benefits:\n• Clear purpose\n• Smooth experience\n• Useful results\n• Designed for everyday use`;
    case "pitch_deck":
      return `Slide 1: ${cleanTopic}\nThe opportunity and why now.\n\nSlide 2: Problem\n${cleanDetails}.\n\nSlide 3: Solution\nA focused, easy-to-use experience with clear value.\n\nSlide 4: Market\nUsers want faster, simpler digital tools.\n\nSlide 5: Ask\nSupport growth, adoption, and product expansion.`;
    case "newsletter":
      return `This week: ${cleanTopic}\n\nMain update\n${cleanDetails}.\n\nWhy it matters\nIt helps users move faster, understand the value clearly, and take action with confidence.\n\nTry this\nPick one goal, use the simplest version first, then improve from there.`;
    case "chatbot_script":
      return `Bot: Hi! I can help with ${cleanTopic}.\n\nUser: What can I do here?\n\nBot: You can get a quick answer, understand the next step, or choose the option that fits you best.\n\nUser: Who is it for?\n\nBot: It is ideal for ${cleanDetails}.\n\nBot: Would you like to start now?`;
    default:
      return `${cleanTopic}\n\nAudience/context: ${cleanDetails}\n\nCore message:\nA clear, useful offer with an immediate benefit and a simple next step.\n\nCall to action:\nStart now.`;
  }
}

async function callAI(_apiKey: string | undefined, messages: any[], json = false) {
  const system = messages.filter((m) => m.role === "system").map((m) => m.content).join("\n\n");
  const user = messages.filter((m) => m.role !== "system").map((m) => m.content).join("\n\n");
  const content = await askAI(system, user, { model: "gpt-4o-mini", ...(json ? { json: true } : {}) });
  const cleaned = content.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  let parsed: any = null;
  if (json) { try { parsed = JSON.parse(cleaned); } catch { parsed = null; } }
  // Always expose the raw text as `content`/`result` so every client shape works.
  return { ...(parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {}),
    content: cleaned, result: cleaned };
}

const platformGuide: Record<string, string> = { instagram: "Visual-first, 2200 char limit, hashtag-driven",
  twitter: "280 char limit, conversational, thread-friendly",
  linkedin: "Professional tone, 3000 char limit, B2B focused",
  tiktok: "Casual, trendy, hook-driven, 150 char description",
  facebook: "Conversational, sharable, 63k char limit" };

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { action, templateType, topic, content, context, details, prompt, sourceContent, targetKeyword, count, contentType, platform, postCount, guidelines, systemPrompt, ...params } = await req.json();
    const apiKey = Deno.env.get("OPENAI_API_KEY");

    if (!action || !(action in ACTION_COST)) {
      return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const cost = action === "templates" ? (TEMPLATE_COST[String(templateType || "")] ?? ACTION_COST.templates) : ACTION_COST[action];
    const auth = await requireAiCredits(req, corsHeaders, { credits: cost, usageType: `content_studio_${action}`,
      description: action === "templates" ? `Content Studio template: ${templateType || "custom"}` : undefined });
    if (auth.errorResponse) return auth.errorResponse;

    let result: any;
    let chargedCost = cost;
    switch (action) {
      case "ab-test":
        result = await callAI(apiKey, [
          { role: "system", content: "You are an expert A/B testing copywriter. Generate multiple high-converting variants and recommend the best one with reasoning." },
          { role: "user", content: `Generate ${count || 3} A/B test variants for:\nTopic: ${topic}\nContent Type: ${contentType || "email_subject"}\n${context ? `Context: ${context}` : ""}\n\nEach variant should be unique in approach. Recommend the best variant. Return JSON: {"variants":[{"title":"","content":"","angle":""}],"recommendation":""}` },
        ], true);
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
          { role: "user", content: `Generate ${postCount || 5} unique ${platform || "social media"} posts about: ${topic}\n\nPlatform guidelines: ${platformGuide[platform] || "General social media"}\n${guidelines ? `Brand guidelines: ${guidelines}` : ""}\n\nEach post must be unique with a different angle, hook, or perspective. Return JSON: {"posts":[{"content":"","hashtags":[""]}]}` },
        ], true);
        break;
      case "plagiarism":
        result = await callAI(apiKey, [
          {
            role: "system",
            content: `You are a plagiarism and originality checker. Analyze the provided text. Return JSON: { "originalityScore": number (0-100), "analysis": "string", "suggestions": ["string"] }`
          },
          { role: "user", content: content || "" },
        ], true);
        break;
      case "repurpose":
        result = await callAI(apiKey, [
          { role: "system", content: "You are a content repurposing expert. Transform the given content into the requested formats. Return valid JSON only." },
          { role: "user", content: `Transform this content into multiple formats. Return JSON: {"results":{"<format name>":"<repurposed content>"}}.\n\nSource content:\n${sourceContent || content || ""}` },
        ], true);
        break;
      case "seo-analyze":
        result = await callAI(apiKey, [
          { role: "system", content: "You are an expert SEO analyst. Analyze content for keyword optimization, readability, and provide actionable improvements." },
          { role: "user", content: `Analyze this content for SEO optimization with target keyword "${targetKeyword || ""}".\n\nContent:\n${(content || "").substring(0, 5000)}\n\nProvide: overall score (0-100), keyword density analysis, readability score, 5+ improvement suggestions, and a suggested meta description. Return JSON: {"score":0,"keywordDensity":"","readability":"","suggestions":[""],"metaDescription":""}` },
        ], true);
        break;
      case "templates":
        try {
          result = await callAI(apiKey, [
            { role: "system", content: systemPrompt || "You are a content creation expert." },
            { role: "user", content: `Topic: ${topic}\n\nAdditional details: ${details || "None provided"}` },
          ]);
        } catch (e) {
          if (!(e instanceof UnifiedAIError)) throw e;
          const fallback = buildTemplateFallback(String(templateType || ""), topic, details);
          result = { content: fallback, result: fallback, fallback: true };
          chargedCost = 0;
        }
        break;
      default: throw new Error(`Unknown action: ${action}`);
    }
    if (chargedCost > 0) {
      try { await auth.deduct!(); } catch (e) { console.error("[content-studio-ai] deduct-failed", e); }
    }
    return new Response(JSON.stringify({ ...result, creditsCharged: chargedCost, creditsUsed: chargedCost }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e: any) {
    const status = e instanceof UnifiedAIError ? (e.status === 402 ? 402 : e.status === 429 ? 429 : 500) : 500;
    console.error("[content-studio-ai] failed", e?.message);
    return new Response(JSON.stringify({ error: e?.message || "AI request failed" }), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
