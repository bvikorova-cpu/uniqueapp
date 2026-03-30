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

    const { brandName, industry, tone, targetAudience } = await req.json();

    const { data: credits } = await supabase
      .from("ai_credits")
      .select("credits_remaining")
      .eq("user_id", user.id)
      .single();

    if (!credits || credits.credits_remaining < 10) {
      return new Response(JSON.stringify({ error: "Insufficient credits. You need 10 credits." }), {
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
            content: `You are a social media branding expert. Generate complete social media kits for brands. Return JSON with "platforms" object containing keys for "instagram", "twitter", "linkedin", "tiktok", "facebook". Each platform object should have: "bio" (max 160 chars), "handle_suggestions" (array of 3), "content_pillars" (array of 4), "hashtags" (array of 10), "posting_schedule" (string), "content_ideas" (array of 5), "tone_guidelines" (string).`
          },
          {
            role: "user",
            content: `Generate a complete social media kit for "${brandName}" in the ${industry} industry. Brand tone: ${tone || 'professional and modern'}. Target audience: ${targetAudience || 'general'}.`
          }
        ],
        response_format: { type: "json_object" },
      }),
    });

    const aiData = await openaiRes.json();
    const kit = JSON.parse(aiData.choices[0].message.content);

    await supabase.from("ai_credits").update({
      credits_remaining: credits.credits_remaining - 10,
    }).eq("user_id", user.id);

    await supabase.from("brand_social_media_kits").insert({
      user_id: user.id,
      brand_name: brandName,
      industry,
      platforms: kit.platforms,
      credits_used: 10,
    });

    return new Response(JSON.stringify(kit), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
