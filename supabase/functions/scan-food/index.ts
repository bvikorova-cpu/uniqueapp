import "../_shared/aiRedirect.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { corsHeaders, errorResponse, jsonResponse } from "../_shared/openai.ts";
import { deductAICredits } from "../_shared/credits.ts";

const SYSTEM = `You are a senior clinical nutritionist and food-vision expert. Analyse the food photo in depth.
Return ONLY raw JSON (no markdown fences) in exactly this shape:
{
 "food_name":"string",
 "description":"1-2 sentence description of what is on the plate and how it was cooked",
 "confidence":number,
 "portion_g":number,
 "calories":number,
 "protein":number,
 "carbs":number,
 "fats":number,
 "fiber_g":number,
 "sugar_g":number,
 "saturated_fat_g":number,
 "sodium_mg":number,
 "ingredients":[{"name":"string","approx_g":number,"calories":number,"note":"cooking method or quality note"}],
 "micronutrients":[{"name":"Vitamin C","amount":"45 mg","percent_dv":50}],
 "allergens":["string"],
 "diet_tags":["high-protein","gluten-free"],
 "glycemic_index":"low|medium|high",
 "health_score":number,
 "verdict":"one-sentence overall assessment",
 "pros":["string"],
 "cons":["string"],
 "improvement_tips":["concrete swap or portion advice"],
 "meal_fit":{"breakfast":"good|ok|poor","lunch":"good|ok|poor","dinner":"good|ok|poor","post_workout":"good|ok|poor"},
 "activity_equivalent":[{"activity":"Brisk walking","minutes":60}],
 "healthier_alternatives":[{"name":"string","reason":"string","calories":number}]
}
Rules: all numeric values are numbers (no units inside numbers) for the VISIBLE portion. health_score and confidence are 0-100.
Give 3-6 ingredients, 4-6 micronutrients, 2-4 pros, 2-4 cons, 3-5 improvement_tips, 2-3 activity_equivalent entries and 2-3 healthier_alternatives. Be specific and quantitative.`

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
          max_tokens: 6000,
          response_format: { type: "json_object" },
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
        const content = data?.choices?.[0]?.message?.content?.trim() || "";
        // Empty completion (safety filter / hiccup) — retry instead of failing.
        if (content) return content;
        lastErr = Object.assign(new Error("Empty AI response"), { status: 502 });
        await sleep(500 * (attempt + 1));
        continue;
      }

      const body = await res.text();
      lastErr = Object.assign(new Error(body || `AI error ${res.status}`), { status: res.status });
      if (res.status === 429 || res.status >= 500) {
        await sleep(700 * (attempt + 1));
        continue;
      }
      if (res.status === 400) break; // model rejected the payload — try next model
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

    let parsed: any = null;
    let lastAiError: any = null;
    // Two full passes: unreadable/unparseable output gets a second chance.
    for (let pass = 0; pass < 2 && !parsed; pass++) {
      try {
        const raw = await analyzeImage(imageUrl, note);
        const candidate = safeJson(raw);
        if (candidate && typeof candidate === "object") parsed = candidate;
      } catch (e: any) {
        lastAiError = e;
        const status = e?.status ?? 500;
        if (status === 429) return errorResponse("AI is busy right now. Please try again in a moment.", 429);
        if (status === 402) return errorResponse("AI credits exhausted. Please try again later.", 402);
      }
    }
    if (!parsed) {
      const msg = lastAiError?.message
        ? "The scanner could not analyze the photo. Please try again."
        : "The scanner could not read the photo. Please try another image.";
      return errorResponse(msg, 502);
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
      description: parsed.description ?? "",
      confidence: parsed.confidence ?? null,
      fiber_g: parsed.fiber_g ?? null,
      sugar_g: parsed.sugar_g ?? null,
      saturated_fat_g: parsed.saturated_fat_g ?? null,
      sodium_mg: parsed.sodium_mg ?? null,
      ingredients: Array.isArray(parsed.ingredients) ? parsed.ingredients : [],
      micronutrients: Array.isArray(parsed.micronutrients) ? parsed.micronutrients : [],
      allergens: Array.isArray(parsed.allergens) ? parsed.allergens : [],
      diet_tags: Array.isArray(parsed.diet_tags) ? parsed.diet_tags : [],
      glycemic_index: parsed.glycemic_index ?? null,
      health_score: parsed.health_score ?? null,
      verdict: parsed.verdict ?? "",
      pros: Array.isArray(parsed.pros) ? parsed.pros : [],
      cons: Array.isArray(parsed.cons) ? parsed.cons : [],
      improvement_tips: Array.isArray(parsed.improvement_tips) ? parsed.improvement_tips : [],
      meal_fit: parsed.meal_fit && typeof parsed.meal_fit === "object" ? parsed.meal_fit : null,
      activity_equivalent: Array.isArray(parsed.activity_equivalent) ? parsed.activity_equivalent : [],
      macros: {
        protein: parsed.protein ?? macros.protein ?? macros.p ?? 0,
        carbs: parsed.carbs ?? macros.carbs ?? macros.c ?? 0,
        fats: parsed.fats ?? macros.fats ?? macros.f ?? 0,
      },
    };

    // Charge only after a successful, readable analysis.
    const creditDenied = await deductAICredits(user.id, 10, "scan-food");
    if (creditDenied) return creditDenied;

    return jsonResponse({ success: true, scan, result: scan, data: scan, analysis: scan });
  } catch (e: any) {
    return errorResponse(e.message || "Function failed");
  }
});
