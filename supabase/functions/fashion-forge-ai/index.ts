import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { callCreativeAI, getUnifiedAiCreditBalance, isInsufficientCreditsError, spendUnifiedAiCredits } from "../_shared/creativeAI.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type FashionAction = "fashion_ootd" | "fashion_celebrity_clone" | "fashion_body_shape" | "fashion_sustainable";

const ACTIONS: Record<FashionAction, { cost: number; prompt: string }> = {
  fashion_ootd: {
    cost: 5,
    prompt: "You are an elite fashion critic. Return only valid JSON with overall_score, style_score, color_harmony_score, occasion_appropriateness_score, trend_relevance_score (all 1-100), strengths (array), improvements (array), styling_tips (array), style_tags (array), celebrity_match, and confidence_boost.",
  },
  fashion_celebrity_clone: {
    cost: 15,
    prompt: "You are a celebrity fashion analyst. Return only valid JSON with celebrity, look_description, style_era, difficulty_to_recreate, items (array containing original_item, brand, estimated_price, budget_alternative, budget_brand, budget_price, match_accuracy), total_original_cost, total_budget_cost, savings_percentage, styling_notes (array), and where_to_shop (array). Use EUR exclusively.",
  },
  fashion_body_shape: {
    cost: 8,
    prompt: "You are a body-positive fashion stylist. Return only valid JSON with shapeAnalysis, bestStyles, avoidStyles, and shoppingGuide. Never shame the user or make medical claims.",
  },
  fashion_sustainable: {
    cost: 6,
    prompt: "You are a sustainable fashion expert. Return only valid JSON with sustainabilityScore, swapSuggestions, ecoAlternatives, and actionPlan.",
  },
};

function buildPrompt(action: FashionAction, text: string, extra: Record<string, unknown>) {
  if (action === "fashion_ootd") return `Outfit: ${extra.outfitDescription ?? text}\nOccasion: ${extra.occasion ?? "Casual"}\nSeason: ${extra.season ?? "All-season"}`;
  if (action === "fashion_celebrity_clone") return `Celebrity: ${extra.celebrity ?? text}\nBudget level: ${extra.budget_level ?? "medium"}`;
  if (action === "fashion_body_shape") return `Height: ${extra.height ?? "not specified"} cm\nBody shape: ${extra.bodyShape ?? "not sure"}\nStyle goal: ${extra.styleGoal ?? "balanced"}`;
  return `Current wardrobe: ${extra.wardrobe ?? text}\nBudget preference: ${extra.budget ?? "moderate"}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !anonKey || !serviceRoleKey) throw new Error("Server configuration unavailable");
    const authClient = createClient(supabaseUrl, anonKey, { auth: { persistSession: false } });
    const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) throw new Error("Unauthorized");
    const { data: claimsData, error: claimsError } = await authClient.auth.getClaims(authHeader.slice(7));
    const userId = typeof claimsData?.claims?.sub === "string" ? claimsData.claims.sub : "";
    if (claimsError || !userId) throw new Error("Unauthorized");

    const body = await req.json();
    const action = body.action as FashionAction;
    const config = ACTIONS[action];
    if (!config) {
      return new Response(JSON.stringify({ error: `Unknown fashion action: ${String(body.action)}` }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const text = String(body.text ?? "").trim();
    if (!text) {
      return new Response(JSON.stringify({ error: "Text is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const extra = body.extra && typeof body.extra === "object" ? body.extra as Record<string, unknown> : {};
    const current = await getUnifiedAiCreditBalance(supabase, userId);
    if (current.total < config.cost) {
      return new Response(JSON.stringify({ error: "INSUFFICIENT_CREDITS", required: config.cost, available: current.total }), {
        status: 402,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let content: string;
    try {
      content = await callCreativeAI([
        { role: "system", content: config.prompt },
        { role: "user", content: buildPrompt(action, text, extra) },
      ]);
    } catch (error) {
      const aiError = error as { status?: number; message?: string };
      return new Response(JSON.stringify({ error: aiError.message ?? "AI request failed. Please try again." }), {
        status: aiError.status ?? 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let parsed: Record<string, unknown> | null = null;
    try {
      const match = content.match(/\{[\s\S]*\}$/m) ?? content.match(/\{[\s\S]*\}/);
      parsed = match ? JSON.parse(match[0]) : null;
    } catch {
      parsed = null;
    }

    const spendResult = await spendUnifiedAiCredits(supabase, userId, config.cost, `creative_forge_${action}`, "fashion-forge-ai");
    return new Response(JSON.stringify({
      action,
      content,
      parsed,
      ...(parsed ?? {}),
      creditsUsed: config.cost,
      creditsRemaining: spendResult.total,
      freeCreditsRemaining: spendResult.free,
      paidCreditsRemaining: spendResult.paid,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    if (isInsufficientCreditsError(error)) {
      return new Response(JSON.stringify({ error: "INSUFFICIENT_CREDITS" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const errorDetails = error as { status?: number; code?: number | string; message?: string };
    const message = errorDetails?.message ?? "Internal error";
    console.error("fashion-forge-ai error", message);
    const throttled = Number(errorDetails?.status ?? errorDetails?.code) === 429 || /rate limit|too many requests/i.test(message);
    const status = message === "Unauthorized" ? 401 : throttled ? 503 : 500;
    const responseMessage = throttled ? "Fashion AI is temporarily busy. Please try again shortly. No credits were used." : message;
    return new Response(JSON.stringify({ error: responseMessage }), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});