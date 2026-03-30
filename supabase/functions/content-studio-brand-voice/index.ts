import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Not authenticated");
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) throw new Error("Not authenticated");

    const { voiceId, prompt } = await req.json();
    const CREDIT_COST = 5;

    // Get brand voice
    const { data: voice } = await supabase.from("brand_voices").select("*").eq("id", voiceId).eq("user_id", user.id).single();
    if (!voice) throw new Error("Brand voice not found");

    // Check credits
    const { data: credits } = await supabase.from("ai_credits").select("credits_remaining").eq("user_id", user.id).single();
    if (!credits || credits.credits_remaining < CREDIT_COST) {
      return new Response(JSON.stringify({ error: "Insufficient credits. Please purchase more." }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = `You are a content writer that perfectly matches a specific brand voice. Here is the brand profile:

Brand: ${voice.brand_name}
Tone: ${voice.tone}
Style Notes: ${voice.style_notes || "None"}
Sample Content for Reference: ${voice.sample_content || "None provided"}

Write content that perfectly matches this brand's voice, tone, and style. Be consistent with the examples provided.`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
      }),
    });

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content;
    if (!content) throw new Error("Failed to generate content");

    await supabase.from("ai_credits").update({
      credits_remaining: credits.credits_remaining - CREDIT_COST,
      last_used_at: new Date().toISOString(),
    }).eq("user_id", user.id);

    await supabase.from("ai_usage_history").insert({
      user_id: user.id, usage_type: "brand_voice_generation", credits_used: CREDIT_COST,
      description: `Brand voice: ${voice.brand_name}`,
    });

    return new Response(JSON.stringify({ content, creditsUsed: CREDIT_COST }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
