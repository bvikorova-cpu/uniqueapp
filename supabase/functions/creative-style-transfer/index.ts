import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const STYLE_COST = 8;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const lovableKey = Deno.env.get("LOVABLE_API_KEY")!;
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new Response(JSON.stringify({ error: "No auth" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const supabase = createClient(supabaseUrl, serviceKey);
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { text, targetStyle } = await req.json();
    if (!text || !targetStyle) return new Response(JSON.stringify({ error: "Missing text or style" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { data: credits } = await supabase
      .from("creative_forge_credits")
      .select("credits_remaining")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!credits || credits.credits_remaining < STYLE_COST) {
      return new Response(JSON.stringify({ error: "Insufficient credits", required: STYLE_COST }), {
        status: 402,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = `You are a master literary stylist. Rewrite the given text in the unmistakable style of ${targetStyle}.
Preserve the original meaning, story beats and characters. Mimic vocabulary, rhythm, sentence length, dialogue patterns and signature devices.
Return ONLY the rewritten text, no commentary, no preamble.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${lovableKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: text },
        ],
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) return new Response(JSON.stringify({ error: "Rate limited" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (aiResponse.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error("AI gateway error");
    }

    const data = await aiResponse.json();
    const rewritten = data.choices?.[0]?.message?.content || "";

    await supabase.from("creative_forge_credits").update({
      credits_remaining: credits.credits_remaining - STYLE_COST,
    }).eq("user_id", user.id);

    return new Response(JSON.stringify({ rewritten, creditsUsed: STYLE_COST, creditsRemaining: credits.credits_remaining - STYLE_COST }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("style-transfer error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
