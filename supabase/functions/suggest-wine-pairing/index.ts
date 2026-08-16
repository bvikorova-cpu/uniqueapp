import "../_shared/aiRedirect.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { corsHeaders, errorResponse, jsonResponse } from "../_shared/openai.ts";
import { deductAICredits } from "../_shared/credits.ts";

const COST = 3;

const SYSTEM = `You are a professional sommelier. Return ONLY raw JSON (no markdown fences) in exactly this shape:
{ "pairings": [{ "drink_name": string, "type": string, "reason": string, "price_range": string }] }
Give 3-5 pairings (include at least one non-alcoholic option). "price_range" is an approximate EUR bottle range like "12-18". Never mention any currency other than EUR.`;

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
    const dish = String(body?.dish_name ?? "").slice(0, 200);
    if (!dish.trim()) return errorResponse("Dish name is required", 400);
    const priceRange = String(body?.price_range ?? "medium").slice(0, 40);

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) return errorResponse("AI is not configured", 500);

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
              { role: "user", content: `Dish: ${dish}. Budget level: ${priceRange}.` },
            ],
            max_tokens: 1500,
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
      console.error("[suggest-wine-pairing] AI failed", lastError);
      return errorResponse("AI is busy right now. No credits were charged — please try again in a moment.", 503);
    }

    const parsed = safeJson(text);
    const pairings = Array.isArray(parsed?.pairings) ? parsed.pairings : null;
    if (!pairings) return errorResponse("The AI returned an unreadable pairing. No credits were charged — please try again.", 502);

    const creditDenied = await deductAICredits(user.id, COST, "suggest-wine-pairing");
    if (creditDenied) return creditDenied;

    return jsonResponse({ success: true, pairings });
  } catch (e: any) {
    console.error("[suggest-wine-pairing] error", e);
    return errorResponse(e?.message || "Function failed");
  }
});
