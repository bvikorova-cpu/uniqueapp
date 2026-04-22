import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { requireAiCredits } from "../_shared/credit-check.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { withRateLimit, RATE_LIMITS } from "../_shared/rate-limit.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function fetchImageAsBase64(url: string): Promise<string> {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  let binary = '';
  for (let i = 0; i < uint8Array.length; i++) {
    binary += String.fromCharCode(uint8Array[i]);
  }
  return btoa(binary);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    const __auth = await requireAiCredits(req, corsHeaders, { credits: 5, usageType: "coloring_page" });
    if (__auth.errorResponse) return __auth.errorResponse;
    const __deduct = __auth.deduct!;
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    
    if (!user?.email) {
      throw new Error("User not authenticated");
    }

    // Rate limit check
    const rateLimitResponse = await withRateLimit(req, RATE_LIMITS.ai_generation, corsHeaders, user.id);
    if (rateLimitResponse) return rateLimitResponse;

    const { imageUrl, difficulty = 'medium' } = await req.json();
    console.log("Generating coloring page for user:", user.id);

    const { data: adminCheck, error: adminError } = await supabaseClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (adminError) {
      console.error("Error checking admin status:", adminError);
      return new Response(
        JSON.stringify({ error: `Database error: ${adminError.message}` }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    const isAdmin = !!adminCheck;
    console.log("User is admin:", isAdmin);

    let creditsData;
    if (!isAdmin) {
      const { data, error: creditsError } = await supabaseClient
        .from("coloring_credits")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (creditsError) {
        console.error("Error fetching credits:", creditsError);
        return new Response(
          JSON.stringify({ error: `Credits error: ${creditsError.message}` }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }

      if (!data || data.credits_remaining < 1) {
        return new Response(
          JSON.stringify({ error: "Insufficient credits. Please purchase a plan." }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 402 }
        );
      }
      creditsData = data;
    } else {
      creditsData = {
        tier: 'premium',
        credits_remaining: 999999
      };
    }

    const isUltraHD = creditsData.tier === 'premium';
    const resolution = isUltraHD ? 2048 : 1024;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured. Please contact support." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    const prompt = `Transform this image into a clean, professional coloring page with clear black outlines. 
    Create a ${difficulty} difficulty level with ${difficulty === 'easy' ? 'simple, bold lines' : difficulty === 'medium' ? 'moderate detail' : 'intricate, detailed lines'}. 
    Make it perfect for printing and coloring. Black and white only, no shading, just clean outlines.`;

    console.log("Fetching original image...");
    const imageBase64 = await fetchImageAsBase64(imageUrl);

    const binaryString = atob(imageBase64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const imageBlob = new Blob([bytes], { type: 'image/png' });
    
    const formData = new FormData();
    formData.append('image', imageBlob, 'image.png');
    formData.append('prompt', prompt);
    formData.append('model', 'gpt-image-1');
    formData.append('size', '1024x1024');

    console.log("Calling OpenAI API...");

    const aiResponse = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
      },
      body: formData,
    });

    console.log("OpenAI response status:", aiResponse.status);

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("OpenAI API error:", aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 429 }
        );
      }
      return new Response(
        JSON.stringify({ error: `AI service error: ${errorText}` }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    const aiData = await aiResponse.json();
    console.log("OpenAI response received");
    
    const base64Image = aiData.data?.[0]?.b64_json;

    if (!base64Image) {
      console.error("No image in OpenAI response:", JSON.stringify(aiData));
      return new Response(
        JSON.stringify({ error: "Failed to generate image. Please try again." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    const generatedImageUrl = `data:image/png;base64,${base64Image}`;
    console.log("Generated coloring page successfully");

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

    if (creditsData.tier !== 'premium' && !isAdmin) {
      const { error: updateError } = await supabaseClient
        .from("coloring_credits")
        .update({ credits_remaining: creditsData.credits_remaining - 1 })
        .eq("user_id", user.id);

      if (updateError) {
        console.error("Error updating credits:", updateError);
      }
    }

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
