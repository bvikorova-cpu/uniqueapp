import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const COST = 10;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
    if (authError || !user) throw new Error("Unauthorized");

    const { dream_text } = await req.json();
    if (!dream_text || typeof dream_text !== "string" || dream_text.length < 10) {
      throw new Error("Please describe your dream in at least 10 characters.");
    }

    // Check & deduct credits
    const { data: credits } = await supabase.from("ai_credits").select("credits_remaining").eq("user_id", user.id).single();
    const remaining = credits?.credits_remaining || 0;
    if (remaining < COST) throw new Error(`Insufficient credits. Need ${COST}, have ${remaining}.`);

    // Insert pending row
    const { data: row, error: insErr } = await supabase
      .from("wellness_dream_interpretations")
      .insert({ user_id: user.id, dream_text, status: "processing", credits_used: COST })
      .select().single();
    if (insErr) throw insErr;

    // 1. Get interpretation via Lovable AI (structured tool call)
    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a compassionate dream analyst combining Jungian psychology, modern neuroscience, and gentle spiritual insight. Provide warm, non-judgmental interpretations." },
          { role: "user", content: `Interpret this dream: ${dream_text}` },
        ],
        tools: [{
          type: "function",
          function: {
            name: "interpret_dream",
            description: "Return structured dream interpretation",
            parameters: {
              type: "object",
              properties: {
                interpretation: { type: "string", description: "2-3 paragraph compassionate interpretation" },
                symbols: { type: "array", items: { type: "object", properties: { symbol: { type: "string" }, meaning: { type: "string" } }, required: ["symbol", "meaning"] } },
                emotional_themes: { type: "array", items: { type: "string" } },
                illustration_prompt: { type: "string", description: "Surreal dreamlike art prompt for image generation, ethereal, soft, no text" },
              },
              required: ["interpretation", "symbols", "emotional_themes", "illustration_prompt"],
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "interpret_dream" } },
      }),
    });

    if (!aiResp.ok) {
      const t = await aiResp.text();
      console.error("AI gateway error:", aiResp.status, t);
      if (aiResp.status === 429) throw new Error("AI rate limit exceeded, please try again shortly.");
      if (aiResp.status === 402) throw new Error("AI credits exhausted, please top up.");
      throw new Error("AI interpretation failed");
    }

    const aiData = await aiResp.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    const parsed = toolCall ? JSON.parse(toolCall.function.arguments) : {};

    // 2. Generate illustration
    let illustrationUrl: string | null = null;
    try {
      const imgResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-image",
          messages: [{ role: "user", content: `Surreal dreamlike illustration: ${parsed.illustration_prompt}. Soft pastel colors, ethereal mist, no text, no people's faces clearly visible.` }],
          modalities: ["image", "text"],
        }),
      });
      if (imgResp.ok) {
        const imgData = await imgResp.json();
        illustrationUrl = imgData.choices?.[0]?.message?.images?.[0]?.image_url?.url || null;
      }
    } catch (e) {
      console.error("Illustration generation failed:", e);
    }

    // 3. Update row + deduct credits
    await supabase.from("wellness_dream_interpretations").update({
      interpretation: parsed.interpretation,
      symbols: parsed.symbols || [],
      emotional_themes: parsed.emotional_themes || [],
      illustration_url: illustrationUrl,
      status: "completed",
    }).eq("id", row.id);

    await supabase.from("ai_credits").update({ credits_remaining: remaining - COST, last_used_at: new Date().toISOString() }).eq("user_id", user.id);

    return new Response(JSON.stringify({ id: row.id, ...parsed, illustration_url: illustrationUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("wellness-dream-interpreter error:", e);
    return new Response(JSON.stringify({ error: e.message }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
