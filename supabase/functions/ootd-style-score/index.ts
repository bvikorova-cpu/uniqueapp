import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import {
  callCreativeAI,
  getUnifiedAiCreditBalance,
  isInsufficientCreditsError,
  spendUnifiedAiCredits,
} from "../_shared/creativeAI.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CREDIT_COST = 5;
const systemPrompt = "You are an elite fashion critic. Return only valid JSON with overall_score, style_score, color_harmony_score, occasion_appropriateness_score, trend_relevance_score (all 1-100), strengths (array), improvements (array), styling_tips (array), style_tags (array), celebrity_match, and confidence_boost.";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRoleKey) return json({ error: "Server configuration unavailable" }, 500);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.slice(7));
    if (authError || !user) return json({ error: "Unauthorized" }, 401);

    const body = await req.json();
    const description = String(body.description ?? "").trim();
    const occasion = String(body.occasion ?? "Casual").trim();
    const season = String(body.season ?? "All-season").trim();
    if (!description || description.length > 3000) return json({ error: "A valid outfit description is required" }, 400);

    const balance = await getUnifiedAiCreditBalance(supabase, user.id);
    if (balance.total < CREDIT_COST) {
      return json({ error: "INSUFFICIENT_CREDITS", required: CREDIT_COST, available: balance.total }, 402);
    }

    let content: string;
    try {
      content = await callCreativeAI([
        { role: "system", content: systemPrompt },
        { role: "user", content: `Outfit: ${description}\nOccasion: ${occasion || "Casual"}\nSeason: ${season || "All-season"}` },
      ]);
    } catch (error) {
      const aiError = error as { status?: number; message?: string };
      return json({ error: aiError.message ?? "AI request failed. Please try again." }, aiError.status ?? 502);
    }

    const match = content.match(/\{[\s\S]*\}$/m) ?? content.match(/\{[\s\S]*\}/);
    if (!match) return json({ error: "AI returned an invalid outfit score. Please try again." }, 502);

    let score: Record<string, unknown>;
    try {
      score = JSON.parse(match[0]);
    } catch {
      return json({ error: "AI returned an invalid outfit score. Please try again." }, 502);
    }

    const spend = await spendUnifiedAiCredits(supabase, user.id, CREDIT_COST, "fashion_ootd", "ootd-style-score");
    return json({
      score,
      creditsUsed: CREDIT_COST,
      creditsRemaining: spend.total,
      freeCreditsRemaining: spend.free,
      paidCreditsRemaining: spend.paid,
    });
  } catch (error) {
    if (isInsufficientCreditsError(error)) return json({ error: "INSUFFICIENT_CREDITS" }, 402);
    console.error("ootd-style-score error", error);
    return json({ error: error instanceof Error ? error.message : "Internal error" }, 500);
  }
});