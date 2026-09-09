import "../_shared/aiRedirect.ts";
// AI Health & Medical Assistant — symptom chat, lab/document interpreter, medical image & ECG analysis.
// Credits: symptom_chat 1, lab_document 2, medical_image 3 (unified `ai_credits` wallet).
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { requireAiCredits } from "../_shared/credit-check.ts";
import { callUnifiedAIJSON, UnifiedAIError } from "../_shared/unifiedAI.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

type Action = "symptom_chat" | "lab_document" | "medical_image";

const COST: Record<Action, number> = { symptom_chat: 1, lab_document: 2, medical_image: 3 };

const MAX_FILE_BYTES = 8 * 1024 * 1024; // ~8 MB decoded
const IMAGE_MIMES = ["image/png", "image/jpeg", "image/jpg", "image/webp"];

const BASE_RULES = `You are an educational health information assistant inside a consumer app.
Hard rules:
- You never diagnose, never prescribe, never name a specific medication dose.
- You explain in plain, non-alarming language and always point to a qualified doctor for decisions.
- If input suggests a medical emergency (chest pain, stroke signs, severe bleeding, breathing trouble, suicidal intent), set severity to "high" and make the first next step: seek emergency care immediately.
- Write everything in English unless the user's own text is in another language, then answer in that language.
Return STRICT JSON with this exact shape:
{
  "title": string,
  "summary": string,
  "key_findings": string[],
  "severity": "low" | "medium" | "high",
  "severity_reason": string,
  "plain_language": [{ "term": string, "meaning": string }],
  "next_steps": string[],
  "doctor_questions": string[]
}`;

const PROMPTS: Record<Action, string> = {
  symptom_chat: `${BASE_RULES}
Task: the user describes symptoms or asks a health question. Give an educational orientation: what such symptoms are commonly associated with, self-care and prevention basics, and when to see a doctor.`,
  lab_document: `${BASE_RULES}
Task: interpret the attached lab report / blood work / medical document. List each measured value you can read with its result in context (in range, above, below) inside key_findings, and translate the medical abbreviations in plain_language. If a value is unreadable, say so instead of guessing.`,
  medical_image: `${BASE_RULES}
Task: describe what is visible in the attached medical image (ECG strip, X-ray, or skin photo) in educational terms — patterns, notable features, image quality limits. Never state a definitive diagnosis; describe possibilities and what a clinician would evaluate. For skin lesions mention ABCDE observations when applicable.`,
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => null) as any;
    const action = body?.action as Action;
    if (!action || !(action in COST)) {
      return json({ error: "Invalid action. Use symptom_chat, lab_document or medical_image." }, 400);
    }

    const credits = COST[action];
    const auth = await requireAiCredits(req, corsHeaders, {
      credits,
      usageType: "custom_generation",
      description: `AI Health: ${action}`,
      rateLimit: { bucket: `health_ai_${action}`, max: 10, windowSec: 60 },
    });
    if (auth.errorResponse) return auth.errorResponse;
    const user = auth.user!;

    // ---- Build the model input ----
    const userParts: any[] = [];

    if (action === "symptom_chat") {
      const messages = Array.isArray(body?.messages) ? body.messages : [];
      const cleaned = messages
        .filter((m: any) => (m?.role === "user" || m?.role === "assistant") && typeof m?.content === "string")
        .slice(-12)
        .map((m: any) => `${m.role === "user" ? "User" : "Assistant"}: ${String(m.content).slice(0, 4000)}`);
      if (!cleaned.length) return json({ error: "Describe your symptoms or question first." }, 400);
      userParts.push({ type: "text", text: cleaned.join("\n\n") });
    } else {
      const fileBase64: string = typeof body?.file_base64 === "string" ? body.file_base64 : "";
      const mime: string = typeof body?.mime === "string" ? body.mime.toLowerCase() : "";
      const fileName: string = typeof body?.file_name === "string" ? body.file_name.slice(0, 200) : "upload";
      if (!fileBase64 || !mime) return json({ error: "Upload a file first." }, 400);

      const approxBytes = Math.floor((fileBase64.length * 3) / 4);
      if (approxBytes > MAX_FILE_BYTES) {
        return json({ error: "File is too large. Please upload a file under 8 MB." }, 400);
      }

      const isImage = IMAGE_MIMES.includes(mime);
      const isPdf = mime === "application/pdf";
      if (action === "medical_image" && !isImage) {
        return json({ error: "Medical image analysis accepts PNG or JPG images." }, 400);
      }
      if (action === "lab_document" && !isImage && !isPdf) {
        return json({ error: "Lab scanner accepts PNG, JPG or PDF files." }, 400);
      }

      const note = typeof body?.note === "string" ? body.note.slice(0, 1000) : "";
      userParts.push({
        type: "text",
        text: `File: ${fileName} (${mime}).${note ? `\nUser context: ${note}` : ""}`,
      });
      // Vertex accepts inline media through the OpenAI-shaped image_url data URL.
      userParts.push({ type: "image_url", image_url: { url: `data:${mime};base64,${fileBase64}` } });
    }

    const result = await callUnifiedAIJSON<any>(
      [
        { role: "system", content: PROMPTS[action] },
        { role: "user", content: userParts as any },
      ],
      { tier: "premium", max_tokens: 4000 },
    );

    const severity = ["low", "medium", "high"].includes(result?.severity) ? result.severity : "low";
    const payload = {
      title: typeof result?.title === "string" ? result.title : "Health analysis",
      summary: typeof result?.summary === "string" ? result.summary : "",
      key_findings: Array.isArray(result?.key_findings) ? result.key_findings.map(String) : [],
      severity,
      severity_reason: typeof result?.severity_reason === "string" ? result.severity_reason : "",
      plain_language: Array.isArray(result?.plain_language)
        ? result.plain_language
            .filter((p: any) => p && (p.term || p.meaning))
            .map((p: any) => ({ term: String(p.term ?? ""), meaning: String(p.meaning ?? "") }))
        : [],
      next_steps: Array.isArray(result?.next_steps) ? result.next_steps.map(String) : [],
      doctor_questions: Array.isArray(result?.doctor_questions) ? result.doctor_questions.map(String) : [],
    };

    // Deduct only after a successful AI response.
    await auth.deduct!();

    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );
    let scanId: string | null = null;
    try {
      const { data: row } = await admin
        .from("health_ai_scans")
        .insert({
          user_id: user.id,
          kind: action,
          title: payload.title,
          input_meta: {
            file_name: typeof body?.file_name === "string" ? body.file_name.slice(0, 200) : null,
            mime: typeof body?.mime === "string" ? body.mime : null,
          },
          result: payload,
          severity,
          credits_spent: credits,
        })
        .select("id")
        .maybeSingle();
      scanId = (row as any)?.id ?? null;
    } catch (e) {
      console.error("[HEALTH-AI] history insert failed", e instanceof Error ? e.message : String(e));
    }

    return json({ ...payload, scan_id: scanId, credits_spent: credits });
  } catch (e) {
    if (e instanceof UnifiedAIError) {
      console.error("[HEALTH-AI] AI error", e.status, e.message);
      return json({ error: e.message }, e.status >= 400 && e.status < 600 ? e.status : 502);
    }
    console.error("[HEALTH-AI] error", e instanceof Error ? e.message : String(e));
    return json({ error: "Analysis failed. Please try again." }, 500);
  }
});
