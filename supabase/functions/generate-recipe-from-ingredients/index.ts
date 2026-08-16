import "../_shared/aiRedirect.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { corsHeaders, errorResponse, jsonResponse } from "../_shared/openai.ts";
import { deductAICredits } from "../_shared/credits.ts";

const COST = 3;

const SYSTEM = `You are a professional chef. Return ONLY raw JSON (no markdown fences) in exactly this shape:
{ "recipes": [{ "name": string, "description": string, "prep_time": string, "difficulty": string, "ingredients": string[], "steps": string[] }] }
Give exactly 3 creative recipes that use mostly the supplied ingredients. Keep descriptions appetising and concise.`;

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
    const ingredients: string[] = Array.isArray(body?.ingredients)
      ? body.ingredients.map((i: unknown) => String(i).slice(0, 80)).slice(0, 30)
      : [];
    if (ingredients.length === 0) return errorResponse("Add at least one ingredient", 400);
    const dietary: string[] = Array.isArray(body?.dietary_preferences)
      ? body.dietary_preferences.map((d: unknown) => String(d).slice(0, 40)).slice(0, 10)
      : [];

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
              {
                role: "user",
                content: `Ingredients: ${ingredients.join(", ")}.${dietary.length ? ` Dietary preferences: ${dietary.join(", ")}.` : ""}`,
              },
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
      console.error("[generate-recipe-from-ingredients] AI failed", lastError);
      return errorResponse("AI is busy right now. No credits were charged — please try again in a moment.", 503);
    }

    const parsed = safeJson(text);
    const recipes = Array.isArray(parsed?.recipes) ? parsed.recipes : null;
    if (!recipes) return errorResponse("The AI returned unreadable recipes. No credits were charged — please try again.", 502);

    const creditDenied = await deductAICredits(user.id, COST, "generate-recipe-from-ingredients");
    if (creditDenied) return creditDenied;

    return jsonResponse({ success: true, recipes: { recipes } });
  } catch (e: any) {
    console.error("[generate-recipe-from-ingredients] error", e);
    return errorResponse(e?.message || "Function failed");
  }
});
