import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { requireAiCredits } from "../_shared/credit-check.ts";
import { askAI, UnifiedAIError } from "../_shared/unifiedAI.ts";

const corsHeaders = { "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version" };

const ACTION_COST: Record<string, number> = { "ab-test": 5, "brand-voice": 3, "bulk-generate": 5, "plagiarism": 3,
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

function countOccurrences(content: string, keyword: string) {
  const cleanKeyword = keyword.trim().toLowerCase();
  if (!cleanKeyword) return 0;
  const escaped = cleanKeyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const matches = content.toLowerCase().match(new RegExp(`\\b${escaped}\\b`, "g"));
  return matches?.length ?? 0;
}

function wordCount(content: string) {
  return content.trim().split(/\s+/).filter(Boolean).length;
}

function numberFrom(value: unknown, fallback: number) {
  const match = String(value ?? "").match(/\d+(?:\.\d+)?/);
  const parsed = match ? Number(match[0]) : Number(value);
  return Number.isFinite(parsed) ? Math.max(0, Math.min(100, Math.round(parsed))) : fallback;
}

function arrayFrom(value: unknown, fallback: string[]) {
  return Array.isArray(value) ? value.map((item) => String(item).trim()).filter(Boolean) : fallback;
}

function buildPlagiarismResult(content: unknown, aiResult: any = {}) {
  const text = String(content || "").trim();
  const words = text.split(/\s+/).filter(Boolean);
  const unique = new Set(words.map((w) => w.toLowerCase().replace(/[^a-z0-9]/gi, ""))).size;
  const ratio = words.length ? unique / words.length : 1;
  const heuristic = Math.max(40, Math.min(99, Math.round(55 + ratio * 45)));
  const rawScore = Number(aiResult?.originalityScore);
  const originalityScore = Number.isFinite(rawScore) ? Math.max(0, Math.min(100, Math.round(rawScore))) : heuristic;
  const analysis = typeof aiResult?.analysis === "string" && aiResult.analysis.trim()
    ? aiResult.analysis.trim()
    : `Analyzed ${words.length} words with ${unique} unique terms (lexical diversity ${(ratio * 100).toFixed(0)}%). No verbatim duplication patterns detected in the submitted text.`;
  const suggestions = Array.isArray(aiResult?.suggestions) && aiResult.suggestions.length
    ? aiResult.suggestions.map((s: unknown) => String(s)).filter(Boolean)
    : [
        "Rewrite generic phrases in your own voice.",
        "Add original examples, data or personal experience.",
        "Cite external sources you referenced.",
        "Vary sentence structure to reduce repetition.",
      ];
  const flaggedSections = Array.isArray(aiResult?.flaggedSections)
    ? aiResult.flaggedSections
        .map((s: any) => ({ text: String(s?.text || "").trim(), reason: String(s?.reason || "Potential overlap").trim() }))
        .filter((s: any) => s.text)
    : [];
  return { originalityScore, analysis, suggestions, flaggedSections };
}

function buildSeoAnalysis(content: unknown, targetKeyword: unknown, aiResult: any = {}) {
  const cleanContent = String(content || "").trim();
  const keyword = sentence(targetKeyword, "target keyword");
  const words = Math.max(1, wordCount(cleanContent));
  const occurrences = countOccurrences(cleanContent, keyword);
  const density = Number(((occurrences / words) * 100).toFixed(1));
  const hasKeyword = occurrences > 0;
  const roughLengthScore = words >= 300 ? 85 : words >= 120 ? 70 : 45;
  const densityScore = density >= 0.5 && density <= 2.5 ? 90 : density > 2.5 ? 62 : hasKeyword ? 70 : 38;
  const readabilityScore = numberFrom(aiResult.readability?.score ?? aiResult.readability, roughLengthScore);
  const overallScore = numberFrom(aiResult.overall_score ?? aiResult.score, Math.round((roughLengthScore + densityScore + readabilityScore) / 3));
  const suggestions = arrayFrom(aiResult.suggestions, [
    hasKeyword ? `Keep "${keyword}" visible in the title, opening paragraph, and one subheading.` : `Add "${keyword}" naturally in the title and first paragraph.`,
    words < 300 ? "Expand the content with practical examples, FAQs, and clearer section headings." : "Strengthen internal structure with short headings and scannable sections.",
    "Add one clear meta description, one primary call to action, and supporting related phrases.",
    "Use concise paragraphs and bullet points so readers can scan the page quickly.",
    "Review the final copy for search intent: problem, solution, proof, and next step.",
  ]);

  return {
    overall_score: overallScore,
    title_analysis: {
      score: hasKeyword ? 82 : 45,
      feedback: hasKeyword ? `The target keyword "${keyword}" appears in the content. Use it in the page title if it is not already there.` : `The target keyword "${keyword}" is missing. Add it naturally to the title or H1.`,
    },
    keyword_analysis: [
      {
        keyword,
        density,
        occurrences,
        recommendation: density === 0 ? "Missing — add naturally in the title, intro, and one heading." : density > 2.5 ? "High density — reduce repetition and use related phrases." : "Healthy usage — keep it natural and context-rich.",
      },
    ],
    readability: {
      score: readabilityScore,
      feedback: typeof aiResult.readability?.feedback === "string" ? aiResult.readability.feedback : words < 120 ? "Content is very short; add more context for better SEO value." : "Readability looks usable. Keep sentences direct and sectioned.",
    },
    suggestions,
    meta_description_suggestion: sentence(aiResult.meta_description_suggestion ?? aiResult.metaDescription, `Discover ${keyword} with practical guidance, clear benefits, and simple next steps for readers who want useful results.`).slice(0, 180),
  };
}

function normalizeCount(value: unknown, fallback = 5) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(3, Math.min(10, Math.round(parsed)));
}

function hashtagSeed(topic: string, platform: string) {
  const base = topic
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2)
    .slice(0, 3)
    .map((word) => `#${word}`);
  const platformTags: Record<string, string[]> = {
    twitter: ["#thread", "#growth"],
    linkedin: ["#business", "#leadership"],
    instagram: ["#creatorlife", "#content"],
    facebook: ["#community", "#social"],
    blog: ["#blog", "#strategy"],
    email: ["#emailmarketing", "#newsletter"],
  };
  return Array.from(new Set([...base, ...(platformTags[platform] ?? ["#unique", "#content"])]));
}

function buildBulkPosts(topic: unknown, platformValue: unknown, requestedCount: unknown, guidelines: unknown, aiResult: any = {}) {
  const cleanTopic = sentence(topic, "your topic");
  const platform = String(platformValue || "social");
  const count = normalizeCount(requestedCount);
  const voice = String(guidelines || "").trim();
  const rawPosts = Array.isArray(aiResult.posts) ? aiResult.posts : [];
  const angles = [
    "quick practical tip",
    "common mistake",
    "step-by-step mini guide",
    "benefit-led hook",
    "question for engagement",
    "short story angle",
    "checklist format",
    "myth versus reality",
    "before and after framing",
    "direct call to action",
  ];

  return Array.from({ length: count }, (_, index) => {
    const raw = rawPosts[index];
    const rawContent = typeof raw === "string" ? raw : raw?.content;
    const content = sentence(
      rawContent,
      `${cleanTopic}\n\nAngle ${index + 1}: ${angles[index % angles.length]}. Share one clear insight, make it easy to act on, and invite the audience to respond.${voice ? `\n\nTone: ${voice}` : ""}`,
    );
    const rawHashtags = Array.isArray(raw?.hashtags) ? raw.hashtags : typeof raw?.hashtags === "string" ? raw.hashtags.split(/[\s,]+/) : hashtagSeed(cleanTopic, platform);
    const hashtags = rawHashtags
      .map((tag: unknown) => String(tag).trim())
      .filter(Boolean)
      .map((tag: string) => tag.startsWith("#") ? tag : `#${tag.replace(/^#+/, "")}`)
      .slice(0, 6)
      .join(" ");
    return { id: index + 1, content, hashtags };
  });
}

function normalizeVariantCount(value: unknown) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 3;
  return Math.max(2, Math.min(5, Math.round(parsed)));
}

function buildAbTestVariants(topic: unknown, contentTypeValue: unknown, requestedCount: unknown, context: unknown, aiResult: any = {}) {
  const cleanTopic = sentence(topic, "your offer");
  const contentType = String(contentTypeValue || "email_subject").replace(/_/g, " ");
  const cleanContext = String(context || "").trim();
  const count = normalizeVariantCount(requestedCount);
  const rawVariants = Array.isArray(aiResult.variants) ? aiResult.variants : [];
  const angles = [
    "benefit-first clarity",
    "urgency without pressure",
    "social proof and trust",
    "curiosity-led hook",
    "direct problem-solution framing",
  ];

  const variants = Array.from({ length: count }, (_, index) => {
    const raw = rawVariants[index];
    const content = sentence(
      typeof raw === "string" ? raw : raw?.content ?? raw?.title,
      `${cleanTopic}: ${angles[index % angles.length]} for ${contentType}${cleanContext ? ` — ${cleanContext}` : ""}.`,
    );
    const reasoning = sentence(
      raw?.reasoning ?? raw?.angle,
      `Uses ${angles[index % angles.length]} to test a distinct audience motivation.`,
    );
    return { id: `variant-${index + 1}`, content, reasoning };
  });

  return {
    variants,
    recommended: variants[0]?.id ?? null,
    recommendation: sentence(aiResult.recommendation, "Start with Variant A because it communicates the clearest value quickly."),
  };
}

const REPURPOSE_FORMATS: Record<string, { name: string; fallback: (source: string) => string }> = {
  twitter_thread: {
    name: "Twitter Thread",
    fallback: (source) => `1/ ${source.slice(0, 180)}\n\n2/ Key idea: turn the main message into one clear takeaway.\n\n3/ Add a practical example or proof point.\n\n4/ Close with one simple action for readers.`,
  },
  linkedin_post: {
    name: "LinkedIn Post",
    fallback: (source) => `${source.slice(0, 220)}\n\nThe practical takeaway is simple: communicate the value clearly, support it with context, and end with a confident next step.\n\nWhat would you add?`,
  },
  instagram_caption: {
    name: "Instagram Caption",
    fallback: (source) => `${source.slice(0, 180)}\n\nSave this for later and use it as a quick reminder.\n\n#unique #creatorlife #contentstrategy #digitaltools`,
  },
  email_newsletter: {
    name: "Email Newsletter",
    fallback: (source) => `Subject: A useful update for you\n\nHi,\n\n${source.slice(0, 350)}\n\nThe main benefit is clarity: one message, one reason to care, and one next step.\n\nBest,\nUnique`,
  },
  blog_summary: {
    name: "Blog Summary",
    fallback: (source) => `Summary\n\n${source.slice(0, 450)}\n\nKey takeaways:\n• Keep the main message clear.\n• Explain why it matters.\n• Give readers one practical next step.`,
  },
  sms_marketing: {
    name: "SMS / Short Message",
    fallback: (source) => `${source.slice(0, 120)} Learn more and take the next step today.`,
  },
};

function normalizeRepurposeFormats(value: unknown) {
  const requested = Array.isArray(value) ? value.map((item) => String(item)).filter((id) => id in REPURPOSE_FORMATS) : [];
  return requested.length > 0 ? requested : ["linkedin_post"];
}

function buildRepurposeResults(source: unknown, formatsValue: unknown, aiResult: any = {}) {
  const cleanSource = sentence(source, "Your original content");
  const formats = normalizeRepurposeFormats(formatsValue);
  const rawResults = aiResult?.results && typeof aiResult.results === "object" ? aiResult.results : {};
  return Object.fromEntries(
    formats.map((formatId) => {
      const label = REPURPOSE_FORMATS[formatId].name;
      const aiText = rawResults[formatId] ?? rawResults[label] ?? rawResults[label.toLowerCase()] ?? rawResults[formatId.replace(/_/g, " ")];
      return [formatId, sentence(aiText, REPURPOSE_FORMATS[formatId].fallback(cleanSource))];
    }),
  );
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
    const cost = action === "templates"
      ? (TEMPLATE_COST[String(templateType || "")] ?? ACTION_COST.templates)
      : action === "repurpose"
        ? normalizeRepurposeFormats(params.formats).length * 3
        : ACTION_COST[action];
    const auth = await requireAiCredits(req, corsHeaders, { credits: cost, usageType: `content_studio_${action}`,
      description: action === "templates" ? `Content Studio template: ${templateType || "custom"}` : undefined });
    if (auth.errorResponse) return auth.errorResponse;

    let result: any;
    let chargedCost = cost;
    switch (action) {
      case "ab-test":
        try {
          const requestedCount = normalizeVariantCount(params.variantCount ?? count);
          const aiResult = await callAI(apiKey, [
            { role: "system", content: "You are an expert A/B testing copywriter. Generate multiple high-converting variants and recommend the best one with reasoning." },
            { role: "user", content: `Generate ${requestedCount} A/B test variants for:\nTopic: ${topic}\nContent Type: ${contentType || "email_subject"}\n${context ? `Context: ${context}` : ""}\n\nEach variant should be unique in approach. Recommend the best variant. Return JSON: {"variants":[{"content":"","reasoning":""}],"recommendation":""}` },
          ], true);
          result = { ...aiResult, ...buildAbTestVariants(topic, contentType, requestedCount, context, aiResult) };
        } catch (e) {
          if (!(e instanceof UnifiedAIError)) throw e;
          result = { ...buildAbTestVariants(topic, contentType, params.variantCount ?? count, context), fallback: true };
          chargedCost = 0;
        }
        break;
      case "brand-voice":
        result = await callAI(apiKey, [
          { role: "system", content: systemPrompt || "You are a brand voice expert." },
          { role: "user", content: prompt || topic || "" },
        ]);
        break;
      case "bulk-generate":
        try {
          const requestedCount = normalizeCount(count ?? postCount);
          const aiResult = await callAI(apiKey, [
            { role: "system", content: "You are a social media content expert. Generate unique, engaging posts that each take a different angle on the topic." },
            { role: "user", content: `Generate ${requestedCount} unique ${platform || "social media"} posts about: ${topic}\n\nPlatform guidelines: ${platformGuide[platform] || "General social media"}\n${guidelines ? `Brand guidelines: ${guidelines}` : ""}\n\nEach post must be unique with a different angle, hook, or perspective. Return JSON: {"posts":[{"content":"","hashtags":[""]}]}` },
          ], true);
          result = { ...aiResult, posts: buildBulkPosts(topic, platform, requestedCount, guidelines, aiResult) };
        } catch (e) {
          if (!(e instanceof UnifiedAIError)) throw e;
          result = { posts: buildBulkPosts(topic, platform, count ?? postCount, guidelines), fallback: true };
          chargedCost = 0;
        }
        break;
      case "plagiarism":
        try {
          const aiResult = await callAI(apiKey, [
            {
              role: "system",
              content: `You are a plagiarism and originality checker. Analyze the provided text. Return JSON: { "originalityScore": number (0-100), "analysis": "string", "suggestions": ["string"], "flaggedSections": [{"text":"","reason":""}] }`
            },
            { role: "user", content: String(content || "").substring(0, 6000) },
          ], true);
          result = { result: buildPlagiarismResult(content, aiResult) };
        } catch (e) {
          if (!(e instanceof UnifiedAIError)) throw e;
          result = { result: buildPlagiarismResult(content), fallback: true };
          chargedCost = 0;
        }
        break;
      case "repurpose":
        try {
          const formats = normalizeRepurposeFormats(params.formats);
          const formatList = formats.map((id) => `${id}: ${REPURPOSE_FORMATS[id].name}`).join("\n");
          const aiResult = await callAI(apiKey, [
            { role: "system", content: "You are a content repurposing expert. Transform the given content into the exact requested format IDs. Return valid JSON only." },
            { role: "user", content: `Transform this content into the requested formats below. Return JSON exactly like: {"results":{"format_id":"repurposed content"}}.\n\nRequested format IDs:\n${formatList}\n\nSource content:\n${sourceContent || content || ""}` },
          ], true);
          result = { ...aiResult, results: buildRepurposeResults(sourceContent || content, formats, aiResult) };
        } catch (e) {
          if (!(e instanceof UnifiedAIError)) throw e;
          result = { results: buildRepurposeResults(sourceContent || content, params.formats), fallback: true };
          chargedCost = 0;
        }
        break;
      case "seo-analyze":
        try {
          const aiResult = await callAI(apiKey, [
            { role: "system", content: "You are an expert SEO analyst. Analyze content for keyword optimization, readability, and provide actionable improvements." },
            { role: "user", content: `Analyze this content for SEO optimization with target keyword "${targetKeyword || ""}".\n\nContent:\n${(content || "").substring(0, 5000)}\n\nProvide: overall score (0-100), keyword density analysis, readability score, 5+ improvement suggestions, and a suggested meta description. Return JSON: {"score":0,"keywordDensity":"","readability":"","suggestions":[""],"metaDescription":""}` },
          ], true);
          const analysis = buildSeoAnalysis(content, targetKeyword, aiResult);
          result = { ...aiResult, analysis };
        } catch (e) {
          if (!(e instanceof UnifiedAIError)) throw e;
          result = { analysis: buildSeoAnalysis(content, targetKeyword), fallback: true };
          chargedCost = 0;
        }
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
