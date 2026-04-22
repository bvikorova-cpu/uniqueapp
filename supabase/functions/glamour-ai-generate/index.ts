import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
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
    const { type, prompt } = await req.json();
    const openaiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!openaiKey) throw new Error("AI service not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${openaiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a magical, creative AI assistant for Glamour World - a fun, girly platform. Be enthusiastic, creative, and detailed. Use emojis sparingly. Provide practical, actionable content." },
          { role: "user", content: prompt },
        ],
        max_tokens: 1500,
        temperature: 0.8,
      }),
    });

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content || "No result generated";

    return new Response(JSON.stringify({ result }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
