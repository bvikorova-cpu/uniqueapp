import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TRANSFORMATION_PROMPTS: Record<string, string> = {
  // Holiday themes
  christmas: "Transform this photo into a magical Christmas scene. Add festive elements like soft snow, warm golden lights, Christmas decorations, and a cozy winter atmosphere. Keep the person exactly the same but enhance with holiday magic.",
  valentine: "Transform this photo into a romantic Valentine's Day scene. Add soft pink and red tones, floating hearts, rose petals, and a dreamy romantic atmosphere. Keep the person exactly the same.",
  easter: "Transform this photo into a beautiful Easter spring scene. Add pastel colors, spring flowers, Easter eggs, butterflies, and a fresh spring atmosphere. Keep the person exactly the same.",
  halloween: "Transform this photo into a mystical Halloween scene. Add spooky but elegant elements like autumn leaves, pumpkins, moonlight, and a magical dark atmosphere. Keep the person exactly the same.",
  thanksgiving: "Transform this photo into a warm Thanksgiving harvest scene. Add autumn colors, golden leaves, harvest elements, and warm cozy lighting. Keep the person exactly the same.",
  newYear: "Transform this photo into a glamorous New Year's Eve celebration scene. Add sparkles, fireworks, champagne bubbles, golden confetti, and festive party atmosphere. Keep the person exactly the same.",
  stPatricks: "Transform this photo into a magical St. Patrick's Day scene. Add green tones, shamrocks, rainbows, gold coins, and Irish charm. Keep the person exactly the same.",
  independence: "Transform this photo into a patriotic Independence Day scene. Add red, white and blue elements, fireworks, stars, and American celebration atmosphere. Keep the person exactly the same.",
  
  // Glamour themes
  glamour: "Transform this photo into a high-fashion glamour portrait. Add professional studio lighting, soft glow, flawless skin, and magazine-quality aesthetics. Make it look like a professional photoshoot.",
  vintage: "Transform this photo into an elegant vintage Hollywood style. Add classic black and white or sepia tones with soft focus, old Hollywood glamour, and timeless elegance.",
  fairytale: "Transform this photo into a magical fairytale scene. Add enchanted forest elements, soft magical lighting, sparkles, and dreamy fantasy atmosphere. Keep the person exactly the same.",
  royal: "Transform this photo into a royal palace setting. Add luxurious elements, golden accents, elegant drapery, and regal atmosphere fit for royalty. Keep the person exactly the same.",
  summer: "Transform this photo into a perfect summer beach paradise. Add golden sunshine, tropical vibes, ocean breeze feel, and warm summer glow. Keep the person exactly the same.",
  winter: "Transform this photo into a magical winter wonderland. Add beautiful snow, ice crystals, northern lights, and enchanting winter atmosphere. Keep the person exactly the same.",
  spring: "Transform this photo into a blooming spring garden. Add cherry blossoms, colorful flowers, butterflies, and fresh spring morning light. Keep the person exactly the same.",
  autumn: "Transform this photo into a cozy autumn scene. Add falling golden leaves, warm sunset light, pumpkin spice vibes, and cozy fall atmosphere. Keep the person exactly the same.",
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

    const prompt = TRANSFORMATION_PROMPTS[transformationType] || TRANSFORMATION_PROMPTS.glamour;
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
