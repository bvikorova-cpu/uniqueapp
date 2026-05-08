import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { requireAiCredits } from "../_shared/credit-check.ts";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { skinType, age, concerns, currentRoutine } = await req.json();

    const auth = await requireAiCredits(req, corsHeaders, {
      credits: 8, usageType: "beauty_skin_analysis",
    });
    if (auth.errorResponse) return auth.errorResponse;
    const { user, supabase, deduct } = auth;

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("AI service not configured");

    const prompt = `As a dermatology-aware AI skincare advisor (no medical claims), build a personalized routine for:
- Skin type: ${skinType}
- Age: ${age}
- Concerns: ${(concerns || []).join(", ") || "none"}
- Current routine: ${currentRoutine || "none"}

Return STRICT JSON only:
{
  "morning": [{"step":"","product":"","why":""}],
  "evening": [{"step":"","product":"","why":""}],
  "weekly": [{"step":"","product":"","why":""}],
  "ingredients_to_seek": [""],
  "ingredients_to_avoid": [""],
  "lifestyle_tips": [""]
}`;

    const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_completion_tokens: 2500,
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
    let recs: any = {};
    try { recs = JSON.parse(text); } catch { recs = { raw: text }; }

    await deduct!();
    await supabase!.from("beauty_skin_analyses").insert({
      user_id: user!.id, skin_type: skinType, age: String(age || ""),
      concerns: concerns || [], current_routine: currentRoutine || null,
      recommendations: recs, credits_used: 8,
    });

    return new Response(JSON.stringify({ recommendations: recs }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("beauty-skin-analysis error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
