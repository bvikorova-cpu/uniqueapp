import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { requireAiCredits } from "../_shared/credit-check.ts";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { skinType, hairType, concerns } = await req.json();

    const auth = await requireAiCredits(req, corsHeaders, {
      credits: 3, usageType: "beauty_recommendations",
    });
    if (auth.errorResponse) return auth.errorResponse;
    const { user, supabase, deduct } = auth;

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("AI service not configured");

    const prompt = `You are a beauty expert. Recommend 5 skincare and 3 haircare products for:
- Skin type: ${skinType}
- Hair type: ${hairType}
- Concerns: ${(concerns || []).join(", ") || "none"}

Return STRICT JSON: { "skincare": [{"name":"","brand":"","purpose":"","priceRange":""}], "haircare": [{"name":"","brand":"","purpose":"","priceRange":""}], "tips": [""] }`;

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
    let recs: any = {};
    try { recs = JSON.parse(text); } catch { recs = { raw: text }; }

    await deduct!();
    await supabase!.from("beauty_product_recommendations").insert({
      user_id: user!.id, skin_type: skinType, hair_type: hairType,
      concerns: concerns || [], recommendations: recs, credits_used: 3,
    });

    return new Response(JSON.stringify({ recommendations: recs }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("beauty-recommendations error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
