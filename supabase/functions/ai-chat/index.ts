import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { requireAiCredits } from "../_shared/credit-check.ts";
import { callOpenAI } from "../_shared/openai.ts";

const corsHeaders = { "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const __auth = await requireAiCredits(req, corsHeaders, { credits: 1, usageType: "ai_chat" });
    if (__auth.errorResponse) return __auth.errorResponse;
    const __deduct = __auth.deduct!;
    const { messages, systemPrompt } = await req.json();

    const response = await callOpenAI({
      messages: [
        { role: "system", content: systemPrompt || "You are a helpful assistant." },
        ...messages,
      ],
      model: "gpt-4o-mini",
      max_completion_tokens: 1000,
    });

    await __deduct().catch((e) => console.error("deduct failed:", e));
    return new Response(JSON.stringify({ response }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
