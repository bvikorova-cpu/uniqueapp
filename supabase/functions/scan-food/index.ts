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


const MENU_SYSTEM = `You are a senior clinical nutritionist analysing a restaurant menu (or a photo of restaurant food).
Return ONLY raw JSON (no markdown fences) in exactly this shape:
{
 "restaurant_name":"string",
 "summary":"2-3 sentence overview of how healthy this menu is and how to order well here",
 "top_recommendations":[{"name":"string","reason":"why it is a good choice","calories":number,"protein":number}],
 "items_to_avoid":[{"name":"string","reason":"why to limit it","calories":number}],
 "analysis_data":[{"name":"string","calories":number,"protein":number,"carbs":number,"fats":number,"health_score":number}],
 "recommendations":["short practical ordering tip"],
 "hidden_calorie_traps":["string"],
 "allergen_warnings":["string"],
 "best_for":{"weight_loss":"string","muscle_gain":"string","kids":"string"}
}
Rules: numbers only in numeric fields (no units). Give 3-5 top_recommendations, 2-4 items_to_avoid, 5-10 analysis_data rows, 4-6 recommendations. If a photo is provided, base the analysis on the dishes visible in it; otherwise use well-known typical menu items for the named restaurant. Be specific and quantitative.`;

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

async function analyzeImage(imageUrl: string | null, note: string, system: string = SYSTEM): Promise<string> {
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
            { role: "system", content: system },
            {
              role: "user",
              content: [
                { type: "text", text: note || "Analyze this food photo and return the JSON." },
                ...(imageUrl ? [{ type: "image_url", image_url: { url: imageUrl } }] : []),
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
    if (body.mode !== "menu" && (!imageUrl || typeof imageUrl !== "string")) {
      return errorResponse("Please upload a food photo first.", 400);
    }
    const note = typeof body.note === "string" ? body.note.slice(0, 500) : "";

    // ── Restaurant menu mode (2 credits): analyses a menu / restaurant food photo ──
    if (body.mode === "menu") {
      const restaurant = (body.restaurantName || body.restaurant_name || body.restaurant || "").toString().slice(0, 200);
      if (!restaurant && !imageUrl) {
        return errorResponse("Enter a restaurant name or add a menu photo.", 400);
      }
      let menuParsed: any = null;
      let menuErr: any = null;
      for (let pass = 0; pass < 2 && !menuParsed; pass++) {
        try {
          const raw = await analyzeImage(
            imageUrl,
            `Restaurant: ${restaurant || "Unknown restaurant"}. Analyse the menu and return the JSON.`,
            MENU_SYSTEM,
          );
          const candidate = safeJson(raw);
          if (candidate && typeof candidate === "object") menuParsed = candidate;
        } catch (e: any) {
          menuErr = e;
          const status = e?.status ?? 500;
          if (status === 429) return errorResponse("AI is busy right now. Please try again in a moment.", 429);
          if (status === 402) return errorResponse("AI credits exhausted. Please try again later.", 402);
        }
      }
      if (!menuParsed) {
        return errorResponse(
          menuErr?.message
            ? "The menu could not be analysed. Please try again."
            : "The menu could not be read. Please try another photo.",
          502,
        );
      }
      const arr = (v: any) => (Array.isArray(v) ? v : []);
      const analysis = {
        restaurant_name: menuParsed.restaurant_name || restaurant || "Restaurant",
        summary: menuParsed.summary || "",
        top_recommendations: arr(menuParsed.top_recommendations),
        items_to_avoid: arr(menuParsed.items_to_avoid),
        analysis_data: arr(menuParsed.analysis_data),
        recommendations: arr(menuParsed.recommendations),
        hidden_calorie_traps: arr(menuParsed.hidden_calorie_traps),
        allergen_warnings: arr(menuParsed.allergen_warnings),
        best_for: menuParsed.best_for && typeof menuParsed.best_for === "object" ? menuParsed.best_for : null,
      };
      const menuDenied = await deductAICredits(user.id, 2, "analyze-menu");
      if (menuDenied) return menuDenied;
      return jsonResponse({ success: true, analysis, data: analysis, result: analysis });
    }

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
    const creditDenied = await deductAICredits(user.id, 3, "scan-food");
    if (creditDenied) return creditDenied;

    return jsonResponse({ success: true, scan, result: scan, data: scan, analysis: scan });
  } catch (e: any) {
    return errorResponse(e.message || "Function failed");
  }
});
