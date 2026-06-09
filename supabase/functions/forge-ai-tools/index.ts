// Universal CreativeForge AI tools: brainstorm, quick edits, SEO, plagiarism,
// translate, score. 6 credits per action (revision is 3).
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const CREDIT_COST = 6;
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
  | "score_content";

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
  score_content:
    "You are a literary critic. Score the text on quality, readability, emotional resonance and structure. Return JSON: {\"overall\":0-100,\"breakdown\":{\"quality\":0-100,\"readability\":0-100,\"emotion\":0-100,\"structure\":0-100},\"suggestions\":[\"...\"]}",
};

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

    if (!SYSTEM_PROMPTS[action]) throw new Error(`Unknown action: ${action}`);
    if (!text.trim() && action !== "brainstorm") throw new Error("Text is required");

    // Credit check (read-only pre-flight for nice 402 UX)
    const { data: credits } = await supabase
      .from("creative_forge_credits")
      .select("credits_remaining")
      .eq("user_id", user.id)
      .maybeSingle();
    const current = credits?.credits_remaining ?? 0;
    if (current < CREDIT_COST) {
      return new Response(
        JSON.stringify({ error: "INSUFFICIENT_CREDITS", required: CREDIT_COST, available: current }),
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
    } else {
      userPrompt = text;
    }
    if (extra.brand_voice) {
      userPrompt = `Brand voice profile:\n${JSON.stringify(extra.brand_voice)}\n\n${userPrompt}`;
    }

    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) throw new Error("OPENAI_API_KEY missing");

    const ai = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPTS[action] },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!ai.ok) {
      const errText = await ai.text();
      console.error("Gateway error", ai.status, errText);
      if (ai.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please retry shortly." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (ai.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted on the platform. Please contact support." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      throw new Error("AI gateway failed");
    }

    const data = await ai.json();
    let content: string = data.choices?.[0]?.message?.content ?? "";

    // Try parse JSON for structured actions
    let parsed: any = null;
    if (["seo_optimize", "plagiarism_check", "score_content"].includes(action)) {
      try {
        const match = content.match(/\{[\s\S]*\}$/m) || content.match(/\{[\s\S]*\}/);
        parsed = match ? JSON.parse(match[0]) : null;
      } catch (_) { parsed = null; }
    }

    // Atomic credit deduction AFTER successful AI call (race-safe)
    const { data: newRemaining, error: dedErr } = await supabase.rpc("deduct_creative_forge_credits", {
      _user_id: user.id, _amount: CREDIT_COST,
    });
    if (dedErr) {
      if (dedErr.message?.includes("INSUFFICIENT_CREDITS")) {
        return new Response(JSON.stringify({ error: "INSUFFICIENT_CREDITS" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      throw dedErr;
    }

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
        source_excerpt: text.slice(0, 500),
      });
      if (insErr) console.error("Score persist failed (non-fatal):", insErr);
    }

    return new Response(
      JSON.stringify({
        action,
        content,
        parsed,
        creditsUsed: CREDIT_COST,
        creditsRemaining: newRemaining,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );

  } catch (e: any) {
    console.error("forge-ai-tools error", e);
    return new Response(
      JSON.stringify({ error: e?.message ?? "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
