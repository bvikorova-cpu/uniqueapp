import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const authHeader = req.headers.get("Authorization")!;
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
    if (authError || !user) throw new Error("Unauthorized");

    const { industry, style, keywords } = await req.json();

    const { data: credits } = await supabase
      .from("ai_credits")
      .select("credits_remaining")
      .eq("user_id", user.id)
      .single();

    if (!credits || credits.credits_remaining < 8) {
      return new Response(JSON.stringify({ error: "Insufficient credits. You need 8 credits." }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a world-class brand naming expert. Generate creative, memorable, and unique brand names. Return JSON with a 'names' array of objects with 'name', 'meaning', 'domain_suggestion', and 'tagline' fields. Generate exactly 10 names."
          },
          {
            role: "user",
            content: `Generate brand names for a ${industry} business. Style: ${style}. Keywords/values: ${keywords || 'modern, professional'}. Names should be catchy, easy to pronounce, and available as domain names.`
          }
        ],
        response_format: { type: "json_object" },
      }),
    });

    const aiData = await openaiRes.json();
    const suggestions = JSON.parse(aiData.choices[0].message.content);

    await supabase.from("ai_credits").update({
      credits_remaining: credits.credits_remaining - 8,
    }).eq("user_id", user.id);

    await supabase.from("brand_name_suggestions").insert({
      user_id: user.id,
      industry,
      style,
      keywords,
      suggestions: suggestions.names,
      credits_used: 8,
    });

    return new Response(JSON.stringify(suggestions), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
