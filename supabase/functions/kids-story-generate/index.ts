import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { requireAiCredits } from "../_shared/credit-check.ts";
import { callOpenAI } from "../_shared/openai.ts";

const corsHeaders = { "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const __auth = await requireAiCredits(req, corsHeaders, { credits: 8, usageType: "kids_story" });
    if (__auth.errorResponse) return __auth.errorResponse;
    const __deduct = __auth.deduct!;
    const { prompt, title } = await req.json();

    const story = await callOpenAI({
      system: "You are a children's story writer. Write gentle, magical bedtime stories suitable for children ages 3-10. Keep stories warm, positive, and with happy endings. Use simple language.",
      user: `Write a bedtime story titled "${title || "A Magical Adventure"}". ${prompt || ""}`,
      model: "gpt-4o-mini",
      max_completion_tokens: 1500,
    });

    await __deduct().catch((e) => console.error("deduct failed:", e));
    return new Response(JSON.stringify({ title: title || "A Magical Adventure", story, content: story }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
