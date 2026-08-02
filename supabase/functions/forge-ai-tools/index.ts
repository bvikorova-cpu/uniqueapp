// Universal CreativeForge AI tools: brainstorm, quick edits, SEO, plagiarism,
// translate, score. 6 credits per action (revision is 3).
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { callCreativeAI, getUnifiedAiCreditBalance, isInsufficientCreditsError, spendUnifiedAiCredits } from "../_shared/creativeAI.ts";

const corsHeaders = { "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type" };

const CREDIT_COST = 6;
const COST_OVERRIDES: Record<string, number> = {
  cowriter: 2,
  fashion_ootd: 5,
  fashion_celebrity_clone: 15,
  fashion_body_shape: 8,
  fashion_sustainable: 6,
};
const MODEL = "gpt-4o-mini";

type Action =
  | "brainstorm"
  | "describe"
  | "expand"
  | "rewrite"
  | "shorten"
  | "seo_optimize"
  | "plagiarism_check"
  | "translate"
  | "score_content"
  | "cowriter"
  | "fashion_ootd"
  | "fashion_celebrity_clone"
  | "fashion_body_shape"
  | "fashion_sustainable";

const SYSTEM_PROMPTS: Record<Action, string> = {
  brainstorm:
    "You are an elite brainstorming partner. Produce exactly 10 distinct, high-quality variations. Return a numbered list 1.–10. with one idea per line. No preamble.",
  describe:
    "You are a sensory prose stylist. Rewrite the selected passage with vivid sensory detail (sight, sound, smell, touch, taste). Keep the original meaning and length within +30%. Return only the rewritten passage.",
  expand:
    "You are a Sudowrite-style continuation engine. Continue the passage seamlessly in the same voice, tense and POV for ~2 paragraphs. Return only the new continuation, no preamble.",
  rewrite:
    "You are a master editor. Rewrite the passage to improve clarity, rhythm, and impact while preserving meaning and tone. Return only the rewritten passage.",
  shorten:
    "You are a ruthless editor. Cut the passage to roughly 50% length while preserving meaning, voice and key beats. Return only the shortened passage.",
  seo_optimize:
    "You are an SEO copywriter. Rewrite the text to naturally include the target keywords with healthy density (1–2%). Improve headings, scannability and meta-friendly opening. Return JSON: {\"content\":\"...\",\"meta_title\":\"...\",\"meta_description\":\"...\",\"keyword_density\":{...},\"score\":0-100,\"suggestions\":[\"...\"]}",
  plagiarism_check:
    "You are an originality auditor. Analyze the text for clichéd phrasing, overused patterns and likely-derivative passages. Return JSON: {\"originality_score\":0-100,\"flagged\":[{\"excerpt\":\"...\",\"reason\":\"...\"}],\"suggestions\":[\"...\"]}. Never claim certainty of plagiarism — flag risk only.",
  translate:
    "You are a literary translator. Translate the text to the target language preserving voice, style and cultural nuance. Return only the translation.",
  cowriter:
    "You are an elite AI Co-Writer. Suggest sentences, polish prose, brainstorm ideas, fix dialogue and break writer's block. Be concise, concrete and stay in the user's voice. Use markdown when helpful.",
  fashion_ootd:
    "You are an elite fashion critic. Return only valid JSON with overall_score, style_score, color_harmony_score, occasion_appropriateness_score, trend_relevance_score (all 1-100), strengths (array), improvements (array), styling_tips (array), style_tags (array), celebrity_match, and confidence_boost.",
  fashion_celebrity_clone:
    "You are a celebrity fashion analyst. Return only valid JSON with celebrity, look_description, style_era, difficulty_to_recreate, items (array containing original_item, brand, estimated_price, budget_alternative, budget_brand, budget_price, match_accuracy), total_original_cost, total_budget_cost, savings_percentage, styling_notes (array), and where_to_shop (array). Use EUR exclusively.",
  fashion_body_shape:
    "You are a body-positive fashion stylist. Return only valid JSON with shapeAnalysis, bestStyles, avoidStyles, and shoppingGuide. Never shame the user or make medical claims.",
  fashion_sustainable:
    "You are a sustainable fashion expert. Return only valid JSON with sustainabilityScore, swapSuggestions, ecoAlternatives, and actionPlan.",
  score_content:
    "You are a literary critic. Score the text on quality, readability, emotional resonance and structure. Return JSON: {\"overall\":0-100,\"breakdown\":{\"quality\":0-100,\"readability\":0-100,\"emotion\":0-100,\"structure\":0-100},\"suggestions\":[\"...\"]}" };

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Unauthorized");
    const token = authHeader.replace("Bearer ", "");
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) throw new Error("Unauthorized");

    const body = await req.json();
    const action = body.action as Action;
    const text = (body.text ?? "").toString();
    const extra = body.extra ?? {};
    const cost = COST_OVERRIDES[action] ?? CREDIT_COST;

    if (!SYSTEM_PROMPTS[action]) throw new Error(`Unknown action: ${action}`);
    if (!text.trim() && action !== "brainstorm" && action !== "cowriter") throw new Error("Text is required");

    const current = await getUnifiedAiCreditBalance(supabase, user.id);
    if (current.total < cost) {
      return new Response(
        JSON.stringify({ error: "INSUFFICIENT_CREDITS", required: cost, available: current.total }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Build user prompt with optional context
    let userPrompt = "";
    if (action === "brainstorm") {
      userPrompt = `Topic / seed: ${extra.topic ?? text}\nKind: ${extra.kind ?? "ideas"}\nAudience: ${extra.audience ?? "general"}`;
    } else if (action === "translate") {
      userPrompt = `Target language: ${extra.language ?? "Spanish"}\n\nText:\n${text}`;
    } else if (action === "seo_optimize") {
      userPrompt = `Target keywords: ${(extra.keywords ?? []).join(", ")}\n\nText:\n${text}`;
    } else if (action === "fashion_ootd") {
      userPrompt = `Outfit: ${extra.outfitDescription ?? text}\nOccasion: ${extra.occasion ?? "Casual"}\nSeason: ${extra.season ?? "All-season"}`;
    } else if (action === "fashion_celebrity_clone") {
      userPrompt = `Celebrity: ${extra.celebrity ?? text}\nBudget level: ${extra.budget_level ?? "medium"}`;
    } else if (action === "fashion_body_shape") {
      userPrompt = `Height: ${extra.height ?? "not specified"} cm\nBody shape: ${extra.bodyShape ?? "not sure"}\nStyle goal: ${extra.styleGoal ?? "balanced"}`;
    } else if (action === "fashion_sustainable") {
      userPrompt = `Current wardrobe: ${extra.wardrobe ?? text}\nBudget preference: ${extra.budget ?? "moderate"}`;
    } else {
      userPrompt = text;
    }
    if (extra.brand_voice) {
      userPrompt = `Brand voice profile:\n${JSON.stringify(extra.brand_voice)}\n\n${userPrompt}`;
    }

    const messages = action === "cowriter"
      ? [
          { role: "system" as const, content: `${SYSTEM_PROMPTS.cowriter}\nContext: writing a ${(extra.category ?? "piece").toString().replace(/_/g, " ")}.${extra.brand_voice ? `\n\nAlways write in this brand voice profile:\n${JSON.stringify(extra.brand_voice)}` : ""}${extra.currentText ? `\n\nCurrent draft:\n"""${String(extra.currentText).slice(0, 6000)}"""` : ""}` },
          ...(Array.isArray(extra.history) ? extra.history : [])
            .filter((m: any) => m?.role === "user" || m?.role === "assistant")
            .slice(-16)
            .map((m: any) => ({ role: m.role as "user" | "assistant", content: String(m.content ?? "").slice(0, 8000) })),
        ]
      : [
          { role: "system" as const, content: SYSTEM_PROMPTS[action] },
          { role: "user" as const, content: userPrompt },
        ];

    let content = "";
    try {
      content = await callCreativeAI(messages);
    } catch (err: any) {
      const status = err?.status ?? 502;
      console.error("Creative AI failed", status, err?.message);
      return new Response(
        JSON.stringify({ error: err?.message ?? "AI request failed. Please try again." }),
        { status, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Try parse JSON for structured actions
    let parsed: any = null;
    const structuredActions = [
      "seo_optimize",
      "plagiarism_check",
      "score_content",
      "fashion_ootd",
      "fashion_celebrity_clone",
      "fashion_body_shape",
      "fashion_sustainable",
    ];
    if (structuredActions.includes(action)) {
      try {
        const match = content.match(/\{[\s\S]*\}$/m) || content.match(/\{[\s\S]*\}/);
        parsed = match ? JSON.parse(match[0]) : null;
      } catch (_) { parsed = null; }
    }

    // Atomic credit deduction AFTER successful AI call (race-safe)
    const spendResult = await spendUnifiedAiCredits(supabase, user.id, cost, `creative_forge_${action}`, "forge-ai-tools");

    // Persist score-type results (refund on failure)
    if (parsed && ["seo_optimize", "plagiarism_check", "score_content"].includes(action)) {
      const scoreType = action === "seo_optimize" ? "seo" : action === "plagiarism_check" ? "plagiarism" : "quality";
      const { error: insErr } = await supabase.from("creative_forge_content_scores").insert({
        user_id: user.id,
        project_id: extra.project_id ?? null,
        score_type: scoreType,
        overall_score: parsed.score ?? parsed.overall ?? parsed.originality_score ?? null,
        breakdown: parsed.breakdown ?? parsed.keyword_density ?? {},
        suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
        source_excerpt: text.slice(0, 500) });
      if (insErr) console.error("Score persist failed (non-fatal):", insErr);
    }

    return new Response(
      JSON.stringify({ action,
        content,
        parsed,
        ...(parsed && action.startsWith("fashion_") ? parsed : {}),
        creditsUsed: cost,
        creditsRemaining: spendResult.total,
        freeCreditsRemaining: spendResult.free,
        paidCreditsRemaining: spendResult.paid }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );

  } catch (e: any) {
    console.error("forge-ai-tools error", e);
    if (isInsufficientCreditsError(e)) {
      return new Response(JSON.stringify({ error: "INSUFFICIENT_CREDITS" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    return new Response(
      JSON.stringify({ error: e?.message ?? "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
