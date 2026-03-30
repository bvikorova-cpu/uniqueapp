import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { userId, itemId, itemName, style, customPrompt } = await req.json();
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OpenAI API key not configured");

    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // Check credits
    const { data: credits } = await supabase.from("ai_credits").select("*").eq("user_id", userId).single();
    if (!credits || credits.credits_remaining < 12) {
      return new Response(JSON.stringify({ error: "Insufficient credits. 12 required." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const prompt = `You are an AI item customizer for a digital collectibles platform. Customize this collectible:
Item: ${itemName}
Style: ${style}
${customPrompt ? `Additional modifications: ${customPrompt}` : ""}

Return a JSON object with:
- newDescription: A vivid enhanced description of the customized item (2-3 sentences)
- styleApplied: The visual style name that was applied
- rarityBoost: Whether this customization increased rarity and why (1 sentence)
- visualEffects: Array of 3-5 visual effect names added (e.g., "Holographic Shimmer", "Neon Glow")`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      }),
    });

    const aiData = await response.json();
    const result = JSON.parse(aiData.choices[0].message.content);

    // Deduct credits
    await supabase.from("ai_credits").update({ credits_remaining: credits.credits_remaining - 12 }).eq("user_id", userId);
    await supabase.from("ai_usage_history").insert({ user_id: userId, usage_type: "collectible_customize", credits_used: 12, description: `Customized ${itemName} with ${style} style` });

    return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
