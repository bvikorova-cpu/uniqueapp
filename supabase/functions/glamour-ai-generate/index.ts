import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { requireAiCredits } from "../_shared/credit-check.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const __auth = await requireAiCredits(req, corsHeaders, { credits: 1, usageType: "glamour_ai" });
    if (__auth.errorResponse) return __auth.errorResponse;
    const __deduct = __auth.deduct!;

    const body = await req.json();
    const { type, prompt, coins } = body ?? {};

    // Per-call Glamour Coins cost (clamped 1..10). Defaults to 3 if omitted.
    const coinsCost = Math.max(1, Math.min(10, Number(coins) || 3));

    // Atomic deduction of Glamour Coins via SECURITY DEFINER RPC (uses caller JWT).
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
    });

    const { data: newBalance, error: spendErr } = await userClient.rpc("spend_glamour_coins", {
      _amount: coinsCost,
    });

    if (spendErr) {
      const msg = spendErr.message || "";
      if (msg.includes("insufficient_glamour_coins")) {
        return new Response(
          JSON.stringify({
            error: "insufficient_glamour_coins",
            message: `Need ${coinsCost} Glamour Coins to use this tool.`,
            coinsRequired: coinsCost,
          }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      console.error("spend_glamour_coins error:", spendErr);
      return new Response(JSON.stringify({ error: msg || "coin_deduction_failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) throw new Error("AI service not configured");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${openaiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a magical, creative AI assistant for Glamour World - a fun, girly platform. Be enthusiastic, creative, and detailed. Use emojis sparingly. Provide practical, actionable content." },
          { role: "user", content: prompt },
        ],
        max_completion_tokens: 1500,
      }),
    });

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content || "No result generated";

    await __deduct().catch((e) => console.error("deduct failed:", e));
    return new Response(
      JSON.stringify({ result, type, coinsSpent: coinsCost, coinsBalance: newBalance }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
