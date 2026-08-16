import "../_shared/aiRedirect.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { corsHeaders, errorResponse, jsonResponse } from "../_shared/openai.ts";
import { deductAICredits } from "../_shared/credits.ts";

const COST = 2;

const SYSTEM = `You are a senior clinical nutritionist analysing a restaurant menu (or a photo of restaurant food).
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

async function askAI(restaurant: string, image?: string | null): Promise<string> {
  const key = Deno.env.get("LOVABLE_API_KEY");
  if (!key) throw Object.assign(new Error("Missing LOVABLE_API_KEY"), { status: 500 });

  const userContent: any[] = [
    {
      type: "text",
      text: `Restaurant: ${restaurant || "Unknown restaurant"}. Analyse the menu and return the JSON.`,
    },
  ];
  if (image) userContent.push({ type: "image_url", image_url: { url: image } });

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
            { role: "user", content: userContent },
          ],
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const content = data?.choices?.[0]?.message?.content?.trim() || "";
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
      if (res.status === 400) break;
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
    const restaurant: string = (body.restaurantName || body.restaurant_name || body.restaurant || "").toString().slice(0, 200);
    const image: string | null = body.menuImage || body.menu_image || body.menuImageBase64 || body.image || null;
    if (!restaurant && !image) {
      return errorResponse("Enter a restaurant name or add a menu photo.", 400);
    }

    let parsed: any = null;
    let lastAiError: any = null;
    for (let pass = 0; pass < 2 && !parsed; pass++) {
      try {
        const raw = await askAI(restaurant, image);
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
      return errorResponse(
        lastAiError?.message
          ? "The menu could not be analysed. Please try again."
          : "The menu could not be read. Please try another photo.",
        502,
      );
    }

    const arr = (v: any) => (Array.isArray(v) ? v : []);
    const analysis = {
      restaurant_name: parsed.restaurant_name || restaurant || "Restaurant",
      summary: parsed.summary || "",
      top_recommendations: arr(parsed.top_recommendations),
      items_to_avoid: arr(parsed.items_to_avoid),
      analysis_data: arr(parsed.analysis_data),
      recommendations: arr(parsed.recommendations),
      hidden_calorie_traps: arr(parsed.hidden_calorie_traps),
      allergen_warnings: arr(parsed.allergen_warnings),
      best_for: parsed.best_for && typeof parsed.best_for === "object" ? parsed.best_for : null,
    };

    // Charge only after a successful, readable analysis.
    const creditDenied = await deductAICredits(user.id, COST, "analyze-menu");
    if (creditDenied) return creditDenied;

    return jsonResponse({ success: true, analysis, data: analysis, result: analysis });
  } catch (e: any) {
    return errorResponse(e.message || "Function failed");
  }
});
