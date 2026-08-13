import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { corsHeaders, errorResponse, jsonResponse } from "./openai.ts";
import { deductAICredits, refundAICredits } from "./credits.ts";

/**
 * Face Insight Studio — long-form AI face analysis.
 *  - basic report  : 5 credits
 *  - deep report   : 15 credits (PDF-ready long form)
 *  - compare       : 12 credits (two faces: couple / family)
 * Credits are charged only after a readable AI result and refunded on failure.
 */

const COSTS = { basic: 5, deep: 15, compare: 12 } as const;
type Mode = keyof typeof COSTS;

const MODELS = ["google/gemini-2.5-flash", "google/gemini-2.5-flash-lite"];
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const SHARED_RULES = `
Rules:
- This is entertainment + style guidance, NOT medical, biometric identification, or personality diagnosis.
- Never guess ethnicity, health conditions, sexual orientation, or identity of the person.
- Never claim to identify who the person is.
- Be warm, flattering but honest, specific and practical.
- Write in English.
- Return ONLY raw JSON, no markdown fences.`;

function systemPrompt(mode: Mode): string {
  if (mode === "compare") {
    return `You are a professional image consultant comparing two faces (couple, siblings or family).
Return JSON in exactly this shape:
{"headline":"string","summary":"string","scores":{"resemblance":0-100,"harmony":0-100,"style_match":0-100},
"traits":[{"label":"string","value":"string"}],
"report":"long markdown text with these sections: ## Overall Impression, ## Shared Features, ## Differences, ## Resemblance Verdict, ## Matching Style Advice, ## Fun Facts"}
The "report" must be at least 700 words of markdown.${SHARED_RULES}`;
  }

  const length = mode === "deep" ? 1600 : 700;
  const sections = mode === "deep"
    ? `## Overall Impression
## Face Shape & Proportions
## Symmetry Analysis
## Perceived Traits (charisma, warmth, confidence, energy)
## Skin & Grooming Care Plan
## Color Typology (best colors, colors to avoid)
## Hair & Beard Recommendations
## Eyewear & Accessories
## Make-up Guide
## Outfit & Style Direction
## Photo & Angle Tips
## Celebrity Style Match
## 30-Day Glow-Up Plan`
    : `## Overall Impression
## Face Shape & Proportions
## Symmetry Analysis
## Perceived Traits
## Color Typology
## Hair & Style Recommendations
## Quick Glow-Up Tips`;

  return `You are a world-class image consultant, stylist and facial-aesthetics analyst.
Analyze the uploaded face photo and produce a detailed, personalised report.
Return JSON in exactly this shape:
{"headline":"string (max 60 chars, catchy archetype title e.g. 'Warm Classic Charmer')",
"summary":"string (2-3 sentences)",
"scores":{"symmetry":0-100,"harmony":0-100,"charisma":0-100,"photogenic":0-100,"youthfulness":0-100},
"traits":[{"label":"Face shape","value":"string"},{"label":"Color season","value":"string"},{"label":"Strongest feature","value":"string"},{"label":"Style archetype","value":"string"}],
"report":"long markdown text"}
The "report" must contain these markdown sections in order and be at least ${length} words:
${sections}${SHARED_RULES}`;
}

function safeJson(raw: string): any | null {
  let text = raw.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  const start = text.indexOf("{");
  if (start > 0) text = text.slice(start);
  try {
    return JSON.parse(text);
  } catch {
    let repaired = text.replace(/,\s*$/, "");
    const opens = (repaired.match(/\{/g) || []).length - (repaired.match(/\}/g) || []).length;
    const brOpens = (repaired.match(/\[/g) || []).length - (repaired.match(/\]/g) || []).length;
    repaired += '"'.repeat((repaired.match(/"/g) || []).length % 2) +
      "]".repeat(Math.max(0, brOpens)) + "}".repeat(Math.max(0, opens));
    try {
      return JSON.parse(repaired);
    } catch {
      return null;
    }
  }
}

async function runAI(mode: Mode, images: string[], note: string): Promise<string> {
  const key = Deno.env.get("LOVABLE_API_KEY");
  if (!key) throw Object.assign(new Error("AI is not configured"), { status: 500 });

  const content: unknown[] = [{
    type: "text",
    text: note
      ? `${note.slice(0, 400)}\n\nAnalyze the photo(s) and return the JSON.`
      : "Analyze the photo(s) and return the JSON.",
  }];
  for (const url of images) content.push({ type: "image_url", image_url: { url } });

  let lastErr: any = null;
  for (const model of MODELS) {
    for (let attempt = 0; attempt < 3; attempt++) {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Lovable-API-Key": key },
        body: JSON.stringify({
          model,
          max_tokens: mode === "deep" ? 6000 : 3500,
          messages: [
            { role: "system", content: systemPrompt(mode) },
            { role: "user", content },
          ],
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const out = data?.choices?.[0]?.message?.content?.trim() || "";
        if (out) return out;
      } else {
        const body = await res.text();
        lastErr = Object.assign(new Error(body || `AI error ${res.status}`), { status: res.status });
        if (res.status !== 429 && res.status < 500) break;
      }
      await sleep(700 * (attempt + 1));
    }
  }
  throw lastErr ?? new Error("AI request failed");
}

export async function handleFaceInsight(req: Request, body: any): Promise<Response> {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return errorResponse("Missing authorization", 401);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return errorResponse("Not authenticated", 401);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    
    const action = String(body.action || "analyze");

    if (action === "history") {
      const { data, error } = await admin
        .from("face_insight_reports")
        .select("id, mode, credits_used, headline, summary, report, scores, traits, is_comparison, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(30);
      if (error) return errorResponse(error.message, 500);
      return jsonResponse({ success: true, reports: data ?? [] });
    }

    if (action === "delete") {
      const id = String(body.id || "");
      if (!id) return errorResponse("Report id is required", 400);
      const { error } = await admin
        .from("face_insight_reports").delete().eq("id", id).eq("user_id", user.id);
      if (error) return errorResponse(error.message, 500);
      return jsonResponse({ success: true });
    }

    if (action !== "analyze") return errorResponse("Unknown action", 400);

    const mode: Mode = (["basic", "deep", "compare"] as const).includes(body.mode) ? body.mode : "basic";
    const photoA = typeof body.photo === "string" ? body.photo : "";
    const photoB = typeof body.photoB === "string" ? body.photoB : "";
    if (!photoA) return errorResponse("Please upload a face photo first.", 400);
    if (mode === "compare" && !photoB) return errorResponse("Compare mode needs two photos.", 400);

    const cost = COSTS[mode];
    const note = typeof body.note === "string" ? body.note : "";

    // Reserve credits up-front (refunded when the analysis fails).
    const denied = await deductAICredits(user.id, cost, `face-insight-${mode}`);
    if (denied) return denied;

    let raw = "";
    try {
      raw = await runAI(mode, mode === "compare" ? [photoA, photoB] : [photoA], note);
    } catch (e: any) {
      await refundAICredits(user.id, cost, `face-insight-${mode}`);
      const status = e?.status ?? 500;
      if (status === 429) return errorResponse("AI is busy right now. Please try again in a moment.", 429);
      return errorResponse("The analysis could not be completed. Your credits were refunded.", 500);
    }

    const parsed = safeJson(raw);
    if (!parsed || typeof parsed !== "object" || !parsed.report) {
      await refundAICredits(user.id, cost, `face-insight-${mode}`);
      return errorResponse("The studio could not read this photo. Try a clear, front-facing picture.", 502);
    }

    const report = {
      mode,
      credits_used: cost,
      headline: String(parsed.headline || "Your Face Insight Report").slice(0, 120),
      summary: String(parsed.summary || "").slice(0, 1200),
      report: String(parsed.report),
      scores: parsed.scores && typeof parsed.scores === "object" ? parsed.scores : {},
      traits: Array.isArray(parsed.traits) ? parsed.traits.slice(0, 12) : [],
      is_comparison: mode === "compare",
    };

    const { data: saved } = await admin
      .from("face_insight_reports")
      .insert({ user_id: user.id, ...report })
      .select("id, created_at")
      .maybeSingle();

    return jsonResponse({
      success: true,
      report: { id: saved?.id ?? null, created_at: saved?.created_at ?? new Date().toISOString(), ...report },
    });
  } catch (e: any) {
    return errorResponse(e?.message || "Function failed");
  }
}
