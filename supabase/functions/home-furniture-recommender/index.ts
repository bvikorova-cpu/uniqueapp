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

    const { roomImageUrl, roomType, style, budget } = await req.json();
    if (!roomImageUrl) throw new Error("Room image URL is required");

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
            content: `You are an expert interior designer and furniture consultant. Analyze rooms and recommend specific furniture pieces. Return JSON:
{
  "recommendations": [
    {
      "name": "Product Name",
      "category": "Sofa/Table/Chair/etc",
      "description": "Why this fits the room",
      "estimated_price": "€XXX-€XXX",
      "where_to_buy": "Store suggestion",
      "priority": "essential/recommended/optional",
      "dimensions": "approximate dimensions"
    }
  ],
  "layout_tips": "How to arrange furniture",
  "space_optimization": "Tips for maximizing space",
  "style_notes": "Style cohesion notes"
}`
          },
          {
            role: "user",
            content: `Analyze this room and recommend furniture. Room type: ${roomType || "living room"}. Style: ${style || "modern"}. Budget: ${budget || "medium"}. Room image: ${roomImageUrl}`
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) throw new Error("AI generation failed");

    const aiData = await response.json();
    const content = aiData.choices[0].message.content;
    
    let recData;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      recData = JSON.parse(jsonMatch ? jsonMatch[0] : content);
    } catch {
      recData = { recommendations: [], layout_tips: content };
    }

    const { data: saved, error: saveError } = await supabase
      .from("home_furniture_recommendations")
      .insert({
        user_id: user.id,
        room_image_url: roomImageUrl,
        room_type: roomType,
        style,
        budget,
        recommendations: recData,
      })
      .select()
      .single();

    if (saveError) throw saveError;

    await supabase
      .from("decor_subscriptions")
      .update({ designs_used: credits.designs_used + 1 })
      .eq("user_id", user.id);

    return new Response(JSON.stringify({ success: true, data: saved, recommendations: recData }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
