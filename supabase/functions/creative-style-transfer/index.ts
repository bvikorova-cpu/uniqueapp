import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { callCreativeAI, CreativeAIError, getUnifiedAiCreditBalance, isInsufficientCreditsError, spendUnifiedAiCredits } from "../_shared/creativeAI.ts";

const corsHeaders = { "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };

const STYLE_COST = 8;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new Response(JSON.stringify({ error: "No auth" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const supabase = createClient(supabaseUrl, serviceKey);
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } } });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { text, targetStyle } = await req.json();
    if (!text || !targetStyle) return new Response(JSON.stringify({ error: "Missing text or style" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const credits = await getUnifiedAiCreditBalance(supabase, user.id);
    if (credits.total < STYLE_COST) {
      return new Response(JSON.stringify({ error: "INSUFFICIENT_CREDITS", required: STYLE_COST, available: credits.total }), {
        status: 402,
        headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const systemPrompt = `You are a master literary stylist. Rewrite the given text in the unmistakable style of ${targetStyle}.
Preserve the original meaning, story beats and characters. Mimic vocabulary, rhythm, sentence length, dialogue patterns and signature devices.
Return ONLY the rewritten text, no commentary, no preamble.`;

    const rewrittenRaw = await callCreativeAI([
      { role: "system", content: systemPrompt },
      { role: "user", content: text },
    ]);

    const rewritten = rewrittenRaw;

    const spendResult = await spendUnifiedAiCredits(supabase, user.id, STYLE_COST, "creative_forge_style_transfer", "creative-style-transfer");

    return new Response(JSON.stringify({ rewritten, creditsUsed: STYLE_COST, creditsRemaining: spendResult.total, freeCreditsRemaining: spendResult.free, paidCreditsRemaining: spendResult.paid }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("style-transfer error:", e);
    if (isInsufficientCreditsError(e)) {
      return new Response(JSON.stringify({ error: "INSUFFICIENT_CREDITS" }), {
        status: 402,
        headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: e instanceof CreativeAIError ? e.status : 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
