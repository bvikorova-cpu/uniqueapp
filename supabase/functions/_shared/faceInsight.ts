import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { corsHeaders, errorResponse, jsonResponse } from "./openai.ts";
import { deductAICredits, refundAICredits } from "./credits.ts";
import { tryVertexChat } from "./vertexDirect.ts";

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

  const attempts: string[] = [text];

  // Repair 1: close unbalanced quotes/brackets (truncated output).
  let repaired = text.replace(/,\s*$/, "");
  const opens = (repaired.match(/\{/g) || []).length - (repaired.match(/\}/g) || []).length;
  const brOpens = (repaired.match(/\[/g) || []).length - (repaired.match(/\]/g) || []).length;
  repaired += '"'.repeat((repaired.match(/"/g) || []).length % 2) +
    "]".repeat(Math.max(0, brOpens)) + "}".repeat(Math.max(0, opens));
  attempts.push(repaired);

  // Repair 2: escape raw newlines/tabs inside string literals (common with long markdown).
  const escapeInStrings = (src: string) => {
    let out = "";
    let inStr = false;
    for (let i = 0; i < src.length; i++) {
      const ch = src[i];
      if (ch === '"' && src[i - 1] !== "\\") inStr = !inStr;
      if (inStr && (ch === "\n" || ch === "\r" || ch === "\t")) {
        out += ch === "\t" ? "\\t" : ch === "\r" ? "" : "\\n";
        continue;
      }
      out += ch;
    }
    return out;
  };
  attempts.push(escapeInStrings(text), escapeInStrings(repaired));

  for (const candidate of attempts) {
    try {
      const parsed = JSON.parse(candidate);
      if (parsed && typeof parsed === "object") return parsed;
    } catch { /* try next */ }
  }
  return null;
}

/** Last resort: pull the report/headline out of a malformed response. */
function salvage(raw: string): any | null {
  const text = raw.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  if (!text) return null;
  const headline = text.match(/"headline"\s*:\s*"([^"]{3,120})"/)?.[1];
  const summary = text.match(/"summary"\s*:\s*"([^"]{3,1200})"/)?.[1];
  const reportMatch = text.match(/"report"\s*:\s*"([\s\S]+)$/);
  let report = reportMatch?.[1] ?? "";
  report = report.replace(/"\s*[,}]?\s*$/, "").replace(/\\n/g, "\n").replace(/\\"/g, '"').trim();
  if (!report && /##\s/.test(text)) report = text; // model answered in plain markdown
  if (!report || report.length < 200) return null;
  return { headline, summary, report };
}

/**
 * Providers occasionally return valid report content in a slightly different
 * JSON shape, or truncate only the closing JSON punctuation. Do not mistake
 * that formatting issue for an unreadable photograph.
 */
function findReportPayload(value: unknown, depth = 0): any | null {
  if (!value || typeof value !== "object" || depth > 4) return null;
  const record = value as Record<string, unknown>;
  const reportValue = record.report ?? record.analysis ?? record.result ?? record.content;
  if (typeof reportValue === "string" && reportValue.trim().length >= 200) {
    return {
      headline: typeof record.headline === "string" ? record.headline : undefined,
      summary: typeof record.summary === "string" ? record.summary : undefined,
      scores: record.scores,
      traits: record.traits,
      report: reportValue.trim(),
    };
  }
  for (const nested of Object.values(record)) {
    const found = findReportPayload(nested, depth + 1);
    if (found) return found;
  }
  return null;
}

function plainTextFallback(raw: string): any | null {
  let text = raw.trim()
    .replace(/^```(?:json|markdown|md)?\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
  if (!text || text.length < 300) return null;

  // A malformed/truncated JSON response may still contain a complete report.
  const reportStart = text.search(/"(?:report|analysis|result|content)"\s*:\s*"/i);
  if (reportStart >= 0) {
    const colon = text.indexOf(":", reportStart);
    text = text.slice(colon + 1).trim().replace(/^"/, "");
  }
  text = text
    .replace(/"\s*[,}]\s*$/s, "")
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "")
    .replace(/\\t/g, "\t")
    .replace(/\\"/g, '"')
    .trim();

  return text.length >= 200 ? { report: text } : null;
}

function normalizeAssistantContent(content: unknown): string {
  if (typeof content === "string") return content.trim();
  if (!Array.isArray(content)) return "";
  return content
    .map((part) => {
      if (typeof part === "string") return part;
      if (!part || typeof part !== "object") return "";
      const item = part as Record<string, unknown>;
      return typeof item.text === "string" ? item.text : "";
    })
    .filter(Boolean)
    .join("\n")
    .trim();
}


async function runAI(mode: Mode, images: string[], note: string): Promise<string> {
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
      const data = await tryVertexChat({
          model,
          max_tokens: mode === "deep" ? 6000 : 3500,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: systemPrompt(mode) },
            { role: "user", content },
          ],
      });
      if (data) {
        const out = normalizeAssistantContent(data?.choices?.[0]?.message?.content);
        // Very short answers are usually provider refusals or interrupted output;
        // continue to the next attempt/model instead of charging for no report.
        if (out.length >= 200) return out;
        lastErr = Object.assign(new Error("AI returned an incomplete analysis"), { status: 502 });
      } else {
        lastErr = Object.assign(new Error("Vertex AI analysis failed"), { status: 503 });
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

    const decoded = safeJson(raw);
    let parsed: any = findReportPayload(decoded) ?? salvage(raw) ?? plainTextFallback(raw);
    if (!parsed || !parsed.report) {
      console.error("[face-insight] unusable AI response", { length: raw.length });
      await refundAICredits(user.id, cost, `face-insight-${mode}`);
      return errorResponse("The AI returned an incomplete report. Your credits were refunded; please try again.", 502);
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
