import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, description } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log(`Generating paint-by-numbers images for: ${title}`);

    // Generate colored reference image
    const coloredResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
            content: `Create a colorful, cute illustration for children: ${title}${description ? ` - ${description}` : ''}.

Requirements:
- Bright, vibrant colors
- Simple shapes and clear outlines
- Child-friendly, cute style
- High quality illustration
- 800x600 pixels`
          }
        ],
        modalities: ["image", "text"]
      }),
    });

    if (!coloredResponse.ok) {
      const errorText = await coloredResponse.text();
      console.error("AI Gateway error for colored image:", coloredResponse.status, errorText);
      throw new Error(`AI Gateway error: ${coloredResponse.status}`);
    }

    const coloredData = await coloredResponse.json();
    const coloredImageUrl = coloredData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!coloredImageUrl) {
      throw new Error("No colored image generated");
    }

    // Generate black and white paint-by-numbers template
    const templateResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
            content: `Create a black and white paint-by-numbers template for children: ${title}${description ? ` - ${description}` : ''}.

CRITICAL Requirements:
- BLACK OUTLINES on WHITE background ONLY
- NO colors, completely black and white
- 8 distinct regions, each with a number (1-8) inside
- Numbers should be LARGE and clearly visible in each region
- Simple shapes suitable for children
- Clear borders between regions
- Each number should appear multiple times across the image
- Line art style, coloring book template
- 800x600 pixels`
          }
        ],
        modalities: ["image", "text"]
      }),
    });

    if (!templateResponse.ok) {
      const errorText = await templateResponse.text();
      console.error("AI Gateway error for template:", templateResponse.status, errorText);
      throw new Error(`AI Gateway error: ${templateResponse.status}`);
    }

    const templateData = await templateResponse.json();
    const templateImageUrl = templateData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!templateImageUrl) {
      throw new Error("No template image generated");
    }

    console.log("Successfully generated both paint-by-numbers images");

    return new Response(
      JSON.stringify({ 
        coloredImageUrl,
        templateImageUrl 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );

  } catch (error) {
    console.error("Error in generate-paint-by-numbers:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});
