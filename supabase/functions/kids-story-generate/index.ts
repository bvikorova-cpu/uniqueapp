import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { requireAiCredits } from "../_shared/credit-check.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const __auth = await requireAiCredits(req, corsHeaders, { credits: 1, usageType: "kids_story" });
    if (__auth.errorResponse) return __auth.errorResponse;
    const __deduct = __auth.deduct!;
    const { prompt, title } = await req.json();
    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) throw new Error("AI service not configured");

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${openaiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-5",
        messages: [
          { role: "system", content: "You are a children's story writer. Write gentle, magical bedtime stories suitable for children ages 3-10. Keep stories warm, positive, and with happy endings. Use simple language." },
          { role: "user", content: `Write a bedtime story titled "${title || 'A Magical Adventure'}". ${prompt || ''}` },
        ],
        max_completion_tokens: 1500,
      }),
    });

    const data = await res.json();
    const story = data.choices?.[0]?.message?.content || "";

    await __deduct().catch((e) => console.error("deduct failed:", e));
    return new Response(JSON.stringify({ title: title || "A Magical Adventure", story, content: story }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
