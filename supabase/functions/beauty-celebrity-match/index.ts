import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { requireAiCredits } from "../_shared/credit-check.ts";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { imageUrl, gender, style } = await req.json();
    if (!imageUrl) {
      return new Response(JSON.stringify({ error: "imageUrl required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const auth = await requireAiCredits(req, corsHeaders, {
      credits: 10, usageType: "beauty_celebrity_match",
    });
    if (auth.errorResponse) return auth.errorResponse;
    const { user, supabase, deduct } = auth;

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("AI service not configured");

    const prompt = `Analyze this person's facial features and match them to 3 ${gender || "any"} celebrities with a ${style || "any"} style. For entertainment only — no claims of identity. Return STRICT JSON:
{
  "topMatch": {"name":"","matchPercent":0,"signatureLook":"","whyMatch":""},
  "alternatives": [{"name":"","matchPercent":0,"signatureLook":""}],
  "styleAdvice": {"makeup":"","hair":"","outfit":""},
  "products": [""]
}`;

    const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-5",
        messages: [{
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: imageUrl } },
          ],
        }],
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
    let result: any = {};
    try { result = JSON.parse(text); } catch { result = { raw: text }; }

    await deduct!();
    await supabase!.from("beauty_celebrity_matches").insert({
      user_id: user!.id, source_image_url: imageUrl,
      gender: gender || null, style: style || null,
      match_result: result, credits_used: 10,
    });

    return new Response(JSON.stringify({ matchResult: result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("beauty-celebrity-match error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
