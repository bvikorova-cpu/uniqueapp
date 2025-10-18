import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    
    if (!user?.email) {
      throw new Error("User not authenticated");
    }

    const { imageUrl, difficulty = 'medium' } = await req.json();
    console.log("Generating coloring page for user:", user.id);

    // Check credits
    const { data: creditsData, error: creditsError } = await supabaseClient
      .from("coloring_credits")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (creditsError || !creditsData || creditsData.credits_remaining < 1) {
      return new Response(
        JSON.stringify({ error: "Insufficient credits. Please purchase a plan." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 402 }
      );
    }

    // Check if premium tier for quality
    const isUltraHD = creditsData.tier === 'premium';
    const resolution = isUltraHD ? 2048 : 1024;

    // Generate coloring page using Lovable AI
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const prompt = `Transform this image into a clean, professional coloring page with clear black outlines. 
    Create a ${difficulty} difficulty level with ${difficulty === 'easy' ? 'simple, bold lines' : difficulty === 'medium' ? 'moderate detail' : 'intricate, detailed lines'}. 
    Make it perfect for printing and coloring. Black and white only, no shading, just clean outlines.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
      })
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 429 }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI service payment required. Please contact support." }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 402 }
        );
      }
      const errorText = await aiResponse.text();
      console.error("AI Gateway error:", aiResponse.status, errorText);
      throw new Error("Failed to generate coloring page");
    }

    const aiData = await aiResponse.json();
    const generatedImageUrl = aiData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!generatedImageUrl) {
      throw new Error("No image generated");
    }

    // Create coloring page record
    const { data: coloringPage, error: pageError } = await supabaseClient
      .from("coloring_pages")
      .insert({
        user_id: user.id,
        original_image_url: imageUrl,
        processed_image_url: generatedImageUrl,
        difficulty: difficulty,
        status: 'completed',
        credits_used: 1,
        metadata: { resolution, tier: creditsData.tier }
      })
      .select()
      .single();

    if (pageError) {
      console.error("Error creating coloring page:", pageError);
      throw pageError;
    }

    // Deduct credit (unless unlimited premium)
    if (creditsData.tier !== 'premium') {
      const { error: updateError } = await supabaseClient
        .from("coloring_credits")
        .update({ credits_remaining: creditsData.credits_remaining - 1 })
        .eq("user_id", user.id);

      if (updateError) {
        console.error("Error updating credits:", updateError);
      }
    }

    // Log usage
    await supabaseClient
      .from("ai_usage_history")
      .insert({
        user_id: user.id,
        usage_type: "coloring_page_generation",
        credits_used: 1,
        description: `Generated ${difficulty} coloring page`
      });

    return new Response(
      JSON.stringify({
        success: true,
        coloringPage,
        creditsRemaining: creditsData.tier === 'premium' ? 'unlimited' : creditsData.credits_remaining - 1
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error) {
    console.error("Error in generate-coloring-page:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to generate coloring page";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
