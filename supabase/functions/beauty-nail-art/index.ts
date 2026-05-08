import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { requireAiCredits } from "../_shared/credit-check.ts";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { style, occasion, shape } = await req.json();

    const auth = await requireAiCredits(req, corsHeaders, {
      credits: 5, usageType: "beauty_nail_art",
    });
    if (auth.errorResponse) return auth.errorResponse;
    const { user, supabase, deduct } = auth;

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("AI service not configured");

    const textPrompt = `Design a nail-art set. Style: ${style}. Occasion: ${occasion}. Shape: ${shape}. Return STRICT JSON:
{
  "name":"",
  "description":"",
  "colors": [""],
  "techniques": [""],
  "stepByStep": [""],
  "estimatedTime":"",
  "difficulty":""
}`;

    // Text plan
    const txtRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: textPrompt }],
        max_completion_tokens: 1500,
        response_format: { type: "json_object" },
      }),
    });
    if (!txtRes.ok) {
      const t = await txtRes.text();
      console.error("OpenAI text error:", txtRes.status, t);
      if (txtRes.status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error(`AI failed: ${t.slice(0, 200)}`);
    }
    const txtData = await txtRes.json();
    const text = txtData.choices?.[0]?.message?.content || "{}";
    let plan: any = {};
    try { plan = JSON.parse(text); } catch { plan = { raw: text }; }

    // Image
    let previewImage: string | null = null;
    try {
      const imgRes = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "gpt-image-1",
          prompt: `Photorealistic close-up of a hand with ${shape}-shaped ${style} nail art for ${occasion}. Studio lighting, magazine quality.`,
          n: 1,
          size: "1024x1024",
        }),
      });
      if (imgRes.ok) {
        const d = await imgRes.json();
        const b64 = d.data?.[0]?.b64_json;
        previewImage = b64 ? `data:image/png;base64,${b64}` : (d.data?.[0]?.url || null);
      } else {
        console.warn("nail image gen failed status:", imgRes.status);
      }
    } catch (e) { console.warn("nail image gen failed:", e); }

    const design = { ...plan, previewImage };

    await deduct!();
    await supabase!.from("beauty_nail_designs").insert({
      user_id: user!.id, style, occasion, shape, design, credits_used: 5,
    });

    return new Response(JSON.stringify({ design }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("beauty-nail-art error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
