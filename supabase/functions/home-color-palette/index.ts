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

    const { roomImageUrl, roomType, mood } = await req.json();
    if (!roomImageUrl) throw new Error("Room image URL is required");

    // Check credits
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
            content: `You are an expert interior designer and color consultant. Analyze the room and generate a harmonious color palette. Return a JSON object with this structure:
{
  "palette": [
    { "name": "Color Name", "hex": "#XXXXXX", "usage": "Where to use this color", "percentage": 30 }
  ],
  "mood": "Overall mood description",
  "complementary_materials": ["material1", "material2"],
  "lighting_tips": "Lighting recommendation",
  "seasonal_variation": "How to adapt for different seasons"
}`
          },
          {
            role: "user",
            content: `Analyze this room and generate a professional color palette. Room type: ${roomType || "general"}. Desired mood: ${mood || "balanced and harmonious"}. Room image: ${roomImageUrl}`
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) throw new Error("AI generation failed");

    const aiData = await response.json();
    const content = aiData.choices[0].message.content;
    
    let paletteData;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      paletteData = JSON.parse(jsonMatch ? jsonMatch[0] : content);
    } catch {
      paletteData = { palette: [], mood: content };
    }

    // Save to DB
    const { data: saved, error: saveError } = await supabase
      .from("home_color_palettes")
      .insert({
        user_id: user.id,
        room_image_url: roomImageUrl,
        palette: paletteData,
        room_type: roomType,
        mood: mood,
      })
      .select()
      .single();

    if (saveError) throw saveError;

    // Decrement credits
    await supabase
      .from("decor_subscriptions")
      .update({ designs_used: credits.designs_used + 1 })
      .eq("user_id", user.id);

    return new Response(JSON.stringify({ success: true, data: saved, paletteData }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
