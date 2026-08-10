import "../_shared/aiRedirect.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { corsHeaders, errorResponse, jsonResponse } from "../_shared/openai.ts";
import { deductAICredits } from "../_shared/credits.ts";

const COST = 25;

const SYSTEM = `You are a nutrition expert analysing restaurant menus.
Return ONLY raw JSON (no markdown fences) in exactly this shape:
{
  "restaurant_name": string,
  "recommendations": [{ "dishName": string, "reason": string, "calories": number }],
  "analysis_data": [{ "name": string, "estimatedCalories": number, "healthScore": number }]
}
Give 3-5 recommendations and up to 10 dishes. healthScore is 1-10. If a menu image is supplied, read the real dishes from it; otherwise use typical dishes for that restaurant.`;

function safeJson(text: string) {
  const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  try { return JSON.parse(cleaned); } catch {}
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start >= 0 && end > start) {
    try { return JSON.parse(cleaned.slice(start, end + 1)); } catch {}
  }
  return null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return errorResponse("Missing authorization", 401);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return errorResponse("Not authenticated", 401);

    const body = await req.json().catch(() => ({}));
    const restaurantName = String(body?.restaurantName ?? "").slice(0, 200);
    if (!restaurantName) return errorResponse("Restaurant name is required", 400);
    const menuImage: string | null = typeof body?.menuImageBase64 === "string" && body.menuImageBase64.startsWith("data:image")
      ? body.menuImageBase64
      : null;

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) return errorResponse("AI is not configured", 500);

    const content: unknown[] = [
      { type: "text", text: `Restaurant: ${restaurantName}. Analyse the menu and return the JSON.` },
    ];
    if (menuImage) content.push({ type: "image_url", image_url: { url: menuImage } });

    let text = "";
    let lastError = "";
    for (const model of ["google/gemini-3.5-flash", "google/gemini-3.1-flash-lite"]) {
      for (let attempt = 0; attempt < 2; attempt++) {
        const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Lovable-API-Key": apiKey },
          body: JSON.stringify({
            model,
            messages: [
              { role: "system", content: SYSTEM },
              { role: "user", content },
            ],
            max_tokens: 3000,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          text = data?.choices?.[0]?.message?.content ?? "";
          break;
        }
        lastError = await res.text();
        if (res.status === 402) return jsonResponse({ error: "AI credits exhausted" }, 402);
        if (res.status !== 429 && res.status < 500) break;
        await new Promise((r) => setTimeout(r, 1200 * (attempt + 1)));
      }
      if (text) break;
    }

    if (!text) {
      console.error("[analyze-restaurant-menu] AI failed", lastError);
      return errorResponse("AI is busy right now, please try again in a moment.", 503);
    }

    const parsed = safeJson(text);
    if (!parsed) return errorResponse("The AI returned an unreadable analysis. Please try again.", 502);

    const analysis = {
      restaurant_name: parsed.restaurant_name ?? restaurantName,
      recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
      analysis_data: Array.isArray(parsed.analysis_data) ? parsed.analysis_data : [],
    };

    const creditDenied = await deductAICredits(user.id, COST, "analyze-restaurant-menu");
    if (creditDenied) return creditDenied;

    return jsonResponse({ success: true, analysis });
  } catch (e: any) {
    console.error("[analyze-restaurant-menu] error", e);
    return errorResponse(e?.message || "Function failed");
  }
});
