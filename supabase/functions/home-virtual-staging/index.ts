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
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    if (authError || !user) throw new Error("Unauthorized");

    const { originalImageUrl, roomType, stagingStyle, propertyType } = await req.json();
    if (!originalImageUrl) throw new Error("Image URL is required");

    const { data: credits } = await supabase
      .from("decor_subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (!credits || credits.designs_used >= credits.designs_limit) {
      throw new Error("Insufficient credits. Please subscribe to Pro Designer.");
    }

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OpenAI API key not configured");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a professional virtual home stager for real estate. Generate a detailed staging plan for empty or minimally furnished rooms. Return JSON:
{
  "staging_plan": {
    "furniture_placement": [
      { "item": "Item name", "position": "Where to place", "purpose": "Why this item" }
    ],
    "color_scheme": { "walls": "#hex", "accents": "#hex", "textiles": "#hex" },
    "lighting_plan": "Lighting setup description",
    "accessories": ["item1", "item2"],
    "target_buyer": "Who this staging appeals to",
    "estimated_staging_cost": "€XXX-€XXX",
    "roi_estimate": "Expected value increase",
    "photography_tips": "Best angles for listing photos"
  }
}`
          },
          {
            role: "user",
            content: `Create a virtual staging plan. Room type: ${roomType || "living room"}. Style: ${stagingStyle || "contemporary"}. Property type: ${propertyType || "apartment"}. Room image: ${originalImageUrl}`
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) throw new Error("AI generation failed");

    const aiData = await response.json();
    const content = aiData.choices[0].message.content;
    
    let stagingData;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      stagingData = JSON.parse(jsonMatch ? jsonMatch[0] : content);
    } catch {
      stagingData = { staging_plan: { description: content } };
    }

    const { data: saved, error: saveError } = await supabase
      .from("home_virtual_staging")
      .insert({
        user_id: user.id,
        original_image_url: originalImageUrl,
        room_type: roomType,
        staging_style: stagingStyle,
        property_type: propertyType,
      })
      .select()
      .single();

    if (saveError) throw saveError;

    await supabase
      .from("decor_subscriptions")
      .update({ designs_used: credits.designs_used + 1 })
      .eq("user_id", user.id);

    return new Response(JSON.stringify({ success: true, data: saved, stagingData }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
