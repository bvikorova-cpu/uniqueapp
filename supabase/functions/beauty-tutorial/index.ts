import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { requireAiCredits } from "../_shared/credit-check.ts";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { lookDescription } = await req.json();
    if (!lookDescription || !lookDescription.trim()) {
      return new Response(JSON.stringify({ error: "lookDescription required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const auth = await requireAiCredits(req, corsHeaders, {
      credits: 2, usageType: "beauty_tutorial",
    });
    if (auth.errorResponse) return auth.errorResponse;
    const { user, supabase, deduct } = auth;

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("AI service not configured");

    const prompt = `Create a step-by-step makeup tutorial for: "${lookDescription}". Return STRICT JSON:
{
  "title":"",
  "difficulty":"beginner|intermediate|advanced",
  "estimatedTime":"",
  "tools": [""],
  "products": [{"name":"","purpose":""}],
  "steps": [{"step":1,"title":"","instruction":"","tip":""}],
  "finishingTips": [""]
}`;

    const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_completion_tokens: 2000,
        response_format: { type: "json_object" },
      }),
    });
    if (!aiRes.ok) {
      const t = await aiRes.text();
      console.error("OpenAI error:", aiRes.status, t);
      if (aiRes.status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error(`AI failed: ${t.slice(0, 200)}`);
    }
    const data = await aiRes.json();
    const text = data.choices?.[0]?.message?.content || "{}";
    let tutorial: any = {};
    try { tutorial = JSON.parse(text); } catch { tutorial = { raw: text }; }

    await deduct!();
    await supabase!.from("beauty_tutorials").insert({
      user_id: user!.id,
      look_description: lookDescription,
      tutorial_steps: tutorial.steps || tutorial,
      products_needed: tutorial.products || [],
      difficulty_level: tutorial.difficulty || null,
      credits_used: 2,
    });

    return new Response(JSON.stringify({ tutorial }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("beauty-tutorial error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
