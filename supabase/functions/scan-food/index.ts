import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { corsHeaders, errorResponse, jsonResponse } from "../_shared/openai.ts";
import { deductAICredits } from "../_shared/credits.ts";

const SYSTEM = `You are a nutrition vision expert. Look at the food photo and identify it.
Return ONLY raw JSON (no markdown fences) in exactly this shape:
{"food_name":"string","portion_g":number,"calories":number,"protein":number,"carbs":number,"fats":number,"health_tags":["string"],"healthier_alternatives":[{"name":"string","reason":"string"}]}
All numeric values must be numbers for the visible portion. Provide 2-3 healthier_alternatives.`;

const MODELS = ["google/gemini-2.5-flash", "google/gemini-2.5-flash-lite"];
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function safeJson(raw: string): any | null {
  let text = raw.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  const start = text.indexOf("{");
  if (start > 0) text = text.slice(start);
  try {
    return JSON.parse(text);
  } catch {
    // Balance braces/brackets for truncated output
    let repaired = text.replace(/,\s*$/, "");
    const opens = (repaired.match(/\{/g) || []).length - (repaired.match(/\}/g) || []).length;
    const brOpens = (repaired.match(/\[/g) || []).length - (repaired.match(/\]/g) || []).length;
    repaired += "]".repeat(Math.max(0, brOpens)) + "}".repeat(Math.max(0, opens));
    try {
      return JSON.parse(repaired);
    } catch {
      return null;
    }
  }
}

async function analyzeImage(imageUrl: string, note: string): Promise<string> {
  const key = Deno.env.get("LOVABLE_API_KEY");
  if (!key) throw Object.assign(new Error("Missing LOVABLE_API_KEY"), { status: 500 });

  let lastErr: any = null;
  for (const model of MODELS) {
    for (let attempt = 0; attempt < 3; attempt++) {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Lovable-API-Key": key },
        body: JSON.stringify({
          model,
          max_tokens: 1200,
          messages: [
            { role: "system", content: SYSTEM },
            {
              role: "user",
              content: [
                { type: "text", text: note || "Analyze this food photo and return the JSON." },
                { type: "image_url", image_url: { url: imageUrl } },
              ],
            },
          ],
        }),
      });

      if (res.ok) {
        const data = await res.json();
        return data?.choices?.[0]?.message?.content?.trim() || "";
      }

      const body = await res.text();
      lastErr = Object.assign(new Error(body || `AI error ${res.status}`), { status: res.status });
      if (res.status === 429 || res.status >= 500) {
        await sleep(700 * (attempt + 1));
        continue;
      }
      throw lastErr;
    }
  }
  throw lastErr ?? new Error("AI request failed");
}

serve(async (req) => {
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

    const body = await req.json().catch(() => ({}));
    const imageUrl: string | undefined = body.imageBase64 || body.image || body.imageUrl || body.photo;
    if (!imageUrl || typeof imageUrl !== "string") {
      return errorResponse("Please upload a food photo first.", 400);
    }
    const note = typeof body.note === "string" ? body.note.slice(0, 500) : "";

    let raw: string;
    try {
      raw = await analyzeImage(imageUrl, note);
    } catch (e: any) {
      const status = e?.status ?? 500;
      if (status === 429) return errorResponse("AI is busy right now. Please try again in a moment.", 429);
      if (status === 402) return errorResponse("AI credits exhausted. Please try again later.", 402);
      return errorResponse(e?.message || "AI request failed", 500);
    }

    const parsed = safeJson(raw);
    if (!parsed || typeof parsed !== "object") {
      return errorResponse("The scanner could not read the photo. Please try another image.", 502);
    }

    const macros = parsed.macros && typeof parsed.macros === "object" ? parsed.macros : {};
    const scan = {
      food_name: parsed.food_name ?? parsed.name ?? "Identified food",
      portion_g: parsed.portion_g ?? null,
      calories: parsed.calories ?? 0,
      protein: parsed.protein ?? macros.protein ?? macros.p ?? 0,
      carbs: parsed.carbs ?? macros.carbs ?? macros.c ?? 0,
      fats: parsed.fats ?? macros.fats ?? macros.f ?? 0,
      health_tags: Array.isArray(parsed.health_tags) ? parsed.health_tags : [],
      healthier_alternatives: Array.isArray(parsed.healthier_alternatives) ? parsed.healthier_alternatives : [],
      macros: {
        protein: parsed.protein ?? macros.protein ?? macros.p ?? 0,
        carbs: parsed.carbs ?? macros.carbs ?? macros.c ?? 0,
        fats: parsed.fats ?? macros.fats ?? macros.f ?? 0,
      },
    };

    // Charge only after a successful, readable analysis.
    const creditDenied = await deductAICredits(user.id, 1, "scan-food");
    if (creditDenied) return creditDenied;

    return jsonResponse({ success: true, scan, result: scan, data: scan, analysis: scan });
  } catch (e: any) {
    return errorResponse(e.message || "Function failed");
  }
});
