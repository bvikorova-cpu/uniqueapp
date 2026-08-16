import "../_shared/aiRedirect.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { callOpenAI, corsHeaders, errorResponse, jsonResponse } from "../_shared/openai.ts";
import { deductAICredits } from "../_shared/credits.ts";

const COST = 3;

const RECIPE_SYSTEM = `You are a professional chef. Return ONLY raw JSON (no markdown fences) in exactly this shape:
{ "recipes": [{ "name": string, "description": string, "prep_time": string, "difficulty": string, "ingredients": string[], "steps": string[] }] }
Give exactly 3 creative recipes that use mostly the supplied ingredients. Keep descriptions appetising and concise.`;

const CHEF_SYSTEM = `You are a warm, expert personal chef. Answer cooking questions clearly with practical steps,
timings, temperatures and substitutions. Use short markdown sections and lists. Never mention being an AI model.`;

const WINE_SYSTEM = `You are a master sommelier. Recommend drink pairings for the given dish.
Use markdown: a short intro, then 3 pairings (wine/beer/non-alcoholic) each with grape or style,
why it works, serving temperature and an approximate price band in EUR.`;

function safeJson(text: string) {
  const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  try { return JSON.parse(cleaned); } catch { /* fallthrough */ }
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start >= 0 && end > start) {
    try { return JSON.parse(cleaned.slice(start, end + 1)); } catch { /* fallthrough */ }
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
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return errorResponse("Not authenticated", 401);

    const body = await req.json().catch(() => ({}));
    const action = String(body?.action ?? "recipe");

    if (action === "recipe") {
      const ingredients: string[] = Array.isArray(body?.ingredients)
        ? body.ingredients.map((i: unknown) => String(i).slice(0, 80)).slice(0, 30)
        : [];
      if (ingredients.length === 0) return errorResponse("Add at least one ingredient", 400);
      const dietary: string[] = Array.isArray(body?.dietary_preferences)
        ? body.dietary_preferences.map((d: unknown) => String(d).slice(0, 40)).slice(0, 10)
        : [];

      const text = await callOpenAI({
        system: RECIPE_SYSTEM,
        user: `Ingredients: ${ingredients.join(", ")}.${dietary.length ? ` Dietary preferences: ${dietary.join(", ")}.` : ""}`,
        json: true,
        temperature: 0.8,
        maxTokens: 3000,
      });

      const parsed = safeJson(text ?? "");
      const recipes = Array.isArray(parsed?.recipes) ? parsed.recipes : null;
      if (!recipes) {
        return errorResponse("The AI returned unreadable recipes. No credits were charged — please try again.", 502);
      }

      const denied = await deductAICredits(user.id, COST, "cooking-recipe");
      if (denied) return denied;
      return jsonResponse({ success: true, recipes: { recipes }, credits_used: COST });
    }

    if (action === "chef-chat") {
      const message = String(body?.message ?? "").slice(0, 4000);
      if (!message.trim()) return errorResponse("Ask the chef a question", 400);
      const history = Array.isArray(body?.history)
        ? body.history.slice(-8).map((m: any) => `${m?.role === "assistant" ? "Chef" : "Guest"}: ${String(m?.content ?? "").slice(0, 800)}`).join("\n")
        : "";

      const reply = await callOpenAI({
        system: CHEF_SYSTEM,
        user: `${history ? `Conversation so far:\n${history}\n\n` : ""}Guest: ${message}`,
        temperature: 0.7,
        maxTokens: 2000,
      });
      if (!reply) return errorResponse("AI is busy right now. No credits were charged — please try again.", 503);

      const denied = await deductAICredits(user.id, COST, "cooking-chef-chat");
      if (denied) return denied;
      return jsonResponse({ success: true, reply, message: reply, response: reply, credits_used: COST });
    }

    if (action === "wine-pairing") {
      const dish = String(body?.dish ?? body?.dish_name ?? "").slice(0, 500);
      if (!dish.trim()) return errorResponse("Enter a dish first", 400);
      const notes = String(body?.notes ?? body?.preferences ?? "").slice(0, 500);

      const reply = await callOpenAI({
        system: WINE_SYSTEM,
        user: `Dish: ${dish}.${notes ? ` Preferences: ${notes}.` : ""}`,
        temperature: 0.7,
        maxTokens: 2000,
      });
      if (!reply) return errorResponse("AI is busy right now. No credits were charged — please try again.", 503);

      const denied = await deductAICredits(user.id, COST, "cooking-wine-pairing");
      if (denied) return denied;
      return jsonResponse({ success: true, pairing: reply, reply, message: reply, credits_used: COST });
    }

    return errorResponse("Unknown action", 400);
  } catch (e: any) {
    console.error("[cooking-ai] error", e);
    return errorResponse(e?.message || "Function failed");
  }
});
