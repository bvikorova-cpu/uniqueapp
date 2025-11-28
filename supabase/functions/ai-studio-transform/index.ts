import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TRANSFORMATION_PROMPTS: Record<string, string> = {
  // Christmas themes
  "christmas-polar": "Transform this person into a magical Christmas scene where they are wearing a cozy red Santa outfit with white fur trim and holding an adorable white polar bear cub. Add snowy winter background with a decorated Christmas tree, golden sparkles, and warm festive lighting. Keep the person's face exactly the same.",
  "christmas-tree": "Transform this person into an elegant Christmas portrait. Dress them in a beautiful sparkling red dress or suit, standing next to a gorgeously decorated Christmas tree with golden ornaments. Add cozy fireplace in background with warm festive lighting. Keep the person's face exactly the same.",
  "christmas-elf": "Transform this person into Santa's magical helper elf. Add pointy elf hat, festive red and green outfit, and place them in Santa's North Pole workshop with toys and Christmas decorations. Add magical sparkles. Keep the person's face exactly the same.",
  "christmas-cozy": "Transform this person into a cozy Christmas scene. Dress them in warm knitted sweater, holding a cup of hot cocoa, with snowy window background and fairy lights. Add warm cabin atmosphere. Keep the person's face exactly the same.",
  
  // Valentine themes
  "valentine-roses": "Transform this person into a romantic Valentine portrait surrounded by beautiful red roses and floating pink hearts. Dress them in elegant red attire with soft dreamy pink lighting. Add romantic atmosphere. Keep the person's face exactly the same.",
  "valentine-cupid": "Transform this person into a beautiful Cupid angel with soft white wings and a pink halo. Surround with floating hearts, soft pink and red background. Add dreamy romantic lighting. Keep the person's face exactly the same.",
  "valentine-dinner": "Transform this person into an elegant romantic dinner setting. Dress them in fancy pink or red gown/suit at a candlelit table with champagne, heart-shaped bokeh lights in background. Keep the person's face exactly the same.",
  "valentine-garden": "Transform this person into a romantic cherry blossom garden. Surround with beautiful pink flowers, falling petals forming heart shapes, soft sunset lighting. Keep the person's face exactly the same.",
  
  // Easter themes
  "easter-bunny": "Transform this person into a cute Easter scene with bunny ears headband, surrounded by colorful Easter eggs and adorable white bunnies in a flower meadow. Add soft spring sunshine. Keep the person's face exactly the same.",
  "easter-spring": "Transform this person into a beautiful spring portrait with a flower crown of tulips and daffodils. Surround with blooming spring flowers, butterflies, and soft pastel colors. Keep the person's face exactly the same.",
  
  // Halloween themes
  "halloween-vampire": "Transform this person into an elegant vampire portrait. Add pale skin, subtle fangs, gothic castle background with full moon and flying bats. Add dramatic mysterious lighting. Keep the person's face exactly the same but vampiric.",
  "halloween-witch": "Transform this person into a beautiful magical witch with an enchanted purple glowing hat. Add pumpkins, mystical forest background, magical sparkles and purple lighting. Keep the person's face exactly the same.",
  
  // Glamour themes
  "glamour-hollywood": "Transform this person into a Hollywood red carpet glamour portrait. Add professional studio lighting, golden sparkles, elegant styling, and red carpet background. Magazine-quality aesthetics. Keep the person's face exactly the same.",
  "fairytale-princess": "Transform this person into a magical Disney-style princess. Dress them in a sparkling ball gown, add a tiara, place in front of enchanted castle with magical lights and sparkles. Keep the person's face exactly the same.",
  
  // Season themes
  "summer-beach": "Transform this person into a tropical beach paradise scene. Add golden sunset, palm trees, ocean waves, and summer vacation vibes. Keep the person's face exactly the same.",
  "winter-snow": "Transform this person into an elegant winter wonderland portrait. Dress in luxurious white fur coat, surrounded by falling snowflakes, frozen trees, and magical icy blue lighting. Keep the person's face exactly the same.",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl, transformationType } = await req.json();
    
    if (!imageUrl || !transformationType) {
      return new Response(
        JSON.stringify({ error: "Image URL and transformation type are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Get user from auth header
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData.user) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = userData.user.id;

    // Check user credits
    const { data: credits, error: creditsError } = await supabaseClient
      .from("ai_studio_credits")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (creditsError) {
      console.error("Credits error:", creditsError);
      throw new Error("Failed to check credits");
    }

    if (!credits || credits.credits_remaining < 1) {
      return new Response(
        JSON.stringify({ error: "Insufficient credits. Please purchase more credits." }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const prompt = TRANSFORMATION_PROMPTS[transformationType] || "Transform this photo into a beautiful artistic portrait with enhanced lighting and magical atmosphere. Keep the person exactly the same.";
    console.log(`Transforming image with type: ${transformationType}`);

    // Call Lovable AI for image transformation
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: imageUrl } }
            ]
          }
        ],
        modalities: ["image", "text"]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI service unavailable. Please contact support." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error("Failed to transform image");
    }

    const data = await response.json();
    const transformedImageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!transformedImageUrl) {
      throw new Error("No transformed image generated");
    }

    // Deduct credit
    const { error: updateError } = await supabaseClient
      .from("ai_studio_credits")
      .update({ 
        credits_remaining: credits.credits_remaining - 1,
        updated_at: new Date().toISOString()
      })
      .eq("user_id", userId);

    if (updateError) {
      console.error("Failed to deduct credit:", updateError);
    }

    // Save transformation history
    await supabaseClient
      .from("ai_studio_transformations")
      .insert({
        user_id: userId,
        original_image_url: imageUrl,
        transformed_image_url: transformedImageUrl,
        transformation_type: transformationType,
        status: "completed",
        credits_used: 1
      });

    console.log(`Transformation completed for user ${userId}`);

    return new Response(
      JSON.stringify({ 
        transformedImageUrl,
        creditsRemaining: credits.credits_remaining - 1
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in ai-studio-transform:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
