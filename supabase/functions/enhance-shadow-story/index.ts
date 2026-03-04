import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabaseClient.auth.getUser(token);
    const user = userData.user;
    if (!user) throw new Error("Not authenticated");

    const { title, content } = await req.json();
    if (!title || !content) throw new Error("Title and content required");

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY not configured");

    // Generate atmospheric AI images
    const imagePrompts = [
      `Dark atmospheric horror scene: ${title}. Ultra high resolution, cinematic lighting, eerie mood`,
      `Creepy environment from horror story: ${content.substring(0, 200)}. Dark shadows, ominous atmosphere`,
      `Terrifying moment: ${title}. Gothic horror aesthetic, dramatic contrast`
    ];

    const imageUrls: string[] = [];

    for (const prompt of imagePrompts) {
      try {
        const response = await fetch("https://api.openai.com/v1/images/generations", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "dall-e-3",
            prompt: prompt,
            n: 1,
            size: "1024x1024",
            response_format: "url"
          })
        });

        if (response.ok) {
          const data = await response.json();
          const imageUrl = data.data?.[0]?.url;
          if (imageUrl) {
            imageUrls.push(imageUrl);
          }
        }
      } catch (err) {
        console.error("Image generation error:", err);
      }
    }

    // Save story with AI enhancements
    const { data: story, error: storyError } = await supabaseClient
      .from('shadow_stories')
      .insert({
        user_id: user.id,
        title,
        content,
        ai_images: imageUrls,
        is_anonymous: true
      })
      .select()
      .single();

    if (storyError) throw storyError;

    return new Response(JSON.stringify({ 
      success: true, 
      story_id: story.id,
      images_generated: imageUrls.length 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Enhance story error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
