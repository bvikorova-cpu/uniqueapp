import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { requireAiCredits } from "../_shared/credit-check.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const __auth = await requireAiCredits(req, corsHeaders, { credits: 1, usageType: "ai_chat" });
    if (__auth.errorResponse) return __auth.errorResponse;
    const __deduct = __auth.deduct!;
    const { messages, systemPrompt } = await req.json();
    const openaiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!openaiKey) throw new Error("AI service not configured");

    const allMessages = [
      { role: "system", content: systemPrompt || "You are a helpful assistant." },
      ...messages,
    ];

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${openaiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "google/gemini-2.5-flash", messages: allMessages, max_tokens: 1000 }),
    });

    const data = await res.json();
    const response = data.choices?.[0]?.message?.content || "I'm here to help.";

    await __deduct().catch((e) => console.error("deduct failed:", e));
    return new Response(JSON.stringify({ response }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
